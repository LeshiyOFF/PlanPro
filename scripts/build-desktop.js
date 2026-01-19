#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function buildDesktop() {
  console.log('🚀 Building ProjectLibre Desktop (Electron + React + Java)...');
  
  try {
    // 1. Build Java first
    console.log('☕ Building Java components...');
    execSync('npm run build:java', { stdio: 'inherit' });
    
    // 2. Build frontend  
    console.log('⚛️ Building React frontend...');
    execSync('npm run build:frontend', { stdio: 'inherit' });
    
    // 3. Build Electron
    console.log('📦 Building Electron...');
    execSync('npm run build:electron', { stdio: 'inherit' });
    
    // 4. Clean release directory with special handling
    console.log('🧹 Cleaning release directory...');
    const releaseDir = path.join(__dirname, 'release');
    
    // Kill any Java processes that might lock files
    try {
      execSync('taskkill /f /im java.exe 2>nul', { stdio: 'pipe' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      // Java process not running - that's fine
    }
    
    // Remove release directory with retries
    if (await fs.pathExists(releaseDir)) {
      await fs.remove(releaseDir);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // 5. Use electron-builder with custom config
    console.log('🔨 Building with Electron Builder...');
    
    // Custom electron-builder command with file copy delay
    const buildCommand = `
      node -e "
        const { execSync } = require('child_process');
        console.log('Starting electron-builder with file lock workaround...');
        setTimeout(() => {
          execSync('npx electron-builder --win', { stdio: 'inherit', cwd: '${__dirname}' });
        }, 5000);
      "
    `;
    
    execSync(buildCommand, { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
    console.log('📂 Location: release/win-unpacked/');
    console.log('🎯 Run: npx electron . or open release/win-unpacked/ProjectLibre.exe');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  buildDesktop();
}

module.exports = { buildDesktop };