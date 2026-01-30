#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Build React frontend component for ProjectLibre with complete isolation
.DESCRIPTION
    Isolated React build using local Node.js and npm, outputs to timestamped directory
    Ensures no conflicts with parallel builds or global dependencies
    Exits with code 1 on any error
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputDirectory = "",
    [Parameter(Mandatory=$false)]
    [string]$DistStructure = "dist-app",
    [Parameter(Mandatory=$false)]
    [switch]$UseLegacyStructure = $false
)

$ErrorActionPreference = "Stop"

# НОРМАЛИЗАЦИЯ ПУТЕЙ: Преобразуем все пути в абсолютные
$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path

# Динамическое определение целевой директории dist на основе параметров
$TargetDistName = if ($UseLegacyStructure) { "dist" } else { $DistStructure }
$DefaultDistDir = "$ProjectRoot\$TargetDistName"

$DefaultOutputDir = "$ProjectRoot\build\frontend"
if ($OutputDirectory) { 
    $resolved = Resolve-Path -Path $OutputDirectory -ErrorAction SilentlyContinue 
    if ($resolved) { $FinalOutputDir = $resolved.Path } 
    else { $FinalOutputDir = Join-Path $ProjectRoot $OutputDirectory } 
} else { 
    $FinalOutputDir = $DefaultOutputDir 
}

# Import common utilities for isolation
. "$PSScriptRoot\common.ps1"

# Проверка наличия всех требуемых функций из common.ps1
$helpers = @('New-IsolatedBuildDir','Stop-BlockingProcesses','Write-EnhancedLog','Write-TextUtf8NoBom','Test-RequiredArtifacts','Clear-BuildResources','New-TempDirectory')
foreach ($h in $helpers) { 
    if (-not (Get-Command $h -ErrorAction SilentlyContinue)) { 
        throw "Required helper $h missing from common.ps1" 
    } 
}

