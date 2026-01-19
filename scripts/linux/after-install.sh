#!/bin/bash

# Скрипт после установки для ПланПро (Astra Linux / Debian)
# Устанавливает необходимые права доступа для встроенного JRE и бинарных файлов.

set -e

APP_DIR="/opt/ПланПро"
JRE_BIN="$APP_DIR/resources/jre/bin/java"

echo "Configuring ПланПро permissions..."

# 1. Установка прав на исполнение для JRE
if [ -f "$JRE_BIN" ]; then
    echo "Setting executable permissions for JRE: $JRE_BIN"
    chmod +x "$JRE_BIN"
    # Также для других утилит в bin, если они есть
    chmod +x "$APP_DIR/resources/jre/bin/"* || true
else
    echo "Warning: JRE binary not found at $JRE_BIN"
fi

# 2. Установка прав на основное приложение
if [ -f "$APP_DIR/planpro-electron" ]; then
    chmod +x "$APP_DIR/planpro-electron"
fi

# 3. Регистрация в системе (Fly-WM / Desktop)
# Обычно выполняется автоматически через .desktop файл, 
# но здесь мы можем добавить специфичные для Astra Linux действия, если потребуется.

echo "ПланПро configuration completed successfully."
