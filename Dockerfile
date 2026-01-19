# Dockerfile для сборки ПланПро под Linux (Astra Linux / Debian)
# Позволяет стабильно собирать .deb пакеты на любой ОС (включая Windows)

FROM node:18-bullseye

# 1. Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    ant \
    maven \
    fakeroot \
    dpkg \
    rpm \
    libarchive-tools \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 2. Рабочая директория
WORKDIR /app

# 3. Копирование зависимостей (для кэширования слоев Docker)
COPY package*.json ./

# 4. Установка Node зависимостей
# Используем --frozen-lockfile если есть lock-файл
RUN npm install

# 5. Копирование всего проекта
COPY . .

# 6. Сборка приложения
# Скрипт dist:astra выполняет: prepare-jre:linux, build, build:java, electron-builder
# Примечание: внутри Docker переменная CI=true часто помогает избежать интерактивных запросов
ENV CI=true

# Команда по умолчанию - сборка пакета
CMD ["npm", "run", "dist:astra"]
