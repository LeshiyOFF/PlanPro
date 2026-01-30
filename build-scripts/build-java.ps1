<#
.SYNOPSIS
    Build Java backend component for ProjectLibre with complete isolation
.DESCRIPTION
    Isolated Java build using local Ant, outputs to timestamped directory
    Ensures no conflicts with parallel builds or global dependencies
    Exits with code 1 on any error
#>

param(
    [string]$ProjectRoot,
    [string]$JavaSourceDir,
    [string]$FinalOutputDir,
    [string]$DistStructure,
    [switch]$UseLegacyStructure
)

$ErrorActionPreference = "Stop"

# Initialize default values in body to avoid PS5.1 parser issues
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = "$PSScriptRoot\.." }
if ([string]::IsNullOrWhiteSpace($DistStructure)) { $DistStructure = "dist-app" }

# Динамическое определение целевой структуры
$TargetDistName = if ($UseLegacyStructure) { "dist" } else { $DistStructure }

if ([string]::IsNullOrWhiteSpace($FinalOutputDir)) {
    # Для Java финальный результат должен быть доступен electron-builder
    $FinalOutputDir = "$ProjectRoot\projectlibre_build\dist"
}

# Import common utilities for isolation
. "$PSScriptRoot\common.ps1"

try {
    # Устанавливаем и резолвим путь к Java исходникам
    if ([string]::IsNullOrWhiteSpace($JavaSourceDir)) {
        $JavaSourceDir = "$PSScriptRoot\..\projectlibre_build"
    }
    $JavaSourceDir = (Resolve-Path $JavaSourceDir).Path
    
    Write-EnhancedLog "Starting isolated Java build process..."
    Write-EnhancedLog "Project root: $ProjectRoot"
    Write-EnhancedLog "Java source: $JavaSourceDir"
    Write-EnhancedLog "Final output: $FinalOutputDir"

    # ИЗОЛЯЦИЯ: Создаем уникальную директорию сборки
    $IsolatedBuildDir = New-IsolatedBuildDir -BuildType "java" -BaseDir "$PSScriptRoot\.."
    Write-EnhancedLog "Isolated build directory: $IsolatedBuildDir"
    
    # ИЗОЛЯЦИЯ: Проверяем и останавливаем блокирующие процессы
    Stop-BlockingProcesses -ProcessNames @("java", "ant", "ProjectLibre")

    # ИЗОЛЯЦИЯ: Проверяем наличие локального Ant
    $LocalAntDir = "$PSScriptRoot\tools\apache-ant-1.10.15"
    $LocalAntPath = "$LocalAntDir\bin\ant.bat"
    
    if (-not (Test-Path $LocalAntPath)) {
        throw "Local Ant required for isolated build at $LocalAntPath"
    }

    # Create Java build directory inside isolated build
    $JavaBuildDir = Join-Path $IsolatedBuildDir "java"
    New-Item -ItemType Directory -Path $JavaBuildDir -Force | Out-Null

    # Change to Java source directory
    Push-Location $JavaSourceDir
    Write-EnhancedLog "Changed directory to: $(Get-Location)"
    
    # Check for build.xml
    if (-not (Test-Path "build.xml")) {
        throw "build.xml not found in $JavaSourceDir"
    }

    # Run Ant build with local Ant
    Write-EnhancedLog "Running Ant build with isolated environment..."
    
    # ИЗОЛЯЦИЯ: Устанавливаем локальную среду
    $env:ANT_HOME = $LocalAntDir
    
    # Пытаемся найти JDK для компиляции (JRE недостаточно)
    $jdkPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
    if (Test-Path $jdkPath) {
        $env:JAVA_HOME = $jdkPath
        Write-EnhancedLog "Using detected JDK: $jdkPath" "SUCCESS"
    } elseif (Test-Command "java") {
        $env:JAVA_HOME = Split-Path (Get-Command java).Source -Parent
    }
    
    # 1. Собираем Core
    Write-EnhancedLog "Building ProjectLibre Core..." "INFO"
    $antArgs = @("-f", "build.xml")
    $process = Start-Process -FilePath $LocalAntPath -ArgumentList $antArgs -Wait -PassThru -NoNewWindow -WorkingDirectory $JavaSourceDir
    
    if ($process.ExitCode -ne 0) {
        throw "Core Ant build failed with exit code: $($process.ExitCode)"
    }

    # 2. Собираем API (НОВОЕ)
    Write-EnhancedLog "Building ProjectLibre REST API..." "INFO"
    $ApiDir = Join-Path $ProjectRoot "projectlibre-api"
    if (Test-Path $ApiDir) {
        $apiAntArgs = @("-f", "build.xml", "package")
        $apiProcess = Start-Process -FilePath $LocalAntPath -ArgumentList $apiAntArgs -Wait -PassThru -NoNewWindow -WorkingDirectory $ApiDir
        
        if ($apiProcess.ExitCode -ne 0) {
            throw "API Ant build failed with exit code: $($apiProcess.ExitCode)"
        }
        Write-EnhancedLog "REST API build completed successfully!" "SUCCESS"
    } else {
        Write-EnhancedLog "projectlibre-api directory not found, skipping API build" "WARN"
    }

    # Verify dist directory was created
    $DistDir = Join-Path $JavaSourceDir "dist"
    if (-not (Test-Path $DistDir)) {
        throw "Build output directory not found: $DistDir"
    }

    # Copy artifacts to isolated build directory
    Write-EnhancedLog "Copying Java artifacts to isolated build directory..."
    Copy-Item (Join-Path $DistDir "projectlibre.jar") $JavaBuildDir -Force
    if (Test-Path (Join-Path $DistDir "lib")) {
        Copy-Item (Join-Path $DistDir "lib") $JavaBuildDir -Recurse -Force
    }

    # Копируем API артефакты (НОВОЕ)
    $ApiDistDir = Join-Path $ApiDir "target\dist"
    if (Test-Path $ApiDistDir) {
        Write-EnhancedLog "Copying API artifacts..." "INFO"
        Copy-Item (Join-Path $ApiDistDir "projectlibre-api-1.0.0.jar") (Join-Path $JavaBuildDir "projectlibre-api-final.jar") -Force
        
        # Копируем зависимости API
        $ApiLibDir = Join-Path $ApiDir "lib"
        if (Test-Path $ApiLibDir) {
            Copy-Item (Join-Path $ApiLibDir "*") $JavaBuildDir -Recurse -Force
        }
    }

    # ВАЛИДАЦИЯ: Проверяем все артефакты
    Test-RequiredArtifacts -RequiredFiles @(Join-Path $JavaBuildDir "projectlibre.jar") -Context "Java build"

    Write-EnhancedLog "Java build completed successfully!"
    
    # АТОМАРНАЯ ОПЕРАЦИЯ: Перемещаем в финальную директорию
    if (Test-Path $FinalOutputDir) {
        Remove-Item -Recurse -Force $FinalOutputDir -ErrorAction SilentlyContinue
    }
    
    $ParentDir = Split-Path $FinalOutputDir -Parent
    if (-not (Test-Path $ParentDir)) {
        New-Item -ItemType Directory -Path $ParentDir -Force | Out-Null
    }
    
    Move-DirectoryAtomic -Source $JavaBuildDir -Destination $FinalOutputDir

    # ИНТЕГРАЦИЯ С RELEASE: Копируем для обратной совместимости в release/java/lib
    $ReleaseJavaLib = Join-Path $ProjectRoot "release\java\lib"
    Write-EnhancedLog "Syncing with release directory: $ReleaseJavaLib" "INFO"
    if (-not (Test-Path $ReleaseJavaLib)) {
        New-Item -ItemType Directory -Path $ReleaseJavaLib -Force | Out-Null
    }
    Copy-Item (Join-Path $FinalOutputDir "*.jar") $ReleaseJavaLib -Force
    if (Test-Path (Join-Path $FinalOutputDir "lib")) {
        Copy-Item (Join-Path $FinalOutputDir "lib\*") $ReleaseJavaLib -Recurse -Force
    }

    Write-EnhancedLog "✅ Java build artifacts moved to: $FinalOutputDir" "SUCCESS"
    Write-EnhancedLog "✅ Java build artifacts synced to: $ReleaseJavaLib" "SUCCESS"

} catch {
    Write-EnhancedLog "❌ Java build failed: $($_.Exception.Message)" "ERROR"
    if ($IsolatedBuildDir -and (Test-Path $IsolatedBuildDir)) {
        Remove-Item -Recurse -Force $IsolatedBuildDir -ErrorAction SilentlyContinue
    }
    exit 1
} finally {
    Clear-BuildResources -BuildDir $IsolatedBuildDir -EnvVars @("ANT_HOME", "JAVA_HOME")
    if ((Get-Location) -ne $ProjectRoot) {
        Pop-Location -ErrorAction SilentlyContinue
    }
}

exit 0
