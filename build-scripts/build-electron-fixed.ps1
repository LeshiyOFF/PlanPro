#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Build complete ProjectLibre Electron application with isolated frontend and Java components
.DESCRIPTION
    Integrates frontend build artifacts with Java JARs and packages into executable
    Uses isolated environments and creates distributable package
#>

param(
    [Parameter(Mandatory=$false)]
        [string]$ProjectRoot = "",
        
    [Parameter(Mandatory=$false)]
        [string]$FrontendDir = "",
        
    [Parameter(Mandatory=$false)]
        [string]$JavaDir = "",
        
    [Parameter(Mandatory=$false)]
        [string]$OutputDir = "",

    [Parameter(Mandatory=$false)]
        [string]$DistStructure = "dist-app",

    [Parameter(Mandatory=$false)]
        [switch]$UseLegacyStructure = $false
)

$ErrorActionPreference = "Stop"

# Import common utilities for isolation
. "$PSScriptRoot\common.ps1"

# Set default paths
if (-not $ProjectRoot) { $ProjectRoot = "$PSScriptRoot\.." }

# Динамическое определение путей на основе параметров структуры
$TargetDistName = if ($UseLegacyStructure) { "dist" } else { $DistStructure }

if (-not $FrontendDir) { $FrontendDir = "$ProjectRoot\$TargetDistName" }
if (-not $JavaDir) { $JavaDir = "$ProjectRoot\projectlibre_build\dist" }
if (-not $OutputDir) { $OutputDir = "$ProjectRoot\release" }

