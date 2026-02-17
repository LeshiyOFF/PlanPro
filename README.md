# ПланПро

> **Профессиональное ПО для управления проектами на базе ProjectLibre**

[![Version](https://img.shields.io/badge/version-1.0.22-blue.svg)](https://github.com/LeshiyOFF/PlanPro/releases)
[![License](https://img.shields.io/badge/license-CPAL--1.0-green.svg)](LICENSE)
[![Build Status](https://github.com/LeshiyOFF/PlanPro/actions/workflows/release.yml/badge.svg)](https://github.com/LeshiyOFF/PlanPro/actions)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)](#установка)

---

## 📋 Содержание

- [О проекте](#о-проекте)
- [Основные возможности](#основные-возможности)
- [Технологический стек](#технологический-стек)
- [Системные требования](#системные-требования)
- [Установка](#установка)
- [Сборка из исходников](#сборка-из-исходников)
- [Разработка](#разработка)
- [Архитектура](#архитектура)
- [Тестирование](#тестирование)
- [Вклад в проект](#вклад-в-проект)
- [Лицензия](#лицензия)
- [Контакты](#контакты)

---

## 📖 О проекте

**ПланПро** — современная система управления проектами для малого и среднего бизнеса, построенная на базе ProjectLibre с использованием передовых технологий. Система предоставляет полный набор инструментов для планирования, контроля и анализа проектов любой сложности.

### Почему ПланПро?

- **Полнофункциональность**: все необходимые инструменты для управления проектами в одном приложении
- **Кросс-платформенность**: поддержка Windows и Linux
- **Современный интерфейс**: интуитивно понятный UI на базе React с поддержкой темной темы
- **Совместимость**: импорт и экспорт проектов в форматах .pod и MS Project
- **Open Source**: открытый исходный код под лицензией CPAL-1.0
- **Высокая производительность**: гибридная архитектура Electron + Java для оптимальной работы

---

## ✨ Основные возможности

### Управление задачами
- ✅ Создание и редактирование задач с поддержкой иерархической структуры (WBS)
- ✅ Автоматический расчёт суммарных задач (summary tasks)
- ✅ Связи задач (зависимости): FS, SS, FF, SF с задержками
- ✅ Ограничения задач (constraints): ASAP, ALAP, SNET, FNLT и другие
- ✅ Поддержка вех (milestones)

### Планирование и расчёты
- 📊 **Метод критического пути (CPM)**: автоматический расчёт критического пути проекта
- 📅 **Календарное планирование**: учёт рабочих и нерабочих дней
- ⏱️ **Точный расчёт длительности**: с точностью до миллисекунд
- 🔄 **Автоматический пересчёт**: при изменении зависимостей и ограничений

### Ресурсное управление
- 👥 Управление человеческими ресурсами
- 💰 Управление материальными ресурсами и затратами
- 📈 Назначение ресурсов на задачи с контролем загрузки
- 💵 Контроль стоимости проекта

### Визуализация
- 📊 **Диаграмма Ганта**: интерактивная временная шкала проекта
- 🗓️ **Календарное представление**: визуализация задач по календарю
- 📋 **Табличное представление**: детальная информация по задачам
- 🎯 **Сетевая диаграмма**: отображение зависимостей задач

### Импорт и экспорт
- 📥 Импорт проектов из формата .pod (ProjectLibre)
- 📤 Экспорт в формат Microsoft Project (.mpp)
- 💾 Автоматическое сохранение изменений
- 🔄 Синхронизация между Frontend и Java Core

### Дополнительные возможности
- 🌍 Многоязычный интерфейс (русский, английский)
- 🎨 Настраиваемый интерфейс с темной и светлой темой
- ⚡ Высокая производительность при работе с большими проектами
- 🔒 Безопасное хранение данных проекта

---

## 🛠 Технологический стек

### Frontend
- **TypeScript** 5.x — строгая типизация
- **React** 18.x — современная библиотека для UI
- **Vite** 5.x — быстрая сборка и HMR
- **TailwindCSS** 3.x — utility-first CSS framework
- **Zustand** — управление состоянием
- **React Query (TanStack Query)** — управление серверным состоянием
- **Lucide React** — иконки

### Backend (Java Core)
- **Java** 17 (LTS) — надёжная платформа
- **ProjectLibre Core** — ядро системы управления проектами
- **Maven** 3.9.x — управление зависимостями
- **Apache Ant** 1.10.x — система сборки

### Desktop
- **Electron** 32.x — кросс-платформенный фреймворк
- **electron-builder** — сборка инсталляторов

### Инструменты разработки
- **ESLint** — линтинг кода
- **Vitest** — тестирование
- **Storybook** — разработка компонентов
- **TypeScript** — проверка типов

### CI/CD
- **GitHub Actions** — автоматизация сборки и релизов
- **Contract Tests** — контрактное тестирование Java API

---

## 💻 Системные требования

### Минимальные требования
- **ОС**: Windows 10/11 (64-bit) или Linux (Ubuntu 20.04+, Debian 11+, Astra Linux)
- **Процессор**: Intel Core i3 или эквивалент
- **ОЗУ**: 4 ГБ
- **Диск**: 500 МБ свободного места
- **Разрешение экрана**: 1366x768 или выше

### Рекомендуемые требования
- **ОС**: Windows 11 (64-bit) или Linux (последняя версия)
- **Процессор**: Intel Core i5/i7 или эквивалент
- **ОЗУ**: 8 ГБ и более
- **Диск**: 1 ГБ свободного места (SSD рекомендуется)
- **Разрешение экрана**: 1920x1080 или выше

---

## 📦 Установка

### Windows

1. Перейдите на страницу [Releases](https://github.com/LeshiyOFF/PlanPro/releases)
2. Скачайте последнюю версию установщика `PlanPro-Setup-1.0.22.exe`
3. Запустите установщик и следуйте инструкциям мастера установки
4. После установки запустите ПланПро через ярлык на рабочем столе или меню "Пуск"

### Linux (Debian/Ubuntu)

```bash
# Скачайте .deb пакет с GitHub Releases
wget https://github.com/LeshiyOFF/PlanPro/releases/download/v1.0.22/PlanPro-1.0.22.deb

# Установите пакет
sudo dpkg -i PlanPro-1.0.22.deb

# Установите зависимости (если требуется)
sudo apt-get install -f

# Запустите приложение
planpro
```

---

## 🔨 Сборка из исходников

### Требования для сборки

- **Node.js** 18.x или выше
- **npm** 9.x или выше
- **JDK** 17 (LTS) — Liberica JDK рекомендуется
- **Maven** 3.9.x
- **Apache Ant** 1.10.x
- **Git**

### Клонирование репозитория

```bash
git clone https://github.com/LeshiyOFF/PlanPro.git
cd PlanPro/projectlibre-master
```

### Установка зависимостей

```bash
# Установка Node.js зависимостей
npm install --legacy-peer-deps

# Подготовка JRE (Windows)
npm run prepare-jre:win

# Подготовка JRE (Linux)
npm run prepare-jre:linux
```

### Сборка проекта

#### Сборка для разработки

```bash
# Запуск в режиме разработки
npm run dev
```

#### Производственная сборка

```bash
# 1. Сборка Frontend и Electron
npm run build

# 2. Сборка Java Core и API
npm run build:java

# 3. Сборка установщика (Windows)
npm run dist:win

# 3. Сборка установщика (Linux)
npm run dist:linux
```

Готовые инсталляторы будут находиться в папке `release/`.

---

## 👨‍💻 Разработка

### Структура проекта

```
projectlibre-master/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # React компоненты
│   ├── services/                 # Сервисы (API, Storage)
│   ├── domain/                   # Бизнес-логика
│   ├── hooks/                    # Custom React hooks
│   └── stores/                   # Zustand stores
├── electron/                     # Electron main process
│   ├── main.ts                   # Главный процесс
│   ├── preload.ts                # Preload скрипт
│   ├── handlers/                 # IPC handlers
│   └── services/                 # Electron сервисы
├── projectlibre-api/             # Java API Layer
│   └── src/main/java/            # Java исходники API
├── projectlibre_core/            # Java Core (ProjectLibre)
│   └── src/                      # Ядро системы
├── assets/                       # Ресурсы (иконки, изображения)
├── electron-builder.yml          # Конфигурация сборки
└── package.json                  # Зависимости проекта
```

### Запуск в режиме разработки

```bash
# Терминал 1: Frontend (Vite dev server)
npm run dev:vite

# Терминал 2: Electron (ожидает Vite)
npm run dev:electron

# Или одной командой (с concurrently)
npm run dev
```

### Полезные команды

```bash
# Линтинг кода
npm run lint
npm run lint:fix

# Проверка типов TypeScript
npm run type-check

# Тестирование
npm test                    # Интерактивный режим
npm run test:run            # Однократный запуск
npm run test:coverage       # С покрытием

# Storybook (разработка компонентов)
npm run storybook

# Тестирование Java
npm run test:java
```

---

## 🏗 Архитектура

ПланПро построен на **гибридной архитектуре**, объединяющей преимущества современного веб-фронтенда и надёжного Java-ядра ProjectLibre.

### Архитектурная схема

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                   (React + TypeScript + Vite)                │
│  ┌────────────┬─────────────┬──────────────┬──────────────┐ │
│  │  Gantt     │  Task List  │   Calendar   │   Resources  │ │
│  │  Chart     │             │              │              │ │
│  └────────────┴─────────────┴──────────────┴──────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (Electron)
┌──────────────────────────┴──────────────────────────────────┐
│                     INTEGRATION LAYER                        │
│                    (Electron Main Process)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  IPC Handlers  │  Java Bridge  │  File System Manager │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ JNI / Child Process
┌──────────────────────────┴──────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
│                      (Java 17 + ProjectLibre)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ProjectLibre API  │  Serialization  │  Converters    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ProjectLibre Core │  CPM Engine  │  Scheduling       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые принципы

1. **Разделение ответственности (Separation of Concerns)**
   - Frontend отвечает только за UI/UX
   - Java Core — за бизнес-логику и расчёты

2. **Hexagonal Architecture (Порты и Адаптеры)**
   - `projectlibre-api` — порты (интерфейсы) для взаимодействия
   - Адаптеры для разных форматов данных (.pod, JSON)

3. **SOLID принципы**
   - Каждый модуль выполняет одну задачу
   - Dependency Injection через конструкторы
   - Interfaces для абстракции

4. **Event-Driven коммуникация**
   - IPC события между Electron и Renderer
   - Reactive state management (Zustand)

### Потоки данных

#### Загрузка проекта
```
User → File Dialog → Electron Main → Java Bridge → 
ProjectLibre Core (parse .pod) → API Converter → JSON → 
Frontend State → React Components → UI
```

#### Изменение задачи
```
User (UI) → React Handler → IPC Event → Electron Main → 
Java API → Task Synchronizer → ProjectLibre Core → 
CPM Recalculation → Updated Data → Frontend
```

---

## 🧪 Тестирование

### Frontend тесты (Vitest)

```bash
# Запуск всех тестов
npm test

# Запуск с покрытием
npm run test:coverage

# UI режим
npm run test:ui
```

### Contract Tests (Java)

Автоматически запускаются в GitHub Actions при каждом коммите в `main`.

```bash
# Запуск локально
npm run test:java
```

### Структура тестов

```
projectlibre-master/
├── src/
│   └── __tests__/                # Frontend unit tests
├── projectlibre_core/
│   └── src/test/java/            # Java Core tests
└── projectlibre-api/
    └── src/test/java/            # API contract tests
```

---

## 🤝 Вклад в проект

Мы приветствуем вклад сообщества! Если вы хотите внести свой вклад в развитие ПланПро, пожалуйста, следуйте этим рекомендациям:

### Процесс контрибьюции

1. **Fork** репозитория
2. Создайте **feature branch** (`git checkout -b feature/amazing-feature`)
3. Внесите изменения и добавьте **тесты**
4. Убедитесь, что код проходит **линтинг** (`npm run lint`)
5. Убедитесь, что все **тесты** проходят (`npm test`)
6. **Commit** изменений с понятным сообщением (`git commit -m 'feat: add amazing feature'`)
7. **Push** в branch (`git push origin feature/amazing-feature`)
8. Откройте **Pull Request**

### Code Style

- **TypeScript**: строгая типизация, без `any`
- **React**: функциональные компоненты + hooks
- **Именование**: camelCase для переменных, PascalCase для компонентов
- **Комментарии**: на русском языке для бизнес-логики
- **Commit messages**: на английском, conventional commits (`feat:`, `fix:`, `refactor:` и т.д.)

### Что можно улучшить

- 🐛 Исправление багов
- ✨ Новые функции
- 📝 Улучшение документации
- 🌍 Перевод на другие языки
- ⚡ Оптимизация производительности
- 🎨 Улучшение UI/UX

---

## 📄 Лицензия

Проект распространяется под лицензией **Common Public Attribution License Version 1.0 (CPAL-1.0)**.

Это означает:
- ✅ Вы можете свободно использовать, изменять и распространять код
- ✅ Проект подходит для коммерческого использования
- ⚠️ При распространении необходимо сохранить атрибуцию оригинального разработчика (ProjectLibre, Inc.)
- ⚠️ Исходный код модификаций должен быть доступен

Полный текст лицензии: [projectlibre_build/license/license.txt](projectlibre_build/license/license.txt)

### Атрибуция

Этот проект основан на **ProjectLibre** — открытой системе управления проектами.
- Copyright © 2012-2025, ProjectLibre, Inc.
- Официальный сайт: [http://www.projectlibre.com](http://www.projectlibre.com)

---

## 📞 Контакты

### Разработчик
**ООО Просистемы**
- Email: info@prosystems.ru

### Поддержка и обратная связь
- 🐛 **Issues**: [GitHub Issues](https://github.com/LeshiyOFF/PlanPro/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/LeshiyOFF/PlanPro/discussions)
- 📧 **Email**: info@prosystems.ru

### Полезные ссылки
- 🌐 **GitHub**: [https://github.com/LeshiyOFF/PlanPro](https://github.com/LeshiyOFF/PlanPro)
- 📦 **Releases**: [https://github.com/LeshiyOFF/PlanPro/releases](https://github.com/LeshiyOFF/PlanPro/releases)
- 🚀 **Actions**: [https://github.com/LeshiyOFF/PlanPro/actions](https://github.com/LeshiyOFF/PlanPro/actions)

---

<div align="center">

**Сделано с ❤️ в России**

⭐ Если проект вам полезен, поставьте звезду на GitHub!

</div>
