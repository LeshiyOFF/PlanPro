#!/bin/bash

# Скрипт после установки для ПланПро (Linux)
# Устанавливает необходимые права доступа для встроенного JRE и исполняемого файла,
# обновляет системные кеши иконок и desktop entries.
#
# Best practices:
# - НЕ копирует ярлыки на рабочий стол (пользователь сделает это сам из меню)
# - НЕ использует gio set (не работает в postinst без GUI сессии)
# - НЕ модифицирует домашние директории пользователей (bad practice)

# НЕ используем set -e чтобы скрипт не останавливался при ошибках
# (некоторые операции могут быть опциональными или зависят от окружения)

APP_DIR="/opt/ПланПро"
JRE_BIN="$APP_DIR/resources/jre/linux/bin/java"
EXECUTABLE="$APP_DIR/PlanPro"

echo "============================================"
echo "ПланПро: Настройка после установки"
echo "============================================"

# 1. Установка прав на исполнение для JRE
echo "[1/4] Настройка прав на JRE..."
if [ -f "$JRE_BIN" ]; then
    chmod +x "$JRE_BIN" 2>/dev/null && echo "  ✓ JRE executable permissions set" || echo "  ⚠ Failed to set JRE permissions (non-critical)"
    # Также для других утилит в bin, если они есть
    chmod +x "$APP_DIR/resources/jre/linux/bin/"* 2>/dev/null || true
else
    echo "  ⚠ Warning: JRE binary not found at $JRE_BIN"
fi

# 2. Установка прав на основное приложение
echo "[2/4] Настройка прав на приложение..."
if [ -f "$EXECUTABLE" ]; then
    chmod +x "$EXECUTABLE" 2>/dev/null && echo "  ✓ PlanPro executable permissions set" || echo "  ⚠ Failed to set executable permissions"
else
    echo "  ⚠ Warning: PlanPro binary not found at $EXECUTABLE"
fi

# 3. Обновление базы данных MIME и desktop entries
echo "[3/4] Обновление системных баз данных..."
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications 2>/dev/null && \
        echo "  ✓ Desktop database updated" || \
        echo "  ⚠ Failed to update desktop database (non-critical)"
else
    echo "  ℹ update-desktop-database not found (optional)"
fi

# 4. Обновление кеша иконок
echo "[4/4] Обновление кеша иконок..."
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
echo "✅ ПланПро успешно установлен!"
echo "============================================"
echo ""
echo "Приложение доступно в: Меню → Офис → ПланПро"
echo "Или запустите из терминала: $EXECUTABLE"
echo ""
echo "Для добавления ярлыка на рабочий стол:"
echo "  1. Откройте меню приложений"
echo "  2. Найдите ПланПро в разделе Офис"
echo "  3. Перетащите на рабочий стол"
echo ""
