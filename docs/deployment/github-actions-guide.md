# GitHub Actions CI/CD Guide

Полное руководство по автоматизированной сборке и развертыванию PlanPro через GitHub Actions.

## Содержание

1. [Обзор CI/CD Pipeline](#обзор-cicd-pipeline)
2. [Запуск сборки вручную](#запуск-сборки-вручную)
3. [Создание релиза](#создание-релиза)
4. [Скачивание артефактов](#скачивание-артефактов)
5. [Troubleshooting](#troubleshooting)
6. [Структура артефактов](#структура-артефактов)

---

## Обзор CI/CD Pipeline

PlanPro использует два основных workflow:

### 1. Build & Release (`release.yml`)
Автоматическая сборка Windows и Linux версий приложения.

**Триггеры:**
- Push в ветку `main`
- Push тега формата `v*` (например, `v1.0.1`)
- Ручной запуск через `workflow_dispatch`

**Исключения (не запускается):**
- Изменения только в `ROADMAP.md`
- Изменения только в markdown файлах (`**.md`)
- Изменения только в `docs/**`

### 2. Contract Tests CI/CD Pipeline (`contract-tests.yml`)
Автоматическая проверка контрактных тестов API и совместимости.

**Триггеры:**
- Push в ветки `main` или `develop`
- Pull Request в `main`
- Ручной запуск через `workflow_dispatch`
- Расписание (ежедневно в 2:00 UTC)

---

## Запуск сборки вручную

### Через Web UI

1. Откройте страницу Actions в репозитории:
   ```
   https://github.com/ваш-username/PlanPro/actions
   ```

2. Выберите workflow:
   - **Build & Release** - для сборки приложения
   - **Contract Tests CI/CD Pipeline** - для запуска тестов

3. Нажмите кнопку **"Run workflow"**

4. Выберите ветку (обычно `main`)

5. Нажмите **"Run workflow"**

### Через GitHub CLI

```bash
# Установите GitHub CLI (если не установлен)
# https://cli.github.com/

# Запуск Build & Release
gh workflow run release.yml

# Запуск Contract Tests
gh workflow run contract-tests.yml

# Проверить статус выполнения
gh run list --limit 5
```

---

## Создание релиза

Релиз создается автоматически при создании тега формата `v*`.

### Шаг 1: Обновите версию в package.json

```bash
cd projectlibre-master
npm version patch  # 1.0.0 -> 1.0.1
# или
npm version minor  # 1.0.0 -> 1.1.0
# или
npm version major  # 1.0.0 -> 2.0.0
```

### Шаг 2: Создайте и отправьте тег

```bash
# Создание тега
git tag v1.0.1 -m "Release version 1.0.1"

# Отправка тега в GitHub
git push origin v1.0.1
```

### Шаг 3: GitHub Actions автоматически:
1. Запустит сборку для Windows и Linux
2. Создаст артефакты
3. Создаст GitHub Release с приложенными файлами
4. Сгенерирует Release Notes

### Структура версионирования

Используется [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0): Несовместимые изменения API
- **MINOR** (0.X.0): Новая функциональность (обратно совместимая)
- **PATCH** (0.0.X): Исправления ошибок

---

## Скачивание артефактов

### Из Actions (для тестирования)

1. Откройте страницу Actions:
   ```
   https://github.com/ваш-username/PlanPro/actions
   ```

2. Выберите успешный workflow run

3. Прокрутите вниз до секции **Artifacts**

4. Доступные артефакты:
   - `PlanPro-Windows` - установщик для Windows (.exe)
   - `PlanPro-Linux` - пакет для Linux (.deb)
   - `contract-test-results` - результаты контрактных тестов
   - `build-artifacts` - JAR файлы

5. Нажмите на имя артефакта для скачивания (ZIP архив)

**Срок хранения:** 30 дней

### Из Releases (для пользователей)

1. Откройте страницу Releases:
   ```
   https://github.com/ваш-username/PlanPro/releases
   ```

2. Выберите нужную версию

3. Скачайте файл для вашей платформы:
   - **Windows**: `PlanPro-Setup-X.X.X.exe`
   - **Linux**: `PlanPro-X.X.X.deb`

---

## Troubleshooting

### Частые ошибки и их решение

#### 1. `EBADPLATFORM: Unsupported platform`

**Причина:** Несоответствие платформы в опциональных зависимостях.

**Решение:**
```yaml
- name: Install dependencies
  run: npm install --force
```

#### 2. `RollupError: Could not resolve "./Tooltip"`

**Причина:** Проблема с case-sensitivity файлов на Linux.

**Решение:**
- Убедитесь, что все файлы в `src/components/ui/` именуются в lowercase
- Используйте `git mv` для переименования:
  ```bash
  git mv Tooltip.tsx temp-tooltip.tsx
  git mv temp-tooltip.tsx tooltip.tsx
  ```

#### 3. `Could not find artifact projectlibre-core:jar`

**Причина:** Maven не может найти JAR файл из Ant сборки.

**Решение:**
- Убедитесь, что Ant сборка запускается из `projectlibre_build`
- Проверьте наличие `projectlibre_build/dist/projectlibre.jar`

#### 4. `error: unmappable character for encoding windows-1252`

**Причина:** Javac использует неправильную кодировку для русских комментариев.

**Решение:**
```bash
javac -encoding UTF-8 -cp ... src/.../*.java
```

#### 5. DevTools открывается в CI сборке

**Причина:** Проверка `process.env.CI` не работает в runtime.

**Решение:**
```typescript
if (this.configService.isDevelopment()) {
  this.mainWindow?.webContents.openDevTools();
}
// НЕ использовать: !process.env.CI
```

### Проверка логов

#### Через Web UI
1. Откройте failed workflow run
2. Кликните на failed job (красный крестик)
3. Откройте failed step для просмотра логов

#### Через CLI
```bash
# Список последних runs
gh run list --limit 10

# Просмотр логов конкретного run
gh run view RUN_ID --log

# Просмотр логов failed run
gh run view RUN_ID --log-failed
```

### Повторный запуск failed workflow

#### Через Web UI
1. Откройте failed workflow run
2. Нажмите **"Re-run failed jobs"** или **"Re-run all jobs"**

#### Через CLI
```bash
gh run rerun RUN_ID
```

---

## Структура артефактов

### Windows Build (`PlanPro-Windows.zip`)

```
PlanPro-Windows/
├── PlanPro-Setup-1.0.0.exe        # Установщик (NSIS)
├── PlanPro-Setup-1.0.0.exe.blockmap  # Обновление Electron
└── latest.yml                      # Метаданные для auto-updater
```

**Размер:** ~150-200 MB

**Формат:** NSIS installer (.exe)

**Требования:**
- Windows 10/11 (64-bit)
- .NET Framework 4.8+ (для некоторых зависимостей)

### Linux Build (`PlanPro-Linux.zip`)

```
PlanPro-Linux/
├── PlanPro-1.0.0.deb              # Debian/Ubuntu пакет
└── latest-linux.yml                # Метаданные для auto-updater
```

**Размер:** ~140-180 MB

**Формат:** Debian package (.deb)

**Требования:**
- Ubuntu 20.04+ / Debian 11+
- Astra Linux SE 1.7+
- libgtk-3-0, libnotify4, libnss3, libxss1, libxtst6

**Установка:**
```bash
sudo dpkg -i PlanPro-1.0.0.deb
sudo apt-get install -f  # Исправить зависимости
```

### Contract Test Results (`contract-test-results.zip`)

```
contract-test-results/
├── contract-test-results.txt      # Результаты выполнения тестов
└── coverage-report.md              # Отчет о покрытии (92.5%)
```

### Build Artifacts (`build-artifacts.zip`)

```
build-artifacts/
├── projectlibre.jar               # Полная сборка (core + exchange + reports)
└── projectlibre-api-1.0.0.jar     # REST API сервер
```

---

## Локальная сборка

### Требования

- **Node.js**: 18.x
- **JDK**: 17 (Liberica или Temurin)
- **Ant**: 1.10.14+
- **Maven**: 3.9.5+

### Windows

```bash
# Установка зависимостей
npm install --legacy-peer-deps

# Подготовка JRE
node scripts/prepare-jre.js --platform win

# Сборка фронтенда
npm run build

# Сборка Java модулей
npm run build:java

# Создание установщика
npm run dist:win
```

**Результат:** `release/PlanPro-Setup-X.X.X.exe`

### Linux

```bash
# Установка системных зависимостей
sudo apt-get install -y ant maven fakeroot rpm

# Установка Node зависимостей
npm install --legacy-peer-deps

# Подготовка JRE
node scripts/prepare-jre.js --platform linux

# Сборка фронтенда
npm run build

# Сборка Java модулей
npm run build:java

# Создание пакета
npm run dist:linux
```

**Результат:** `release/PlanPro-X.X.X.deb`

---

## Полезные команды

### Git Tags

```bash
# Просмотр всех тегов
git tag -l

# Удаление локального тега
git tag -d v1.0.1

# Удаление удаленного тега
git push origin --delete v1.0.1

# Создание аннотированного тега
git tag -a v1.0.1 -m "Release 1.0.1: Bug fixes and improvements"
```

### GitHub CLI

```bash
# Просмотр статуса workflow
gh run list --workflow=release.yml --limit 10

# Просмотр артефактов
gh run view RUN_ID --log

# Скачивание артефакта
gh run download RUN_ID

# Просмотр релизов
gh release list

# Создание релиза вручную
gh release create v1.0.1 --title "Release 1.0.1" --notes "Release notes here"
```

---

## Мониторинг и уведомления

### Email уведомления

GitHub автоматически отправляет email при:
- Успешной сборке после предыдущего failed build
- Failed build

### Status Badges

Добавьте в README.md:

```markdown
![Build Status](https://github.com/username/PlanPro/actions/workflows/release.yml/badge.svg)
![Contract Tests](https://github.com/username/PlanPro/actions/workflows/contract-tests.yml/badge.svg)
```

---

## Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Builder Documentation](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Последнее обновление:** 2026-02-12  
**Версия документа:** 1.0.0
