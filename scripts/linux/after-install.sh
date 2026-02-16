#!/bin/bash

# Скрипт после установки для ПланПро (Astra Linux / Debian)
# Устанавливает необходимые права доступа для встроенного JRE и бинарных файлов,
# создаёт ярлык на рабочем столе и обновляет системные кеши.

# НЕ используем set -e чтобы скрипт не останавливался при ошибках
# (некоторые операции могут быть опциональными или зависят от DE)

APP_DIR="/opt/ПланПро"
JRE_BIN="$APP_DIR/resources/jre/bin/java"

echo "============================================"
echo "ПланПро: Настройка после установки"
echo "============================================"

# 1. Установка прав на исполнение для JRE
echo "[1/5] Настройка прав на JRE..."
if [ -f "$JRE_BIN" ]; then
    chmod +x "$JRE_BIN" 2>/dev/null && echo "  ✓ JRE executable permissions set" || echo "  ⚠ Failed to set JRE permissions (non-critical)"
    # Также для других утилит в bin, если они есть
    chmod +x "$APP_DIR/resources/jre/bin/"* 2>/dev/null || true
else
    echo "  ⚠ Warning: JRE binary not found at $JRE_BIN"
fi

# 2. Установка прав на основное приложение
echo "[2/5] Настройка прав на приложение..."
if [ -f "$APP_DIR/com.prosystems.planpro" ]; then
    chmod +x "$APP_DIR/com.prosystems.planpro" 2>/dev/null && echo "  ✓ com.prosystems.planpro executable permissions set" || echo "  ⚠ Failed to set executable permissions"
else
    echo "  ⚠ Warning: com.prosystems.planpro binary not found"
fi

# 3. Создание ярлыка на рабочем столе для всех пользователей
echo "[3/5] Создание ярлыков на рабочем столе..."
DESKTOP_FILE="/usr/share/applications/com.prosystems.planpro.desktop"

if [ -f "$DESKTOP_FILE" ]; then
    SHORTCUTS_CREATED=0
    
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
            
            DESKTOP_SHORTCUT="$DESKTOP_DIR/com.prosystems.planpro.desktop"
            
            # Копирование .desktop файла
            if cp "$DESKTOP_FILE" "$DESKTOP_DIR/" 2>/dev/null; then
                # Установка владельца (пользователь:группа)
                chown "$USERNAME":"$USERNAME" "$DESKTOP_SHORTCUT" 2>/dev/null || true
                
                # Установка прав на исполнение (для некоторых DE требуется)
                chmod +x "$DESKTOP_SHORTCUT" 2>/dev/null || true
                
                # Пометка как trusted (критично для GNOME/Ubuntu 18.04+/Astra Linux)
                # Используем su для выполнения от имени пользователя
                su - "$USERNAME" -c "gio set '$DESKTOP_SHORTCUT' metadata::trusted true" 2>/dev/null || \
                su - "$USERNAME" -c "gio set '$DESKTOP_SHORTCUT' metadata::trusted yes" 2>/dev/null || \
                true
                
                echo "  ✓ Desktop shortcut created for user: $USERNAME"
                SHORTCUTS_CREATED=$((SHORTCUTS_CREATED + 1))
            else
                echo "  ⚠ Failed to create shortcut for user: $USERNAME"
            fi
        fi
    done
    
    if [ $SHORTCUTS_CREATED -eq 0 ]; then
        echo "  ⚠ No desktop shortcuts created (no Desktop folders found)"
    else
        echo "  ✓ Total shortcuts created: $SHORTCUTS_CREATED"
    fi
else
    echo "  ⚠ Warning: Desktop file not found at $DESKTOP_FILE"
    echo "  This may indicate an incomplete installation."
fi

# 4. Обновление базы данных MIME и desktop entries
echo "[4/5] Обновление системных баз данных..."
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications 2>/dev/null && \
        echo "  ✓ Desktop database updated" || \
        echo "  ⚠ Failed to update desktop database (non-critical)"
else
    echo "  ℹ update-desktop-database not found (optional)"
fi

# 5. Обновление кеша иконок
echo "[5/5] Обновление кеша иконок..."
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache /usr/share/icons/hicolor -f 2>/dev/null && \
        echo "  ✓ Icon cache updated" || \
        echo "  ⚠ Failed to update icon cache (non-critical)"
else
    echo "  ℹ gtk-update-icon-cache not found (optional)"
fi

# Альтернативная команда для обновления кеша (для некоторых систем)
if command -v update-icon-caches >/dev/null 2>&1; then
    update-icon-caches /usr/share/icons/hicolor 2>/dev/null || true
fi

echo "============================================"
echo "✅ ПланПро успешно настроен!"
echo "============================================"
echo ""
echo "Приложение установлено в: $APP_DIR"
echo "Запуск: Меню приложений → Офис → ПланПро"
echo "или через ярлык на рабочем столе"
echo ""
