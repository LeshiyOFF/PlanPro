# PlanPro

![Build Status](https://github.com/LeshiyOFF/PlanPro/actions/workflows/release.yml/badge.svg)
![Contract Tests](https://github.com/LeshiyOFF/PlanPro/actions/workflows/contract-tests.yml/badge.svg)
![Version](https://img.shields.io/github/v/release/LeshiyOFF/PlanPro)
![License](https://img.shields.io/github/license/LeshiyOFF/PlanPro)

Современное решение для управления проектами на основе ProjectLibre с интеграцией Electron и REST API.

## Возможности

- 🎯 **Управление проектами** - Полный цикл управления задачами, ресурсами и зависимостями
- 📊 **Диаграмма Ганта** - Визуализация временных линий проекта
- 🔄 **REST API** - Интеграция с внешними системами через Spring Boot
- 🖥️ **Кросс-платформенность** - Windows, Linux, Astra Linux SE 1.7+
- 📱 **Современный UI** - Построен на React + TypeScript + Vite
- 🔒 **Enterprise-ready** - SOLID, Clean Architecture, Contract Testing

## Быстрый старт

### Установка

#### Windows

1. Скачайте последнюю версию с [страницы релизов](https://github.com/LeshiyOFF/PlanPro/releases)
2. Запустите `PlanPro-Setup-X.X.X.exe`
3. Следуйте инструкциям установщика

#### Linux (Debian/Ubuntu)

```bash
# Скачайте .deb пакет
wget https://github.com/LeshiyOFF/PlanPro/releases/latest/download/PlanPro-X.X.X.deb

# Установите пакет
sudo dpkg -i PlanPro-X.X.X.deb
sudo apt-get install -f  # Исправить зависимости если нужно

# Запустите приложение
planpro
```

#### Astra Linux SE 1.7

```bash
# Установка из .deb пакета
sudo dpkg -i PlanPro-X.X.X.deb
sudo apt-get install -f

# Первый запуск
planpro
```

### Системные требования

#### Минимальные
- **ОС:** Windows 10 (64-bit) / Ubuntu 20.04+ / Astra Linux SE 1.7+
- **RAM:** 4 GB
- **Процессор:** Intel Core i3 / AMD Ryzen 3
- **Место на диске:** 500 MB

#### Рекомендуемые
- **ОС:** Windows 11 / Ubuntu 22.04+ / Astra Linux SE 1.7+
- **RAM:** 8 GB
- **Процессор:** Intel Core i5 / AMD Ryzen 5
- **Место на диске:** 1 GB

## Сборка проекта

### Требования для разработки

- **Node.js:** 18.x
- **JDK:** 17 (Liberica, Temurin или OpenJDK)
- **Apache Ant:** 1.10.14+
- **Apache Maven:** 3.9.5+
- **Git:** 2.30+

### Локальная сборка

#### Windows

```bash
# Клонирование репозитория
git clone https://github.com/LeshiyOFF/PlanPro.git
cd PlanPro/projectlibre-master

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

#### Linux

```bash
# Клонирование репозитория
git clone https://github.com/LeshiyOFF/PlanPro.git
cd PlanPro/projectlibre-master

# Установка системных зависимостей
sudo apt-get update
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

#### Astra Linux

```bash
# То же что для Linux, но с дополнительной подготовкой
npm run dist:astra
```

**Результат:** `release/PlanPro-X.X.X-astra.deb`

### Автоматическая сборка через GitHub Actions

Проект использует GitHub Actions для автоматической сборки и релизов.

**Триггеры сборки:**
- Push в ветку `main`
- Создание тега формата `v*` (например, `v1.0.1`)
- Ручной запуск через Actions UI

**Создание релиза:**

```bash
# Обновите версию
npm version patch  # или minor, или major

# Создайте тег
git tag v1.0.1 -m "Release 1.0.1"

# Отправьте тег
git push origin v1.0.1
```

GitHub Actions автоматически:
1. Соберет Windows и Linux версии
2. Создаст GitHub Release
3. Загрузит артефакты

Подробности в [GitHub Actions Guide](docs/deployment/github-actions-guide.md).

### NPM Scripts

```bash
# Разработка
npm run dev              # Запуск dev сервера с hot reload
npm run dev:electron     # Запуск Electron в режиме разработки

# Сборка
npm run build            # Сборка фронтенда
npm run build:java       # Сборка Java модулей (Ant + Maven)
npm run build:all        # Полная сборка

# Дистрибутивы
npm run dist:win         # Windows installer
npm run dist:linux       # Linux .deb
npm run dist:astra       # Astra Linux .deb

# Тестирование
npm test                 # Запуск тестов
npm run test:contract    # Контрактные тесты API
npm run test:e2e         # E2E тесты

# Линтинг
npm run lint             # ESLint + TypeScript проверка
npm run lint:fix         # Автоматическое исправление
```

## Архитектура

```
PlanPro/
├── electron/             # Electron main process
│   ├── main.ts          # Точка входа
│   ├── services/        # Сервисы (Window, Config, Menu)
│   └── electron-builder.yml
├── src/                 # React фронтенд
│   ├── components/      # UI компоненты
│   ├── features/        # Фичи приложения
│   ├── lib/            # Библиотеки и утилиты
│   └── main.tsx        # Точка входа React
├── projectlibre_core/   # Java core (управление проектами)
├── projectlibre_exchange/ # Импорт/экспорт MS Project
├── projectlibre-api/    # Spring Boot REST API
└── build-scripts/       # Скрипты сборки
```

### Технологический стек

**Frontend:**
- React 18 + TypeScript
- Vite (сборка)
- TailwindCSS (стили)
- Zustand (state management)
- React Query (data fetching)

**Desktop:**
- Electron 28
- electron-builder (packaging)

**Backend:**
- Spring Boot 3.2 (REST API)
- Java 17
- Maven 3.9

**Legacy Core:**
- Java 17
- Apache Ant 1.10
- ProjectLibre Core Engine

**CI/CD:**
- GitHub Actions
- Contract Testing (Pact)

## REST API

PlanPro включает полнофункциональный REST API для интеграции.

### Запуск API сервера

```bash
cd projectlibre-api
mvn spring-boot:run
```

API доступен по адресу: `http://localhost:8080`

### Эндпоинты

- `GET /api/projects` - Список проектов
- `GET /api/projects/{id}` - Получить проект
- `POST /api/projects` - Создать проект
- `PUT /api/projects/{id}` - Обновить проект
- `DELETE /api/projects/{id}` - Удалить проект

Полная документация API: [API Guide](docs/api/README.md)

## Разработка

### Настройка окружения

1. Установите Node.js 18 и JDK 17
2. Клонируйте репозиторий
3. Установите зависимости:
   ```bash
   npm install --legacy-peer-deps
   ```

### Запуск в режиме разработки

```bash
# Терминал 1: Frontend dev server
npm run dev

# Терминал 2: Electron
npm run dev:electron
```

### Структура коммитов

Проект использует [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add timesheet functionality
fix: resolve Gantt chart rendering issue
docs: update API documentation
refactor: improve resource allocation logic
test: add unit tests for calendar service
chore: update dependencies
```

### Code Style

- **TypeScript:** Strict mode
- **ESLint:** Airbnb config + custom rules
- **Prettier:** Автоматическое форматирование
- **Architecture:** SOLID, Clean Architecture

Запуск проверок:
```bash
npm run lint
npm run type-check
```

## Тестирование

### Unit Tests

```bash
npm test
```

### Contract Tests

```bash
cd projectlibre-api
mvn test
```

### E2E Tests

```bash
npm run test:e2e
```

## Документация

- [GitHub Actions Guide](docs/deployment/github-actions-guide.md) - CI/CD и деплой
- [API Documentation](docs/api/README.md) - REST API
- [Architecture Guide](docs/architecture/README.md) - Архитектура проекта
- [Development Guide](docs/development/README.md) - Разработка

## Roadmap

Актуальный roadmap проекта: [ROADMAP.md](ROADMAP.md)

## Участие в разработке

Мы приветствуем вклад в проект! 

1. Fork репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'feat: add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

Пожалуйста, следуйте:
- [Code Style Guide](docs/contributing/code-style.md)
- [Commit Convention](docs/contributing/commits.md)
- [Pull Request Template](.github/pull_request_template.md)

## Лицензия

Проект основан на ProjectLibre и распространяется под лицензией CPAL (Common Public Attribution License).

См. [LICENSE](LICENSE) для подробностей.

## Поддержка

- 📧 **Email:** support@planpro.com
- 💬 **Discussions:** [GitHub Discussions](https://github.com/LeshiyOFF/PlanPro/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/LeshiyOFF/PlanPro/issues)

## Благодарности

Проект построен на основе:
- [ProjectLibre](https://www.projectlibre.com/) - Open Source project management
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI library
- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework

---

**Разработано с ❤️ командой PlanPro**
