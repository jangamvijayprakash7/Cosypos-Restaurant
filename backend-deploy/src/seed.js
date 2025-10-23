const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default users...');

  // Create admin user
  const adminPassword = await bcrypt.hash('pass123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosypos.app' },
    update: {},
    create: {
      email: 'admin@cosypos.app',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '+1234567890'
    }
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@cosypos.app' },
    update: {},
    create: {
      email: 'staff@cosypos.app',
      passwordHash: staffPassword,
      name: 'Staff User',
      role: 'STAFF',
      phone: '+1234567891'
    }
  });

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@cosypos.app' },
    update: {},
    create: {
      email: 'customer@cosypos.app',
      passwordHash: customerPassword,
      name: 'Customer User',
      role: 'USER',
      phone: '+1234567892'
    }
  });

  console.log('Users created:', { admin: admin.email, staff: staff.email, customer: customer.email });

  // Create menu categories (use upsert to handle existing data)
  const pizzaCategory = await prisma.menuCategory.upsert({
    where: { name: 'Pizza' },
    update: {},
    create: { name: 'Pizza' }
  });

  const burgerCategory = await prisma.menuCategory.upsert({
    where: { name: 'Burger' },
    update: {},
    create: { name: 'Burger' }
  });

  const chickenCategory = await prisma.menuCategory.upsert({
    where: { name: 'Chicken' },
    update: {},
    create: { name: 'Chicken' }
  });

  const bakeryCategory = await prisma.menuCategory.upsert({
    where: { name: 'Bakery' },
    update: {},
    create: { name: 'Bakery' }
  });

  const beverageCategory = await prisma.menuCategory.upsert({
    where: { name: 'Beverage' },
    update: {},
    create: { name: 'Beverage' }
  });

  const seafoodCategory = await prisma.menuCategory.upsert({
    where: { name: 'Seafood' },
    update: {},
    create: { name: 'Seafood' }
  });

  // Create menu items
  const menuItems = [
    { name: 'Margherita Pizza', priceCents: 2800, categoryId: pizzaCategory.id },
    { name: 'Pepperoni Pizza', priceCents: 3200, categoryId: pizzaCategory.id },
    { name: 'Chicken Burger', priceCents: 2200, categoryId: burgerCategory.id },
    { name: 'Beef Burger', priceCents: 2500, categoryId: burgerCategory.id },
    { name: 'Roasted Chicken', priceCents: 5500, categoryId: chickenCategory.id },
    { name: 'Chicken Wings', priceCents: 3000, categoryId: chickenCategory.id },
    { name: 'Chocolate Cake', priceCents: 1500, categoryId: bakeryCategory.id },
    { name: 'Apple Pie', priceCents: 1800, categoryId: bakeryCategory.id },
    { name: 'Fresh Juice', priceCents: 1200, categoryId: beverageCategory.id },
    { name: 'Coffee', priceCents: 800, categoryId: beverageCategory.id },
    { name: 'Grilled Salmon', priceCents: 4500, categoryId: seafoodCategory.id },
    { name: 'Fish & Chips', priceCents: 4000, categoryId: seafoodCategory.id }
  ];

  for (const item of menuItems) {
    // Check if menu item already exists
    const existingItem = await prisma.menuItem.findFirst({
      where: { name: item.name }
    });
    
    if (!existingItem) {
      await prisma.menuItem.create({
        data: item
      });
    }
  }

  console.log('Menu categories and items created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
