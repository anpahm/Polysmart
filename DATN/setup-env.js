#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment files...\n');

// Function to copy env.example to .env
function setupEnvFile(sourcePath, targetPath, name) {
  try {
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Created ${name} .env file`);
      } else {
        console.log(`⚠️  ${name} .env file already exists, skipping...`);
      }
    } else {
      console.log(`❌ ${name} env.example file not found at ${sourcePath}`);
    }
  } catch (error) {
    console.error(`❌ Error creating ${name} .env file:`, error.message);
  }
}

// Setup environment files for each part
const envFiles = [
  {
    source: 'backend/env.example',
    target: 'backend/.env',
    name: 'Backend'
  },
  {
    source: 'frontend/env.example',
    target: 'frontend/.env.local',
    name: 'Frontend'
  },
  {
    source: 'admin/env.example',
    target: 'admin/.env.local',
    name: 'Admin Panel'
  }
];

envFiles.forEach(({ source, target, name }) => {
  setupEnvFile(source, target, name);
});

console.log('\n📝 Next steps:');
console.log('1. Edit the .env files with your actual values');
console.log('2. For backend: Update BANK_TOKEN with your web2m.com token');
console.log('3. For email: Set up Gmail app password');
console.log('4. For security: Change JWT_SECRET to a secure random string');
console.log('\n🔐 Important security notes:');
console.log('- Never commit .env files to version control');
console.log('- Keep your tokens and secrets secure');
console.log('- Use different values for development and production');
console.log('\n✨ Environment setup completed!'); 