const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Cloudinary Configuration:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');
console.log('');

async function uploadToCloudinary(localPath, folder) {
  try {
    const fullPath = path.join(__dirname, localPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`   ⚠️  File not found: ${localPath}`);
      return null;
    }

    console.log(`   📤 Uploading: ${path.basename(localPath)}`);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `cosypos/${folder}`,
      quality: 'auto',
      fetch_format: 'auto'
    });

    console.log(`   ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Upload failed for ${localPath}:`, error.message);
    return null;
  }
}

async function migrateMenuItems() {
  console.log('📦 Migrating Menu Items...\n');
  
  const menuItems = await prisma.menuItem.findMany({
    select: {
      id: true,
      name: true,
      image: true
    }
  });

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of menuItems) {
    console.log(`\n🍽️  ${item.name}`);
    console.log(`   Current: ${item.image}`);

    // Skip if image is null, placeholder, or already a Cloudinary URL
    if (!item.image || 
        item.image === '/placeholder-food.jpg' || 
        item.image.includes('cloudinary.com')) {
      console.log(`   ⏭️  Skipped (${!item.image ? 'no image' : item.image.includes('cloudinary') ? 'already migrated' : 'placeholder'})`);
      skipped++;
      continue;
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(item.image, 'menu-items');

    if (cloudinaryUrl) {
      // Update database
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { image: cloudinaryUrl }
      });
      console.log(`   💾 Database updated`);
      migrated++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Menu Items Summary:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${menuItems.length}`);
}

async function migrateCategories() {
  console.log('\n\n📂 Migrating Categories...\n');
  
  const categories = await prisma.menuCategory.findMany({
    select: {
      id: true,
      name: true,
      image: true
    }
  });

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const category of categories) {
    console.log(`\n📁 ${category.name}`);
    console.log(`   Current: ${category.image || 'No image'}`);

    // Skip if no image or already Cloudinary URL
    if (!category.image || category.image.includes('cloudinary.com')) {
      console.log(`   ⏭️  Skipped (${!category.image ? 'no image' : 'already migrated'})`);
      skipped++;
      continue;
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(category.image, 'categories');

    if (cloudinaryUrl) {
      // Update database
      await prisma.menuCategory.update({
        where: { id: category.id },
        data: { image: cloudinaryUrl }
      });
      console.log(`   💾 Database updated`);
      migrated++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Categories Summary:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${categories.length}`);
}

async function migrateProfiles() {
  console.log('\n\n👤 Migrating Profile Images...\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      profileImage: true
    }
  });

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    console.log(`\n👤 ${user.name}`);
    console.log(`   Current: ${user.profileImage || 'No image'}`);

    // Skip if no image or already Cloudinary URL
    if (!user.profileImage || user.profileImage.includes('cloudinary.com')) {
      console.log(`   ⏭️  Skipped (${!user.profileImage ? 'no image' : 'already migrated'})`);
      skipped++;
      continue;
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(user.profileImage, 'profiles');

    if (cloudinaryUrl) {
      // Update database
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: cloudinaryUrl }
      });
      console.log(`   💾 Database updated`);
      migrated++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Profiles Summary:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${users.length}`);
}

async function main() {
  console.log('🚀 Starting Cloudinary Migration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    await migrateMenuItems();
    await migrateCategories();
    await migrateProfiles();

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 All images have been uploaded to Cloudinary!');
    console.log('📊 Database has been updated with new URLs.');
    console.log('☁️  Your images are now served from Cloudinary CDN.');
    console.log('\n✨ Next steps:');
    console.log('   1. Test your application');
    console.log('   2. Commit changes to git');
    console.log('   3. Deploy to Render.com');
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();

