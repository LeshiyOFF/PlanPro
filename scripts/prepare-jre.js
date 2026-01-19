const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

/**
 * Утилита для скачивания файла с поддержкой редиректов (рекурсивно)
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Обработка редиректов (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        console.log(`[JRE] Redirecting to: ${res.headers.location}`);
        return resolve(downloadFile(res.headers.location, dest));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
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
        url: 'https://download.bell-sw.com/java/17.0.10+13/bellsoft-jre17.0.10+13-windows-amd64.zip',
        ext: '.zip'
      },
      linux: {
        url: 'https://download.bell-sw.com/java/17.0.10+13/bellsoft-jre17.0.10+13-linux-amd64.tar.gz',
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
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
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
