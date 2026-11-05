import fs from 'fs';
import path from 'path';
import { Cafe, Category, MenuItem, Order, OrderItem, OrderStatus, OrderSubmissionPayload } from '../types';
import { SEED_CAFES, SEED_CATEGORIES, SEED_MENU_ITEMS, SEED_INITIAL_ORDERS } from './seedData';
import { getSupabaseAdmin } from '../supabase';

interface DatabaseSchema {
  cafes: Cafe[];
  categories: Category[];
  menu_items: MenuItem[];
  orders: Order[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'cafeos_store.json');

function ensureDataFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: DatabaseSchema = {
        cafes: [...SEED_CAFES],
        categories: [...SEED_CATEGORIES],
        menu_items: [...SEED_MENU_ITEMS],
        orders: [...SEED_INITIAL_ORDERS],
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading local data store, falling back to seed:', err);
    return {
      cafes: [...SEED_CAFES],
      categories: [...SEED_CATEGORIES],
      menu_items: [...SEED_MENU_ITEMS],
      orders: [...SEED_INITIAL_ORDERS],
    };
  }
}

function persistData(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to local data store:', err);
  }
}

// Check if live Supabase is active
const supabase = getSupabaseAdmin();

export const db = {
  // Cafes
  async getCafes(): Promise<Cafe[]> {
    if (supabase) {
      const { data, error } = await supabase.from('cafes').select('*').eq('is_active', true);
      if (!error && data) return data as Cafe[];
    }
    const store = ensureDataFile();
    return store.cafes.filter(c => c.is_active);
  },

  async getCafeBySlug(slug: string): Promise<Cafe | null> {
    if (supabase) {
      const { data, error } = await supabase.from('cafes').select('*').eq('slug', slug).single();
      if (!error && data) return data as Cafe;
    }
    const store = ensureDataFile();
    return store.cafes.find(c => c.slug === slug && c.is_active) || null;
  },

  async getCafeById(id: string): Promise<Cafe | null> {
    if (supabase) {
      const { data, error } = await supabase.from('cafes').select('*').eq('id', id).single();
      if (!error && data) return data as Cafe;
    }
    const store = ensureDataFile();
    return store.cafes.find(c => c.id === id) || null;
  },

  // Categories
  async getCategories(cafeId: string): Promise<Category[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as Category[];
    }
    const store = ensureDataFile();
    return store.categories
      .filter(c => c.cafe_id === cafeId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  // Menu Items
  async getMenuItems(cafeId: string): Promise<MenuItem[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('name', { ascending: true });
      if (!error && data) return data as MenuItem[];
    }
    const store = ensureDataFile();
    return store.menu_items.filter(m => m.cafe_id === cafeId);
  },

  async getMenuItem(id: string): Promise<MenuItem | null> {
    const store = ensureDataFile();
    return store.menu_items.find(m => m.id === id) || null;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const store = ensureDataFile();
    const index = store.menu_items.findIndex(m => m.id === id);
    if (index === -1) return null;

    store.menu_items[index] = {
      ...store.menu_items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    persistData(store);
    return store.menu_items[index];
  },

  async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const store = ensureDataFile();
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.menu_items.push(newItem);
    persistData(store);
    return newItem;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const store = ensureDataFile();
    const initialLen = store.menu_items.length;
    store.menu_items = store.menu_items.filter(m => m.id !== id);
    if (store.menu_items.length < initialLen) {
      persistData(store);
      return true;
    }
    return false;
  },

  // Authoritative Order Calculation & Creation
  // CRITICAL SECURITY RULE: Client cannot submit prices. Server calculates total using database prices!
  async createOrder(payload: OrderSubmissionPayload): Promise<Order> {
    const store = ensureDataFile();
    const cafe = store.cafes.find(c => c.id === payload.cafe_id);
    if (!cafe) {
      throw new Error(`Café with ID ${payload.cafe_id} not found.`);
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    if (!payload.customer_name?.trim() || !payload.customer_phone?.trim()) {
      throw new Error('Customer name and phone number are required.');
    }

    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CF-${randomSuffix}`;

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of payload.items) {
      if (reqItem.quantity <= 0) continue;

      // Authoritative lookup from stored menu items
      const menuItem = store.menu_items.find(
        m => m.id === reqItem.menu_item_id && m.cafe_id === payload.cafe_id
      );

      if (!menuItem) {
        throw new Error(`Item ${reqItem.menu_item_id} does not exist or does not belong to this café.`);
      }

      if (!menuItem.is_available) {
        throw new Error(`"${menuItem.name}" is currently sold out and cannot be ordered.`);
      }

      const itemTotal = Number((menuItem.price * reqItem.quantity).toFixed(2));
      subtotal += itemTotal;

      orderItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        order_id: orderId,
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        item_price: menuItem.price, // Server verified price
        quantity: reqItem.quantity,
        subtotal: itemTotal,
        notes: reqItem.notes,
      });
    }

    if (orderItems.length === 0) {
      throw new Error('No valid items found in order.');
    }

    const tax = 0; // Can be configured per cafe
    const total = Number((subtotal + tax).toFixed(2));

    const newOrder: Order = {
      id: orderId,
      cafe_id: payload.cafe_id,
      order_number: orderNumber,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      special_instructions: payload.special_instructions?.trim() || undefined,
      status: 'received',
      subtotal,
      tax,
      total,
      payment_status: 'pending',
      dining_option: payload.dining_option || 'dine_in',
      table_number: payload.table_number?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
    };

    store.orders.unshift(newOrder); // newest first
    persistData(store);
    return newOrder;
  },

  // Scoped Orders (Enforces multi-tenant isolation by cafeId)
  async getOrders(cafeId: string): Promise<Order[]> {
    const store = ensureDataFile();
    return store.orders.filter(o => o.cafe_id === cafeId);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const store = ensureDataFile();
    return store.orders.find(o => o.id === orderId) || null;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const store = ensureDataFile();
    const order = store.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.updated_at = new Date().toISOString();
    persistData(store);
    return order;
  },

  // Reset Demo Data
  async resetDemoData(): Promise<void> {
    const resetStore: DatabaseSchema = {
      cafes: JSON.parse(JSON.stringify(SEED_CAFES)),
      categories: JSON.parse(JSON.stringify(SEED_CATEGORIES)),
      menu_items: JSON.parse(JSON.stringify(SEED_MENU_ITEMS)),
      orders: JSON.parse(JSON.stringify(SEED_INITIAL_ORDERS)),
    };
    persistData(resetStore);
  }
};

