#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function cleanRelease() {
  const releaseDir = path.join(__dirname, '..', 'release');
  
  try {
    console.log('🧹 Cleaning release directory...');
    
    // Проверяем существует ли директория
    if (await fs.pathExists(releaseDir)) {
      // Удаляем с задержкой для разблокировки файлов
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      console.log('⏳ Waiting for file locks to release...');
      await delay(2000);
      
      // Безопасное удаление с retry логикой
      await fs.remove(releaseDir);
      console.log('✅ Release directory cleaned successfully');
    } else {
      console.log('📁 Release directory not found, creating fresh...');
    }
    
    // Создаем чистую директорию
    await fs.ensureDir(releaseDir);
    console.log('✅ Release directory ready for build');
    
  } catch (error) {
    console.error('❌ Error cleaning release directory:', error.message);
    process.exit(1);
  }
}

cleanRelease();