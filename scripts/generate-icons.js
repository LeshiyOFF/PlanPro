const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../assets/icon.svg');
const outputPng = path.join(__dirname, '../assets/icon.png');
const outputIco = path.join(__dirname, '../assets/icon.ico');

async function generateIcons() {
  console.log('🚀 Начинаю генерацию иконок из SVG...');

  try {
    // 1. Генерируем основной PNG (512x512) для Linux и как базу для ICO
    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(outputPng);
    console.log('✅ assets/icon.png (512x512) создан.');

    // 2. Генерируем набор PNG разных размеров для создания качественного ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = await Promise.all(
      sizes.map(size => 
        sharp(inputSvg)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );

    // 3. Создаем ICO из набора буферов
    const pngToIcoFunc = typeof pngToIco === 'function' ? pngToIco : pngToIco.default;
    if (typeof pngToIcoFunc !== 'function') {
      throw new Error('Не удалось найти функцию pngToIco в импортированном модуле');
    }
    const icoBuffer = await pngToIcoFunc(pngBuffers);
    fs.writeFileSync(outputIco, icoBuffer);
    console.log('✅ assets/icon.ico создан.');

    console.log('✨ Все иконки успешно сгенерированы!');
  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();
