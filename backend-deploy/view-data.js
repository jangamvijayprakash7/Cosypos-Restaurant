/**
 * Quick Database Viewer
 * Run: node view-data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function viewData() {
  try {
    console.log('\n📊 DATABASE OVERVIEW\n');
    console.log('='.repeat(60));

    // View Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    console.log('\n👥 USERS (' + users.length + ' total)');
    console.log('-'.repeat(60));
    users.forEach(user => {
      console.log(`  ${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.name}`);
    });

    // View Categories
    const categories = await prisma.menuCategory.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
    console.log('\n📁 CATEGORIES (' + categories.length + ' total)');
    console.log('-'.repeat(60));
    categories.forEach(cat => {
      console.log(`  ${cat.name.padEnd(20)} | ${cat._count.items} items`);
    });

    // View Menu Items
    const menuItems = await prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true,
        stock: true,
        available: true,
        category: {
          select: { name: true }
        }
      }
    });
    console.log('\n🍽️  MENU ITEMS (' + menuItems.length + ' total)');
    console.log('-'.repeat(60));
    menuItems.forEach(item => {
      const price = `$${(item.priceCents / 100).toFixed(2)}`.padEnd(8);
      const stock = `Stock: ${item.stock}`.padEnd(12);
      const status = item.available ? '✅' : '❌';
      const category = (item.category?.name || 'No category').padEnd(20);
      console.log(`  ${status} ${price} ${stock} ${category} | ${item.name}`);
    });

    // View Orders
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true }
        },
        items: {
          include: {
            menuItem: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Show last 10 orders
    });
    console.log('\n🛒 RECENT ORDERS (' + orders.length + ' shown)');
    console.log('-'.repeat(60));
    orders.forEach(order => {
      const total = `$${(order.totalCents / 100).toFixed(2)}`.padEnd(8);
      const status = order.status.padEnd(12);
      const customer = (order.user?.name || 'Guest').padEnd(20);
      const itemCount = order.items.length + ' items';
      console.log(`  ${status} ${total} ${customer} | ${itemCount}`);
    });

    // View Tables
    const tables = await prisma.table.findMany();
    console.log('\n🪑 TABLES (' + tables.length + ' total)');
    console.log('-'.repeat(60));
    tables.forEach(table => {
      console.log(`  ${table.label.padEnd(10)} | Floor ${table.floor} | Capacity: ${table.capacity}`);
    });

    // View Inventory Items
    const inventory = await prisma.inventoryItem.findMany({
      take: 10
    });
    console.log('\n📦 INVENTORY ITEMS (' + inventory.length + ' shown)');
    console.log('-'.repeat(60));
    inventory.forEach(item => {
      const qty = `Qty: ${item.quantity}`.padEnd(12);
      const unit = item.unit.padEnd(10);
      console.log(`  ${qty} ${unit} | ${item.name}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Data retrieval complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewData();