try {
    Write-EnhancedLog "Starting Electron application build..." -Level "INFO"
    Write-EnhancedLog "Project root: $ProjectRoot" -Level "INFO"
    Write-EnhancedLog "Frontend dir: $FrontendDir" -Level "INFO"
    Write-EnhancedLog "Java dir: $JavaDir" -Level "INFO"
    Write-EnhancedLog "Output dir: $OutputDir" -Level "INFO"

    # Create isolated build directory
    $BuildDir = New-IsolatedBuildDir -BuildType "electron"
    Write-EnhancedLog "Created isolated build directory: $BuildDir" -Level "INFO"

    # ENHANCED: Stop and verify blocking processes with concurrent protection
    Write-EnhancedLog "Enhanced process isolation: Stop & Verify" -Level "INFO"
    
    # First attempt: Graceful stop
    Write-EnhancedLog "Attempting graceful process termination..." -Level "INFO"
    Stop-BlockingProcesses -ProcessNames @("ProjectLibre", "electron", "electron-builder", "node")
    
    # Extended wait and verification loop
    $maxWaitTime = 60
    $maxRetries = 10
    $retryDelay = 6
    
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        Write-EnhancedLog "Process check attempt $attempt/$maxRetries" -Level "INFO"
        
        # Check for ANY competing processes (including potential race conditions)
        $allProcesses = Get-Process | Where-Object { 
            $_.ProcessName -match "ProjectLibre|electron|electron-builder|electron-builder" 
        } | Sort-Object -Property Id -Unique
        
        if ($allProcesses) {
            Write-EnhancedLog "Found $($allProcesses.Count) competing process(es): $($allProcesses.ProcessName -join ', ')" -Level "WARN"
            
            # Aggressive process termination with multiple methods
            $allProcesses | ForEach-Object {
                $process = $_
                try {
                    # Method 1: Graceful termination
                    $process.CloseMainWindow() | Out-Null
                    Start-Sleep -Seconds 2
                    
                    # Method 2: Process tree termination
                    if (-not $process.HasExited) {
                        $process.Kill()
                        Start-Sleep -Seconds 1
                    }
                } catch {
                    Write-EnhancedLog "Failed to terminate process $($process.Id): $($_.Exception.Message)" -Level "WARN"
                }
            }
            
            # Extended wait for process cleanup
            Write-EnhancedLog "Waiting for process cleanup ($retryDelay seconds)..." -Level "INFO"
            Start-Sleep -Seconds $retryDelay
            
            # Verify all processes are gone
            $remainingProcesses = Get-Process | Where-Object { 
                $_.ProcessName -match "ProjectLibre|electron|electron-builder|electron-builder" 
            }
            
            if ($remainingProcesses.Count -gt 0) {
                Write-EnhancedLog "$($remainingProcesses.Count) processes still running: $($remainingProcesses.ProcessName -join ', ')" -Level "ERROR"
                
                if ($attempt -eq $maxRetries) {
                    Write-EnhancedLog "CRITICAL: Cannot ensure clean environment after $maxRetries attempts" -Level "ERROR"
                    throw "Failed to ensure clean process environment after $maxRetries attempts"
                }
                
                Write-EnhancedLog "Retrying in $($retryDelay * $attempt) seconds..." -Level "WARN"
            } else {
                Write-EnhancedLog "All competing processes successfully terminated" -Level "SUCCESS"
                Write-EnhancedLog "Additional cleanup wait before build..." -Level "INFO"
                Start-Sleep -Seconds 10  # Extended wait for file handles
                break
            }
        } else {
            Write-EnhancedLog "No competing processes found" -Level "SUCCESS"
            Write-EnhancedLog "Pre-build cleanup wait..." -Level "INFO"
            Start-Sleep -Seconds 5
            break
        }
    }

    # Verify prerequisites
    $RequiredDirs = @($FrontendDir, $JavaDir)
    foreach ($dir in $RequiredDirs) {
        if (-not (Test-Path $dir)) {
            throw "Required directory not found: $dir"
        }
    }

    # Validate JRE before building
    Write-EnhancedLog "Validating JRE installation..." -Level "INFO"
    $JrePath = "$ProjectRoot\resources\jre\bin\java.exe"
    if (-not (Test-Path $JrePath)) {
        throw "JRE not found at: $JrePath. Please ensure Java Runtime Environment is properly installed."
    }
    
    # Test JRE functionality
    try {
        $process = Start-Process -FilePath $JrePath -ArgumentList "-version" -RedirectStandardOutput "$env:TEMP\jre_stdout.txt" -RedirectStandardError "$env:TEMP\jre_stderr.txt" -Wait -PassThru -WindowStyle Hidden
        $stderr = Get-Content "$env:TEMP\jre_stderr.txt" -ErrorAction SilentlyContinue
        if ($process.ExitCode -eq 0 -and $stderr) {
            Write-EnhancedLog "JRE validation successful: $($stderr[0])" -Level "SUCCESS"
        } else {
            throw "JRE failed to execute properly. Exit code: $($process.ExitCode)"
        }
        Remove-Item "$env:TEMP\jre_stdout.txt", "$env:TEMP\jre_stderr.txt" -ErrorAction SilentlyContinue
    } catch {
        throw "JRE validation failed: $($_.Exception.Message). JRE may be corrupted or incompatible."
    }

    # Change to project root
    Push-Location $ProjectRoot
    Write-EnhancedLog "Changed directory to: $(Get-Location)" -Level "INFO"

    # Check package.json for Electron
    if (-not (Test-Path "package.json")) {
        throw "package.json not found in $ProjectRoot"
    }

    # Prepare Electron environment
    Write-EnhancedLog "Preparing Electron environment..." -Level "INFO"
    
    # Install electron dependencies if needed
    if (-not (Test-Path "node_modules\electron")) {
        Write-EnhancedLog "Installing Electron dependencies..." -Level "INFO"
        & npm install --production
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed with exit code: $LASTEXITCODE"
        }
    }

    # Clean and ensure release directory exists
    if (Test-Path $OutputDir) {
        Write-EnhancedLog "Cleaning existing output directory: $OutputDir" -Level "INFO"
        
        # More aggressive cleanup with retry mechanism
        $maxRetries = 3
        $retryDelay = 5
        
        for ($i = 1; $i -le $maxRetries; $i++) {
            try {
                Write-EnhancedLog "Cleanup attempt $i/$maxRetries" -Level "INFO"
                
                # First, try to stop any remaining processes
                Stop-BlockingProcesses -ProcessNames @("ProjectLibre", "electron", "electron-builder", "node")
                
                # Wait a bit for processes to fully terminate
                Start-Sleep -Seconds $retryDelay
                
                # Remove directory with force
                Remove-Item -Recurse -Force $OutputDir -ErrorAction Stop
                
                # If we got here, cleanup was successful
                Write-EnhancedLog "Cleanup successful on attempt $i" -Level "SUCCESS"
                break
                
            } catch {
                if ($i -eq $maxRetries) {
                    Write-EnhancedLog "Cleanup failed after $maxRetries attempts: $_" -Level "ERROR"
                    throw "Failed to clean output directory after $maxRetries attempts: $_"
                } else {
                    Write-EnhancedLog "Cleanup attempt $i failed, retrying in $retryDelay seconds..." -Level "WARN"
                    Start-Sleep -Seconds $retryDelay
                }
            }
        }
    }
    
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }

    # Copy frontend to release directory
    Write-EnhancedLog "Integrating frontend build..." -Level "INFO"
    $ReleaseAppDir = "$OutputDir\ProjectLibre"
    if (Test-Path $ReleaseAppDir) {
        Remove-Item -Recurse -Force $ReleaseAppDir
    }
    New-Item -ItemType Directory -Path $ReleaseAppDir -Force | Out-Null
    
    # Copy frontend files
    Copy-Item "$FrontendDir\*" $ReleaseAppDir -Recurse -Force
    Write-EnhancedLog "Frontend files copied to: $ReleaseAppDir" -Level "SUCCESS"

    # Copy Java JARs
    Write-EnhancedLog "Integrating Java components..." -Level "INFO"
    $JavaLibDir = "$ReleaseAppDir\lib"
    
    # Сначала очищаем целевую папку, чтобы избежать дублирования
    if (Test-Path $JavaLibDir) {
        Remove-Item -Recurse -Force $JavaLibDir -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $JavaLibDir -Force | Out-Null
    
    # Копируем JAR файлы из ИСТОЧНИКА, который использует electron-builder
    $JavaSourceDir = "$ProjectRoot\projectlibre_build\dist"
    if (Test-Path $JavaSourceDir) {
        # Основной JAR в lib-runtime
        $LibRuntimeDir = "$ReleaseAppDir\lib-runtime"
        New-Item -ItemType Directory -Path $LibRuntimeDir -Force | Out-Null
        $MainJar = "$JavaSourceDir\projectlibre.jar"
        if (Test-Path $MainJar) {
            Copy-Item $MainJar $LibRuntimeDir -Force
            Write-EnhancedLog "Copied main JAR to lib-runtime" -Level "SUCCESS"
        }
        
        # Дополнительные JAR файлы в lib (БЕЗ рекурсии, чтобы избежать lib/lib)
        $AdditionalJars = Get-ChildItem $JavaSourceDir -Filter "*.jar" -Exclude "projectlibre.jar"
        if ($AdditionalJars.Count -gt 0) {
            # Копируем каждый JAR файл отдельно, без рекурсии
            $AdditionalJars | ForEach-Object {
                Copy-Item $_.FullName $JavaLibDir -Force
            }
            $jarCount = (Get-ChildItem $JavaLibDir -Filter "*.jar").Count
            Write-EnhancedLog "Copied $jarCount additional JAR files to lib" -Level "SUCCESS"
        }
    } else {
        Write-EnhancedLog "Java build directory not found: $JavaSourceDir" -Level "WARN"
        # Fallback к старому методу
        if (Test-Path "$JavaDir\lib") {
            Copy-Item "$JavaDir\lib\*" $JavaLibDir -Recurse -Force
            $jarCount = (Get-ChildItem $JavaLibDir -Filter "*.jar").Count
            Write-EnhancedLog "Copied $jarCount JAR files to release (fallback)" -Level "SUCCESS"
        } else {
            Write-EnhancedLog "Java lib directory not found: $JavaDir\lib" -Level "WARN"
        }
    }

    # Create Electron main process file
    Write-EnhancedLog "Creating Electron main process..." -Level "INFO"
    $MainJs = @"
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
"@

    Write-TextUtf8NoBom -Path "$ReleaseAppDir\main.js" -Content $MainJs

    # Update package.json for Electron
    Write-EnhancedLog "Updating package.json for Electron..." -Level "INFO"
    $PackageJson = Get-Content "package.json" | ConvertFrom-Json
    $PackageJson.main = "main.js"
    $PackageJson | ConvertTo-Json -Depth 10 | Out-File "$ReleaseAppDir\package.json" -Encoding UTF8

    # Build Electron executable
    Write-EnhancedLog "Building Electron executable..." -Level "INFO"
    
    # Check if electron-builder is available
    $ElectronBuilder = Get-Command "electron-builder" -ErrorAction SilentlyContinue
    if (-not $ElectronBuilder) {
        Write-EnhancedLog "Installing electron-builder..." -Level "INFO"
        & npm install --save-dev electron-builder
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install electron-builder"
        }
    }

    # Configure electron-builder
    $ElectronConfig = @{
        "appId" = "com.projectlibre.desktop"
        "productName" = "ProjectLibre"
        "directories" = @{
            "output" = $OutputDir
            "app" = $ReleaseAppDir
        }
        "files" = @(
            "**/*"
        )
        "win" = @{
            "target" = "nsis"
            "icon" = "icon.ico"
        }
        "nsis" = @{
            "oneClick" = $false
            "allowToChangeInstallationDirectory" = $true
        }
    }

    $ElectronConfig | ConvertTo-Json -Depth 10 | Out-File "$ReleaseAppDir\electron-builder.json" -Encoding UTF8

    # Run electron-builder from project root
    try {
        Write-EnhancedLog "Running professional distribution build (npm run dist:win)..." -Level "INFO"
        # Используем существующий npm скрипт, который теперь настроен на dist-app
        cmd /c "npm run dist:win"
        if ($LASTEXITCODE -ne 0) {
            throw "electron-builder failed with exit code: $LASTEXITCODE"
        }
    } finally {
        # No directory change needed
    }

    Write-EnhancedLog "Electron build completed successfully!" -Level "SUCCESS"

    # Show output
    $ExeFiles = Get-ChildItem $OutputDir -Filter "*.exe" -Recurse
    if ($ExeFiles) {
        Write-EnhancedLog "Generated executables:" -Level "INFO"
        $ExeFiles | ForEach-Object {
            $size = if ($_.Length -gt 1MB) { "$([math]::Round($_.Length/1MB,2))MB" } elseif ($_.Length -gt 1KB) { "$([math]::Round($_.Length/1KB,2))KB" } else { "$($_.Length)B" }
            Write-EnhancedLog "  📄 $($_.Name) ($size)" -Level "INFO"
            Write-EnhancedLog "    Path: $($_.FullName)" -Level "INFO"
        }
    } else {
        Write-EnhancedLog "No executable files found in output directory" -Level "WARN"
    }

} catch {
    Write-EnhancedLog "Electron build failed: $($_.Exception.Message)" -Level "ERROR"
    $errorMessage = $_.Exception.ToString()
    Write-EnhancedLog "Full error: $errorMessage" -Level "ERROR"
    exit 1
} finally {
    # Restore location
    if ((Get-Location) -ne $ProjectRoot) {
        Pop-Location -ErrorAction SilentlyContinue
    }
}

Write-EnhancedLog "Electron application build process completed!" -Level "SUCCESS"
exit 0
