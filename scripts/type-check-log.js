/**
 * Запуск type-check с записью вывода в UTF-8 (для корректного парсинга ошибок на Windows).
 * Использование: npm run type-check:log
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const logPath = path.join(projectRoot, 'type-check.log');

try {
  const output = execSync('npx tsc --noEmit --skipLibCheck', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    cwd: projectRoot
  });
  fs.writeFileSync(logPath, output || '', 'utf8');
  process.exit(0);
} catch (err) {
  const stdout = (err.stdout && err.stdout.toString && err.stdout.toString()) || '';
  const stderr = (err.stderr && err.stderr.toString && err.stderr.toString()) || '';
  fs.writeFileSync(logPath, stdout + stderr, 'utf8');
  process.exit(err.status ?? 1);
}
