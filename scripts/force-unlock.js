#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function forceUnlock() {
  const releaseDir = path.join(__dirname, '..', 'release');
  const appAsarPath = path.join(releaseDir, 'win-unpacked', 'resources', 'app.asar');
  
  try {
    console.log('🔓 Force unlocking release directory...');
    
    // 1. Пытаемся найти процесс блокировщик
    try {
      console.log('🔍 Searching for file handles...');
      const result = execSync(`handle "${appAsarPath}"`, { encoding: 'utf8', stdio: 'pipe' });
      console.log('📋 Handle info:', result);
    } catch (e) {
      console.log('⚠️ Handle utility not available, continuing with force methods...');
    }
    
    // 2. Принудительно останавливаем VS Code процессы
    try {
      console.log('🛑 Stopping VS Code processes...');
      execSync('taskkill /f /im Code.exe 2>nul', { stdio: 'pipe' });
      execSync('taskkill /f /im code.exe 2>nul', { stdio: 'pipe' });
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.log('⚠️ VS Code processes not found or already stopped');
    }
    
    // 3. Пытаемся разблокировать файл через системные вызовы
    try {
      if (await fs.pathExists(appAsarPath)) {
        console.log('🔓 Attempting force unlock...');
        execSync(`powershell -Command "& { (Get-Item '${appAsarPath}').IsReadOnly = $false }"`, { stdio: 'pipe' });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (e) {
      console.log('⚠️ PowerShell unlock failed:', e.message);
    }
    
    // 4. Удаляем с несколькими попытками
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🗑️ Attempt ${i + 1}/${maxRetries} to remove release directory...`);
        
        if (await fs.pathExists(releaseDir)) {
          await fs.remove(releaseDir);
        }
        
        await fs.ensureDir(releaseDir);
        console.log('✅ Release directory successfully cleaned!');
        break;
        
      } catch (error) {
        console.log(`❌ Attempt ${i + 1} failed:`, error.message);
        
        if (i < maxRetries - 1) {
          console.log('⏳ Waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Force unlock failed:', error.message);
    process.exit(1);
  }
}

forceUnlock();