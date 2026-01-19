#!/bin/bash

# Создание структуры ресурсов для Electron
mkdir -p resources/jre/bin
mkdir -p resources/logs

# Создание простого Java симулятора для демонстрации
cat > resources/projectlibre.jar << 'EOF'
#!/bin/bash
echo "Started ProjectLibreApplication"
echo "Mock Java backend started on port \$1"
while true; do
    sleep 1
done
EOF

# Создание символьной ссылки для Java (для разработки)
if [ ! -f "resources/jre/bin/java.exe" ]; then
    echo "Creating mock java executable..."
    echo "#!/bin/bash" > resources/jre/bin/java.exe
    echo "echo 'Mock Java for development'" >> resources/jre/bin/java.exe
    chmod +x resources/jre/bin/java.exe
fi

echo "Resources structure created for development"