try {
    Write-EnhancedLog "Starting isolated frontend build process..." -Level "INFO"
    Write-EnhancedLog "Абсолютный путь проекта: $ProjectRoot" -Level "INFO"
    Write-EnhancedLog "Финальная директория вывода: $FinalOutputDir" -Level "INFO"

    # ИЗОЛЯЦИЯ: Создаем уникальную директорию сборки
    $IsolatedBuildDir = New-IsolatedBuildDir -BuildType "frontend" -BaseDir "$PSScriptRoot\.."
    Write-EnhancedLog "Isolated build directory: $IsolatedBuildDir" -Level "INFO"
    
    # ИЗОЛЯЦИЯ: Проверяем и останавливаем блокирующие процессы
    Stop-BlockingProcesses -ProcessNames @("node", "npm", "electron") -ForceIDE:$false

    # ИЗОЛЯЦИЯ: Проверяем наличие локального Node.js
    $LocalNodeDir = "$PSScriptRoot\tools\nodejs"
    $LocalNodePath = "$LocalNodeDir\node.exe"
    $LocalNpmPath = "$LocalNodeDir\npm.cmd"
    
    if (-not (Test-Path $LocalNodePath)) {
        Write-EnhancedLog "Local Node.js not found at: $LocalNodePath" -Level "WARN"
        Write-EnhancedLog "Please download Node.js 18.x to tools directory for isolation" -Level "INFO"
        
        # Fallback to system Node.js with version check
        if (-not (Test-Command "node")) {
            throw "Node.js not found. Please install Node.js 18.x or later."
        }
        
        if (-not (Test-Command "npm")) {
            throw "npm not found. Please install npm."
        }
        
        $nodeVersion = & node --version 2>&1
        $npmVersion = & npm --version 2>&1
        Write-EnhancedLog "Using system Node.js: $nodeVersion" -Level "WARN"
        Write-EnhancedLog "Using system npm: $npmVersion" -Level "WARN"
        
        $UseSystemNode = $true
    } else {
        Write-EnhancedLog "Using local Node.js: $LocalNodePath" -Level "SUCCESS"
        $UseSystemNode = $false
    }

    # Change to project root
    Push-Location $ProjectRoot
    Write-EnhancedLog "Changed directory to: $(Get-Location)" -Level "INFO"

    # Check package.json
    if (-not (Test-Path "package.json")) {
        throw "package.json not found in $ProjectRoot"
    }

    # Create frontend build directory inside isolated build
    $FrontendBuildDir = "$IsolatedBuildDir\frontend"
    New-Item -ItemType Directory -Path $FrontendBuildDir -Force | Out-Null

    # ИЗОЛЯЦИЯ: Устанавливаем локальные зависимости
    # ИЗОЛЯЦИЯ: Создаем изолированную директорию для node_modules
    $IsolatedNodeModulesDir = "$IsolatedBuildDir\node_modules"
    $OriginalNodeModulesDir = "$ProjectRoot\node_modules"
    
    # Создаем символическую ссылку или копируем node_modules в изолированную директорию
    if (-not (Test-Path $IsolatedNodeModulesDir)) {
        if (Test-Path $OriginalNodeModulesDir) {
            Write-EnhancedLog "Copying existing node_modules to isolated directory..." -Level "INFO"
            Copy-Item $OriginalNodeModulesDir $IsolatedNodeModulesDir -Recurse -Force
        }
    }
    
    # Устанавливаем зависимости в изолированной среде
    if (-not (Test-Path $IsolatedNodeModulesDir) -or $UseSystemNode) {
        Write-EnhancedLog "Installing dependencies in isolated environment..." -Level "INFO"
        
        # Создаем изолированную директорию для сборки
        $IsolatedProjectDir = "$IsolatedBuildDir\project"
        New-Item -ItemType Directory -Path $IsolatedProjectDir -Force | Out-Null
        
        # Копируем package.json в изолированную директорию
        Copy-Item "$ProjectRoot\package.json" $IsolatedProjectDir -Force
        if (Test-Path "$ProjectRoot\package-lock.json") {
            Copy-Item "$ProjectRoot\package-lock.json" $IsolatedProjectDir -Force
        }
        
        Push-Location $IsolatedProjectDir
        
        try {
            if ($UseSystemNode) {
                $env:NODE_PATH = "$IsolatedNodeModulesDir"
                & npm install --prefix $IsolatedProjectDir; $npmExitCode = $LASTEXITCODE
            } else {
                $env:NODE_PATH = "$IsolatedNodeModulesDir"
                $env:PATH = "$LocalNodeDir;$env:PATH"
                & "$LocalNpmPath" install --prefix $IsolatedProjectDir; $npmExitCode = $LASTEXITCODE
            }
            
            if ($npmExitCode -ne 0) {
                throw "npm install failed with exit code: $npmExitCode"
            }
            
            Write-EnhancedLog "Dependencies installed successfully in isolated environment" -Level "SUCCESS"
        } finally {
            Pop-Location
            # Очищаем временные переменные среды
            if ($env:NODE_PATH) { Remove-Item Env:\NODE_PATH }
        }
    } else {
        Write-EnhancedLog "Isolated node_modules already exists, skipping npm install" -Level "INFO"
    }

    # Check for vite config
    $viteConfigFiles = @("vite.config.js", "vite.config.ts", "vite.config.mjs")
    $viteConfig = $null
    foreach ($config in $viteConfigFiles) {
        if (Test-Path $config) {
            $viteConfig = $config
            break
        }
    }
    
    if (-not $viteConfig) {
        Write-EnhancedLog "No Vite config found, using default configuration" -Level "WARN"
    } else {
        Write-EnhancedLog "Using Vite config: $viteConfig" -Level "INFO"
    }

    # ИЗОЛЯЦИЯ: Создаем временный файл для сборки
    $tempBat = New-TempDirectory -Prefix "vite-build"
    $BatchFile = Join-Path $tempBat "run-vite-build.bat"
    
    # Run Vite build with isolated environment
    Write-EnhancedLog "Running Vite build with isolated environment..." -Level "INFO"
    
    # Set environment variables for production build
    $env:NODE_ENV = "production"
    $env:VITE_BUILD_TARGET = "electron"
    $env:VITE_OUT_DIR = $TargetDistName
    
    # Create batch file with proper command
    if ($UseSystemNode) {
        $buildCommand = "npm run build"
        $cleanBuildCommand = $buildCommand.Trim()
        $batchContent = "@echo off`r`n"
        $batchContent += "cd /d `"$ProjectRoot`"`r`n"
        $batchContent += "$cleanBuildCommand`r`n"
        $batchContent += "exit %ERRORLEVEL%`r`n"
    } else {
        $buildCommand = "`"$LocalNpmPath`" run build"
        $cleanBuildCommand = $buildCommand.Trim()
        $batchContent = "@echo off`r`n"
        $batchContent += "cd /d `"$ProjectRoot`"`r`n"
        $batchContent += "set `"PATH=$LocalNodeDir;%PATH%`"`r`n"
        $batchContent += "$cleanBuildCommand`r`n"
        $batchContent += "exit %ERRORLEVEL%`r`n"
    }
    
    Write-TextUtf8NoBom -Path $BatchFile -Content $batchContent
    
    # Use cmd to run batch file with proper error handling
    $process = Start-Process -FilePath "cmd" -ArgumentList "/c", $BatchFile -Wait -PassThru -NoNewWindow -RedirectStandardOutput "$tempBat\vite-build.log" -RedirectStandardError "$tempBat\vite-error.log"
    
    if ($process.ExitCode -ne 0) {
        Write-EnhancedLog "Vite build failed with exit code: $($process.ExitCode)" -Level "ERROR"
        if (Test-Path "$tempBat\vite-error.log") {
            Write-EnhancedLog "Vite error log:" -Level "ERROR"
            Get-Content "$tempBat\vite-error.log" | ForEach-Object { Write-EnhancedLog "  $_" -Level "ERROR" }
        }
        throw "Vite build failed"
    }

    # Check default dist directory
    $DefaultDistDir = "$ProjectRoot\$DistStructure"
    if (-not (Test-Path $DefaultDistDir)) {
        throw "Vite build output directory not found: $DefaultDistDir"
    }

    # Copy dist contents to isolated build directory
    Write-EnhancedLog "Copying frontend artifacts to isolated build directory..." -Level "INFO"
    Copy-Item "$DefaultDistDir\*" $FrontendBuildDir -Recurse -Force

    # ВАЛИДАЦИЯ: Проверяем все артефакты
    $RequiredArtifacts = @(
        "$FrontendBuildDir\index.html",
        "$FrontendBuildDir\assets"
    )
    
    Test-RequiredArtifacts -RequiredFiles $RequiredArtifacts -Context "Frontend build"

    # Check for additional assets
    $assetsDir = "$FrontendBuildDir\assets"
    if (Test-Path $assetsDir) {
        $assetCount = (Get-ChildItem $assetsDir).Count
        Write-EnhancedLog "Found $assetCount asset files" -Level "INFO"
    }

    # Check build size
    $buildSize = (Get-ChildItem $FrontendBuildDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
    Write-EnhancedLog "Frontend build size: $buildSizeMB MB" -Level "INFO"

    Write-EnhancedLog "Frontend build completed successfully!" -Level "SUCCESS"
    
    # Show directory structure
    Write-EnhancedLog "Frontend build artifacts:" -Level "INFO"
    Get-ChildItem $FrontendBuildDir -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Replace($FrontendBuildDir, "").TrimStart("\")
        $indent = "  " * ($relativePath.Split("\").Count - 1)
        if ($_.PSIsContainer) {
            Write-EnhancedLog "$indent└─📁 $($_.Name)" -Level "INFO"
        } else {
            $size = if ($_.Length -gt 1MB) { "$([math]::Round($_.Length/1MB,2))MB" } elseif ($_.Length -gt 1KB) { "$([math]::Round($_.Length/1KB,2))KB" } else { "$($_.Length)B" }
            Write-EnhancedLog "$indent  📄 $($_.Name) ($size)" -Level "INFO"
        }
    }

    # ВАЛИДАЦИЯ ПУТЕЙ: Проверяем исходные файлы
    $SourcePath = "$FrontendBuildDir"
    $DestinationPath = "$FinalOutputDir"
    
    Write-EnhancedLog "Путь сборки frontend: $FrontendBuildDir" -Level "INFO"
    Write-EnhancedLog "Исходный путь для копирования: $SourcePath" -Level "INFO"
    Write-EnhancedLog "Путь назначения: $DestinationPath" -Level "INFO"
    
    if (-not (Test-Path $SourcePath)) {
        Write-EnhancedLog "ОШИБКА: Директория dist не найдена: $SourcePath" -Level "ERROR"
        throw "Директория dist не найдена: $SourcePath"
    }
    
    # Проверяем и создаем директорию вывода
    if (-not (Test-Path $DestinationPath)) {
        $ParentDir = Split-Path $DestinationPath -Parent
        if ($ParentDir -and -not (Test-Path $ParentDir)) {
            New-Item -ItemType Directory -Path $ParentDir -Force | Out-Null
        }
        New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
        Write-EnhancedLog "Создана директория вывода: $DestinationPath" -Level "INFO"
    }
    
    # АТОМАРНАЯ ОПЕРАЦИЯ: Копируем в финальную директорию
    if (Test-Path $DestinationPath) {
        # Удаляем только содержимое, а не саму директорию
        Get-ChildItem $DestinationPath -Recurse -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
    }
    
    # Используем корректные пути для копирования
    Write-EnhancedLog "Копирование файлов из: $SourcePath в: $DestinationPath" -Level "INFO"
    
    if (Get-Command robocopy -ErrorAction SilentlyContinue) {
        Write-EnhancedLog "Используем robocopy для быстрого копирования" -Level "INFO"
        $robocopyArgs = @($SourcePath, $DestinationPath, "/MIR", "/MT:8", "/Z", "/NFL", "/NDL")
        $robocopyProcess = Start-Process -FilePath robocopy -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru
        if ($robocopyProcess.ExitCode -lt 8) {
            Write-EnhancedLog "Frontend build artifacts copied to: $DestinationPath" -Level "SUCCESS"
        } else {
            Write-EnhancedLog "Robocopy failed with exit code: $($robocopyProcess.ExitCode)" -Level "ERROR"
            throw "Failed to copy frontend artifacts to $DestinationPath"
        }
    } else {
        Write-EnhancedLog "Используем Copy-Item для копирования" -Level "INFO"
        Copy-Item -Path "$SourcePath\*" -Destination $DestinationPath -Recurse -Force
        
        # Проверяем результат копирования через Test-RequiredArtifacts
        Test-RequiredArtifacts -RequiredFiles @("$DestinationPath\index.html", "$DestinationPath\assets") -Context "Frontend copy"
        Write-EnhancedLog "Frontend build artifacts copied to: $DestinationPath" -Level "SUCCESS"
    }

    Write-EnhancedLog "Frontend build artifacts successfully copied to: $DestinationPath" -Level "SUCCESS"
    Write-EnhancedLog "Main HTML entry point: $DestinationPath\index.html" -Level "INFO"
} catch {
    Write-EnhancedLog "Frontend build failed: $($_.Exception.Message)" -Level "ERROR"
    $errorMessage = $_.Exception.ToString()
    Write-EnhancedLog "Full error: $errorMessage" -Level "ERROR"
    
    # ОЧИСТКА: Удаляем временную директорию при ошибке
    if ($IsolatedBuildDir -and (Test-Path $IsolatedBuildDir)) {
        Remove-Item -Recurse -Force $IsolatedBuildDir -ErrorAction SilentlyContinue
    }
    
    if ($tempBat -and (Test-Path $tempBat)) {
        Remove-Item -Recurse -Force $tempBat -ErrorAction SilentlyContinue
    }
    
    exit 1
} finally {
    # ОЧИСТКА РЕСУРСОВ: Восстанавливаем environment и очищаем
    Clear-BuildResources -BuildDir $IsolatedBuildDir -EnvVars @('NODE_ENV','VITE_BUILD_TARGET','VITE_OUT_DIR')
    # Безопасное восстановление директории
    if ((Get-Location) -ne $ProjectRoot) {
        Pop-Location -ErrorAction SilentlyContinue
    }
}

exit 0