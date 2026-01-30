const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

/**
 * Утилита для скачивания файла с использованием системного curl
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[JRE] Downloading via system curl: ${url}`);
      // Убираем -s для отладки и добавляем -v для подробностей, если нужно. 
      // Но пока просто уберем -s и добавим --retry
      execSync(`curl -L -f --retry 3 -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}" -o "${dest}"`, { stdio: 'inherit' });
      resolve();
    } catch (err) {
      reject(new Error(`System curl failed: ${err.message}`));
    }
  });
}

class JreDownloader {
  constructor(platform) {
    this.platform = platform || process.platform;
    this.config = this.getPlatformConfig();
    this.targetDir = path.join(__dirname, '..', 'resources', 'jre', this.platform === 'win32' ? 'win' : 'linux');
  }

  getPlatformConfig() {
    const configs = {
      win32: {
        url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jre_x64_windows_hotspot_17.0.13_11.zip',
        ext: '.zip'
      },
      linux: {
        url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jre_x64_linux_hotspot_17.0.13_11.tar.gz',
        ext: '.tar.gz'
      }
    };
    return configs[this.platform] || configs['linux'];
  }

  async run() {
    console.log(`[JRE] Target platform: ${this.platform}`);
    console.log(`[JRE] Target directory: ${this.targetDir}`);

    const tempFile = path.join(__dirname, `jre-temp-${this.platform}${this.config.ext}`);
    
    try {
      console.log(`[JRE] Downloading from: ${this.config.url}`);
      await downloadFile(this.config.url, tempFile);
      
      const stats = fs.statSync(tempFile);
      console.log(`[JRE] Downloaded ${Math.round(stats.size / 1024 / 1024)} MB`);

      console.log(`[JRE] Extracting...`);
      if (fs.existsSync(this.targetDir)) {
        fs.rmSync(this.targetDir, { recursive: true, force: true });
      }
      fs.mkdirSync(this.targetDir, { recursive: true });

      if (this.platform === 'win32') {
        // Используем PowerShell для распаковки zip на Windows
        const psCommand = `Expand-Archive -Path "${tempFile}" -DestinationPath "${this.targetDir}" -Force`;
        try {
          execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
        } catch (e) {
          // Если PowerShell заблокирован или занят, пробуем через tar (он есть в современных Windows)
          console.log(`[JRE] PowerShell extraction failed, trying tar...`);
          execSync(`tar -xf "${tempFile}" -C "${this.targetDir}"`, { stdio: 'inherit' });
        }
        this.cleanupSubfolder();
      } else {
        // Используем tar для Linux
        try {
          execSync(`tar -xzf "${tempFile}" -C "${this.targetDir}" --strip-components=1`, { stdio: 'inherit' });
        } catch (tarError) {
          // На Windows распаковка Linux архива может выдавать ошибки на символьных ссылках или правах в папке legal
          // Проверяем, извлекся ли основной бинарный файл
          const javaBinPath = path.join(this.targetDir, 'bin', 'java');
          if (fs.existsSync(javaBinPath)) {
            console.log(`[JRE] ⚠️ Warning during extraction, but critical files (bin/java) are present. Continuing...`);
          } else {
            throw tarError;
          }
        }
      }

      console.log(`[JRE] ✅ Successfully prepared JRE for ${this.platform}`);
    } catch (error) {
      console.error(`[JRE] ❌ Error: ${error.message}`);
      process.exit(1);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }

  cleanupSubfolder() {
    const items = fs.readdirSync(this.targetDir);
    // Ищем единственную папку внутри (обычно это jdk-17.0.10)
    const subDirs = items.filter(item => fs.statSync(path.join(this.targetDir, item)).isDirectory());
    
    if (subDirs.length === 1) {
      const subDir = path.join(this.targetDir, subDirs[0]);
      console.log(`[JRE] Moving contents from ${subDirs[0]} up to root...`);
      const subItems = fs.readdirSync(subDir);
      for (const item of subItems) {
        fs.renameSync(path.join(subDir, item), path.join(this.targetDir, item));
      }
      fs.rmdirSync(subDir);
    }
  }

  static async execute() {
    const args = process.argv.slice(2);
    let platform = process.platform;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--platform' && args[i+1]) {
        platform = args[i+1] === 'win' ? 'win32' : 'linux';
        break;
      }
    }

    const downloader = new JreDownloader(platform);
    await downloader.run();
  }
}

if (require.main === module) {
  JreDownloader.execute().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = JreDownloader;
