# ПланПро (ProjectLibre Modern)

<div align="center">

**Профессиональное программное обеспечение для управления проектами**

*Современная архитектура на базе Electron + React с проверенным вычислительным ядром ProjectLibre*

[🚀 Быстрый старт](#быстрый-старт) • [📖 Документация](#документация) • [🏗️ Архитектура](#архитектура) • [🤝 Участие](#участие-в-разработке)

</div>

---

## 📋 Содержание

- [О проекте](#о-проекте)
- [Ключевые возможности](#ключевые-возможности)
- [Технологический стек](#технологический-стек)
- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Документация](#документация)
- [Разработка](#разработка)
- [Сборка и деплой](#сборка-и-деплой)
- [Лицензия](#лицензия)

---

## 🎯 О проекте

**ПланПро** — это полная модернизация open-source проекта ProjectLibre с сохранением его мощного вычислительного ядра и заменой устаревшего Swing интерфейса на современный стек React + Electron.

### Почему ПланПро?

- ✅ **Проверенное ядро**: Используется расчетный движок ProjectLibre 1.9.8, протестированный годами
- ⚡ **Современный интерфейс**: React 18 + TypeScript + Tailwind CSS
- 🔒 **Безопасность**: Изолированная архитектура Electron с Content Security Policy
- 🌐 **REST API**: Spring Boot для интеграции с другими системами
- 🎨 **UX/UI**: Адаптивный интерфейс с поддержкой тем
- 📊 **Расширяемость**: Модульная архитектура, готовая к добавлению новых модулей

---

## 🚀 Ключевые возможности

### Управление проектами
- 📅 **Диаграмма Ганта** с drag & drop и критическим путём
- 🔗 **Сетевая диаграмма** (PERT/CPM)
- 📊 **Структура декомпозиции работ** (WBS)
- 🗓️ **Календарное планирование** с учетом рабочих дней
- ⚡ **Автоматический расчёт** длительностей и зависимостей

### Работа с данными
- 💾 **Формат .pod**: Нативный формат ProjectLibre
- 📤 **Импорт/экспорт**: MS Project (MPP, XML), Primavera XER
- 🔄 **Автосохранение** и резервное копирование
- 📋 **История изменений** с возможностью отката

### Интерфейс
- 🎨 **Темная/светлая тема**
- 🌍 **Многоязычность**: Русский, English
- ♿ **Accessibility**: Поддержка ARIA и клавиатурной навигации
- 📱 **Адаптивный дизайн**: Оптимизация для разных разрешений

### Для разработчиков
- 🔌 **REST API** для интеграции
- 📡 **IPC каналы** между Electron и React
- 🧪 **Тестирование**: Unit, Integration, E2E
- 📈 **Observability**: Логирование и мониторинг

---

## 🛠 Технологический стек

### Frontend
```
├── React                 # UI-фреймворк
├── TypeScript            # Типизация
├── Vite                  # Сборщик
├── Tailwind CSS          # Стили
├── Zustand               # State Management
├── React Router          # Маршрутизация
├── Radix UI              # Компонентная база
├── Framer Motion         # Анимации
├── i18next               # Интернационализация
└── Gantt Task React      # Диаграммы Ганта
```

### Desktop
```
├── Electron              # Desktop wrapper
├── Node.js 18+           # Runtime
└── TypeScript            # Типизация
```

### Backend (Java)
```
├── Java 17               # Runtime
├── Spring Boot           # Фреймворк
├── ProjectLibre Core     # Вычислительное ядро
├── Maven                 # Сборка
└── H2 Database           # In-memory БД (для разработки)
```

### Инструменты сборки
```
├── Apache Ant            # Сборка Java legacy
├── Maven                 # Сборка Spring Boot API
├── npm                   # Управление зависимостями
└── electron-builder      # Упаковка десктопного приложения
```

---

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** 18+
- **npm** 9+
- **Java** 17+ (OpenJDK или Oracle JDK)
- **Maven** (опционально, включен в проект)
- **Git**

### Установка и запуск

```bash
# 1. Клонируйте репозиторий
git clone ssh://git@gitlab.avtograf.tech:2222/aqua-minibim/libre.git
cd libre

# 2. Установите зависимости
npm install

# 3. Соберите Java бэкенд
npm run build:java

# 4. Запустите приложение в режиме разработки
npm run dev

# Альтернатива: Запуск через батник (Windows)
./start-dev.bat
```

Приложение откроется автоматически. Frontend будет доступен на `http://localhost:5173`, Java API на динамическом порту (обычно 18080+).

---

## 🏗️ Архитектура

ПланПро построен по принципам **Clean Architecture** и **SOLID**.

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON MAIN PROCESS                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ProjectLibreApp (main.ts)                             │ │
│  │  - WindowManager                                       │ │
│  │  - JavaBridgeService ──▶ Java Process Manager         │ │
│  │  - SecurityPolicyManager                               │ │
│  │  - IPC Handlers (Preferences, Java, File)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │ IPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   ELECTRON RENDERER (REACT)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App.tsx (Root Component)                              │ │
│  │  ├── Providers (Theme, I18n, Navigation, ...)         │ │
│  │  ├── Components (GanttView, NetworkView, ...)         │ │
│  │  ├── Services (ProjectService, TaskService, ...)      │ │
│  │  └── Store (Zustand: Project, Tasks, Resources)       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT REST API (JAVA)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ProjectLibreApiApplication                            │ │
│  │  ├── REST Controllers (Project, Task, Resource, ...)  │ │
│  │  ├── Services (ProjectService, TaskService, ...)      │ │
│  │  ├── Adapters (ThreadSafeProjectAdapter, ...)         │ │
│  │  └── CoreAccessGuard (Thread safety)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               PROJECTLIBRE CORE (LEGACY JAVA)                │
│  com.projectlibre1.pm.task.Project                          │
│  com.projectlibre1.pm.scheduling.SchedulingAlgorithm        │
│  com.projectlibre1.pm.resource.ResourceImpl                 │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые модули

| Модуль | Описание |
|--------|----------|
| `electron/` | Electron main process, управление окнами и Java процессом |
| `src/` | React frontend (TypeScript) |
| `projectlibre-api/` | Spring Boot REST API для связи с ядром |
| `projectlibre_core/` | Вычислительное ядро ProjectLibre (legacy) |
| `docs/` | Документация проекта |

---

## 📖 Документация

### Пользовательская документация
- **[Руководство пользователя](docs/user-guide/USER_MANUAL.md)** — Полное руководство по работе с ПланПро
- **[Руководство пользователя (DOCX)](docs/user-guide/РУКОВОДСТВО%20ПОЛЬЗОВАНИЯ.docx)** — Альтернативная версия в формате Word
- **[Описание функционала](docs/user-guide/ФУНКЦИОНАЛ.md)** — Детальное описание всех возможностей

### Техническая документация
- **[План развития проекта](docs/ROADMAP.md)** — Roadmap и планируемые улучшения
- **[План внедрения учёта времени](docs/planning/TIMESHEET_IMPLEMENTATION_PLAN.md)** — Спецификация модуля учёта времени
- **[Руководство по GitHub Actions](docs/deployment/github-actions-guide.md)** — CI/CD pipeline

---

## 💻 Разработка

### Структура проекта

```
projectlibre-master/
├── electron/              # Electron main process
│   ├── main.ts           # Точка входа
│   ├── services/         # Сервисы (WindowManager, JavaBridge, ...)
│   └── handlers/         # IPC обработчики
├── src/                  # React frontend
│   ├── components/       # UI компоненты
│   ├── services/         # Сервисы (ProjectService, TaskService, ...)
│   ├── store/            # Zustand store
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript типы
│   └── App.tsx           # Root компонент
├── projectlibre-api/     # Spring Boot REST API
│   └── src/main/java/com/projectlibre/api/
│       ├── rest/         # REST контроллеры
│       ├── service/      # Бизнес-логика
│       ├── adapter/      # Адаптеры к Core
│       └── dto/          # DTO объекты
├── projectlibre_core/    # ProjectLibre Core (legacy)
├── build-scripts/        # Скрипты сборки
├── docs/                 # Документация
│   ├── user-guide/      # Руководства пользователя
│   ├── planning/        # Планы разработки
│   └── deployment/      # Инструкции по развёртыванию
└── resources/            # Ресурсы (JRE, JAR файлы)
```

### Команды разработки

```bash
# Разработка
npm run dev                  # Запуск dev-сервера (Vite + Electron)
npm run dev:vite             # Только Vite
npm run dev:electron         # Только Electron

# Сборка
npm run build                # Сборка frontend + Electron
npm run build:java           # Сборка Java (Core + API)
npm run build:java-api       # Только API
npm run build:java-core      # Только Core

# Линтинг и проверки
npm run lint                 # ESLint проверка
npm run lint:fix             # Автофикс
npm run type-check           # TypeScript проверка типов

# Тестирование
npm run test                 # Запуск тестов
npm run test:run             # Однократный запуск
npm run test:coverage        # Тесты с покрытием
npm run test:java            # Тест запуска Java процесса

# Упаковка
npm run dist                 # Полная сборка дистрибутива
npm run dist:win             # Windows
npm run dist:linux           # Linux
npm run dist:astra           # Astra Linux SE
```

---

## 📦 Сборка и деплой

### Готовый дистрибутив

Установочные файлы находятся в папке **`release/`** после выполнения команды `npm run dist`.

### Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| **ОС** | Windows 10, Ubuntu 20.04, macOS 10.15 | Windows 11, Ubuntu 22.04, macOS 12+ |
| **CPU** | 2 ядра | 4+ ядра |
| **RAM** | 4 GB | 8+ GB |
| **Диск** | 500 MB | 1 GB |
| **Java** | JRE 17 (встроена) | — |

### Платформы сборки

- **Windows**: `.exe` установщик (NSIS)
- **Linux**: `.deb`, `.rpm`, `.AppImage`
- **Astra Linux SE**: специализированная `.deb` сборка
- **macOS**: `.dmg` образ

---

## 📝 Лицензия

CPAL-1.0 (Common Public Attribution License)

---

<div align="center">

[⬆ Наверх](#планпро-projectlibre-modern)

</div>
