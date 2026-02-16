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
if [ -f "$APP_DIR/planpro" ]; then
    chmod +x "$APP_DIR/planpro"
    echo "  ✓ Executable permissions set for planpro"
fi

# 3. Создание ярлыка на рабочем столе для всех пользователей
DESKTOP_FILE="/usr/share/applications/com.prosystems.planpro.desktop"

if [ -f "$DESKTOP_FILE" ]; then
    echo "Creating desktop shortcuts for all users..."
    
    # Для каждого пользователя в /home/*
    for USER_HOME in /home/*; do
        if [ -d "$USER_HOME" ]; then
            USERNAME=$(basename "$USER_HOME")
            
            # Проверка английской папки Desktop
            if [ -d "$USER_HOME/Desktop" ]; then
                DESKTOP_DIR="$USER_HOME/Desktop"
            # Проверка русской папки Рабочий стол
            elif [ -d "$USER_HOME/Рабочий стол" ]; then
                DESKTOP_DIR="$USER_HOME/Рабочий стол"
            else
                # Нет папки рабочего стола - пропускаем
                continue
            fi
            
            # Копирование .desktop файла
            cp "$DESKTOP_FILE" "$DESKTOP_DIR/" 2>/dev/null || true
            
            # Установка владельца (пользователь:группа)
            chown "$USERNAME":"$USERNAME" "$DESKTOP_DIR/com.prosystems.planpro.desktop" 2>/dev/null || true
            
            # Установка прав на исполнение (для некоторых DE требуется)
            chmod +x "$DESKTOP_DIR/com.prosystems.planpro.desktop" 2>/dev/null || true
            
            echo "  ✓ Desktop shortcut created for user: $USERNAME"
        fi
    done
else
    echo "Warning: Desktop file not found at $DESKTOP_FILE"
fi

# 4. Регистрация в системе (Fly-WM / Desktop)
# Обычно выполняется автоматически через .desktop файл, 
# но здесь мы можем добавить специфичные для Astra Linux действия, если потребуется.

echo "ПланПро configuration completed successfully."
