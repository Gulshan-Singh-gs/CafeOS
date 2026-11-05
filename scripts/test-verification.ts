import { db } from '../src/lib/db';
import { OrderSubmissionPayload } from '../src/lib/types';

async function runVerification() {
  console.log('==============================================');
  console.log('🚀 RUNNING CAFEOS MVP ACCEPTANCE VERIFICATION');
  console.log('==============================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Reset demo data to ensure clean state
  await db.resetDemoData();
  const cafes = await db.getCafes();
  assert(cafes.length >= 2, 'Cafes loaded (at least 2 tenants seeded)');

  const kuraliCafe = await db.getCafeBySlug('kurali-chai-bakehouse');
  assert(kuraliCafe !== null && kuraliCafe.city === 'Kurali', 'Kurali flagship cafe exists and is located in Kurali, Punjab');

  // 2. Verify Menu Items & Categories
  const categories = await db.getCategories(kuraliCafe!.id);
  assert(categories.length >= 5, `Categories for Kurali exist (Found: ${categories.length})`);

  const menuItems = await db.getMenuItems(kuraliCafe!.id);
  assert(menuItems.length >= 10, `Menu items for Kurali exist (Found: ${menuItems.length})`);

  const chaiItem = menuItems.find(m => m.name.includes('Adrak Elaichi'));
  assert(chaiItem !== undefined && chaiItem.price === 40, 'Kulhad Adrak Elaichi Chai is priced at ₹40 INR');

  // 3. Test Order Creation with Authoritative Server-Side Pricing
  const newOrderPayload: OrderSubmissionPayload = {
    cafe_id: kuraliCafe!.id,
    customer_name: 'Simranjeet Singh',
    customer_phone: '+91 98765 00001',
    dining_option: 'dine_in',
    table_number: 'Table 7',
    special_instructions: 'Extra adrak in chai, no onions in toastie',
    items: [
      { menu_item_id: chaiItem!.id, quantity: 2 }, // 2 * 40 = 80
      { menu_item_id: menuItems.find(m => m.name.includes('Amritsari Paneer'))!.id, quantity: 1 }, // 1 * 180 = 180
    ],
  };

  const createdOrder = await db.createOrder(newOrderPayload);
  assert(createdOrder.order_number.startsWith('CF-'), `Order created with unique order number: ${createdOrder.order_number}`);
  assert(createdOrder.total === 260, `Authoritative total strictly computed by server (Expected ₹260, Got ₹${createdOrder.total})`);
  assert(createdOrder.status === 'received', 'Initial order status is "received"');

  // 4. Test Unavailable / Sold Out item rejection
  const soldOutItem = menuItems.find(m => !m.is_available);
  if (soldOutItem) {
    try {
      await db.createOrder({
        cafe_id: kuraliCafe!.id,
        customer_name: 'Test Customer',
        customer_phone: '9812345678',
        items: [{ menu_item_id: soldOutItem.id, quantity: 1 }],
      });
      assert(false, 'Should reject order for sold out item');
    } catch (err: unknown) {
      assert(true, 'Server successfully rejected order for sold-out item');
    }
  }

  // 5. Test Status Transitions
  const preparingOrder = await db.updateOrderStatus(createdOrder.id, 'preparing');
  assert(preparingOrder?.status === 'preparing', 'Order status successfully transitioned: received -> preparing');

  const readyOrder = await db.updateOrderStatus(createdOrder.id, 'ready');
  assert(readyOrder?.status === 'ready', 'Order status successfully transitioned: preparing -> ready');

  const completedOrder = await db.updateOrderStatus(createdOrder.id, 'completed');
  assert(completedOrder?.status === 'completed', 'Order status successfully transitioned: ready -> completed');

  // 6. Test Multi-Tenant Isolation
  const pinjoreCafe = await db.getCafeBySlug('pinjore-brews');
  assert(pinjoreCafe !== null, 'Pinjore secondary cafe tenant exists');

  const kuraliOrders = await db.getOrders(kuraliCafe!.id);
  const pinjoreOrders = await db.getOrders(pinjoreCafe!.id);

  const crossContamination = kuraliOrders.some(o => o.cafe_id !== kuraliCafe!.id) ||
                            pinjoreOrders.some(o => o.cafe_id !== pinjoreCafe!.id);
  assert(!crossContamination, 'Zero cross-tenant contamination: Kurali orders and Pinjore orders are strictly isolated');

  // 7. Test Menu Edits & Persistence
  const originalPrice = chaiItem!.price;
  const updatedItem = await db.updateMenuItem(chaiItem!.id, { price: 45, is_available: false });
  assert(updatedItem?.price === 45 && updatedItem?.is_available === false, 'Menu item price edited to ₹45 and marked sold-out');

  // Verify fetch returns updated values
  const reloadedItem = await db.getMenuItem(chaiItem!.id);
  assert(reloadedItem?.price === 45 && reloadedItem?.is_available === false, 'Menu edits persist across queries');

  // 8. Test Demo Reset Functionality
  await db.resetDemoData();
  const resetItem = await db.getMenuItem(chaiItem!.id);
  assert(resetItem?.price === originalPrice && resetItem?.is_available === true, 'Reset Demo Data restored initial pricing and stock status');

  console.log(`\n==============================================`);
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`==============================================\n`);
}

runVerification().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

