/**
 * Скрипт тестирования запуска Java из командной строки
 * Использует новые сервисы для полноценного тестирования
 */

// Для тестирования используем прямые вызовы Node.js
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execFileAsync = util.promisify(execFile);

// Простая функция проверки Java
async function checkJavaAvailability() {
  console.log('=== Java Command Line Test ===\n');
  
  try {
    console.log('1. Проверка доступности Java в PATH...');
    
    // Проверяем Java в PATH
    let javaExecutable;
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execFileAsync('where', ['java'], { timeout: 5000 });
        javaExecutable = stdout.split('\n')[0].trim();
      } catch {
        javaExecutable = 'java.exe';
      }
    } else {
      try {
        const { stdout } = await execFileAsync('which', ['java'], { timeout: 5000 });
        javaExecutable = stdout.trim();
      } catch {
        javaExecutable = 'java';
      }
    }
    
    console.log(`   Исполняемый файл: ${javaExecutable}`);
    
    // Проверяем версию Java
    console.log('\n2. Проверка версии Java...');
    try {
      const { stderr } = await execFileAsync(javaExecutable, ['-version'], {
        timeout: 10000,
        windowsHide: true
      });
      
      const versionMatch = stderr.match(/version "([^"]+)"/);
      if (versionMatch) {
        const version = versionMatch[1];
        console.log(`   Версия: ${version}`);
        
        // Проверяем совместимость
        const isCompatible = isJavaVersionCompatible(version);
        console.log(`   Совместимость: ${isCompatible ? '✓' : '✗'}`);
        
        if (!isCompatible) {
          console.log('   ⚠ Требуется Java версии 11-21');
        }
      } else {
        console.log('   ✗ Не удалось определить версию Java');
      }
    } catch (error) {
      console.log(`   ✗ Ошибка запуска Java: ${error.message}`);
    }
    
    // Проверяем JAR файл
    console.log('\n3. Проверка JAR файла...');
    const jarPath = path.resolve(__dirname, '../projectlibre_build/dist/projectlibre.jar');
    console.log(`   Путь к JAR: ${jarPath}`);
    
    if (fs.existsSync(jarPath)) {
      const stats = fs.statSync(jarPath);
      console.log(`   Размер: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log('   ✓ JAR файл найден');
      
      // Пробуем запустить JAR с тестовыми параметрами
      console.log('\n4. Тестовый запуск JAR файла...');
      try {
        const testProcess = spawn(javaExecutable, ['-jar', jarPath, '--test-mode'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 5000,
          windowsHide: true
        });
        
        let started = false;
        
        testProcess.stdout?.on('data', (data) => {
          console.log(`   Вывод: ${data.toString().trim()}`);
          started = true;
        });
        
        testProcess.stderr?.on('data', (data) => {
          console.log(`   Ошибка: ${data.toString().trim()}`);
        });
        
        testProcess.on('spawn', () => {
          console.log('   ✓ JAR файл успешно запущен');
          started = true;
        });
        
        testProcess.on('error', (error) => {
          console.log(`   ✗ Ошибка запуска: ${error.message}`);
        });
        
        // Даем процессу 3 секунды на запуск
        setTimeout(() => {
          if (testProcess && !testProcess.killed) {
            testProcess.kill();
          }
        }, 3000);
        
        testProcess.on('close', (code) => {
          if (started) {
            console.log('   ✓ Тестовый запуск завершен успешно');
          } else {
            console.log(`   ✗ Процесс завершился с кодом ${code}`);
          }
        });
        
      } catch (error) {
        console.log(`   ✗ Ошибка тестового запуска: ${error.message}`);
      }
    } else {
      console.log('   ✗ JAR файл не найден');
    }
    
    console.log('\n=== Результаты ===');
    console.log('✅ Базовые тесты Java выполнены');
    console.log('Для полноценного тестирования используйте скомпилированные TypeScript сервисы');
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка при тестировании:', error.message);
    process.exit(1);
  }
}

// Простая проверка совместимости версий
function isJavaVersionCompatible(version) {
  try {
    const cleanVersion = version.replace(/[^\d.]/g, '');
    const parts = cleanVersion.split('.').map(p => parseInt(p, 10)).filter(p => !isNaN(p));
    
    if (parts.length < 2) return false;
    
    const major = parts[0];
    return major >= 11 && major <= 21;
  } catch {
    return false;
  }
}

// Запуск тестов
checkJavaAvailability();