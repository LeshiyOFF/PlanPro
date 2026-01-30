# Common utilities for ProjectLibre isolated build pipeline
# UTF-8 without BOM text handling and complete build isolation

# SHIM FUNCTIONS: Fallback implementations if original functions are missing
if (-not (Get-Command Write-EnhancedLog -ErrorAction SilentlyContinue)) {
    function Write-EnhancedLog {
        param(
            [Parameter(Mandatory=$true)][string]$Message,
            [string]$Level = 'INFO'
        )
        # Простой, безопасный лог с цветовой индикацией
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            default { 'White' }
        }
        Write-Host ("[{0}] [{1}] {2}" -f $timestamp, $Level, $Message) -ForegroundColor $color
    }
}

if (-not (Get-Command Stop-BlockingProcesses -ErrorAction SilentlyContinue)) {
    function Stop-BlockingProcesses {
        param(
            [string[]]$ProcessNames,
            [switch]$ForceIDE = $false
        )
        
        $currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
        
        foreach ($name in $ProcessNames) {
            # Пропускаем IDE и Node.js процессы, если они связаны с текущим сеансом редактора
            if (-not $ForceIDE -and ($name -match "code|vscode|cursor")) {
                Write-EnhancedLog "Skipping IDE process $name (Safe Mode)" "INFO"
                continue
            }

            try {
                Get-Process -Name $name -ErrorAction SilentlyContinue | 
                    ForEach-Object { 
                        # Не убиваем себя и не убиваем IDE, если не задан флаг ForceIDE
                        if ($_.Id -ne $currentPid) {
                        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                        Write-EnhancedLog "Stopped process $name (PID: $($_.Id))" "INFO"
                        }
                    }
            } catch {
                $err = $_.Exception.Message
                Write-EnhancedLog "Failed to stop process ${name}: ${err}" "WARN"
            }
        }
    }
}

<#
.SYNOPSIS
    Safely removes item with retries
.DESCRIPTION
    Tries to remove a file or directory multiple times to handle file locks
#>
function Remove-ItemSafe {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        [int]$Retries = 5,
        [int]$DelayMs = 1000
    )
    
    if (-not (Test-Path $Path)) { return }

    for ($i = 1; $i -le $Retries; $i++) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            return
        } catch {
            if ($i -eq $Retries) {
                $err = $_.Exception.Message
                Write-EnhancedLog "Final attempt to remove ${Path} failed: ${err}" "ERROR"
                throw $_
            }
            Write-EnhancedLog "Retry ${i}/${Retries} removing ${Path}..." "WARN"
            Start-Sleep -Milliseconds $DelayMs
        }
    }
}

<#
.SYNOPSIS
    Creates unique build directory with timestamp
.DESCRIPTION
    Generates isolated build directory with timestamp for atomic operations
#>
function New-IsolatedBuildDir {
    param(
        [Parameter(Mandatory=$true)]
        [string]$BuildType,
        
        [Parameter(Mandatory=$false)]
        [string]$BaseDir = "$PSScriptRoot\.."
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $buildDir = Join-Path $BaseDir "build_${BuildType}_$timestamp"
    
    if (Test-Path $buildDir) {
        Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue
    }
    
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
    return $buildDir
}

<#
.SYNOPSIS
    Kills blocking processes for isolated build
.DESCRIPTION
    Terminates processes that could block build operations
#>
function Stop-BlockingProcesses {
    param(
        [Parameter(Mandatory=$false)]
        [string[]]$ProcessNames = @("java", "ant", "electron", "ProjectLibre"),
        [switch]$ForceIDE = $false
    )
    
    $currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
    
    foreach ($name in $ProcessNames) {
        try {
            $processes = Get-Process -Name $name -ErrorAction SilentlyContinue
            if ($processes) {
                foreach ($proc in $processes) {
                    if ($proc.Id -eq $currentPid) { continue }
                    
                    # Интеллектуальная фильтрация: не убиваем IDE, если не попросили
                    if (-not $ForceIDE -and ($proc.ProcessName -match "code|vscode|cursor")) {
                        continue
                    }

                    Write-Log "Stopping blocking process: $($proc.ProcessName) (PID: $($proc.Id))" "WARN"
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                }
                Start-Sleep -Milliseconds 500
            }
        } catch {
            $err = $_.Exception.Message
            Write-Log "Could not stop process ${name}: ${err}" "WARN"
        }
    }
}

<#
.SYNOPSIS
    Validates all required artifacts exist
.DESCRIPTION
    Checks if all critical files are present after build
#>
function Test-RequiredArtifacts {
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$RequiredFiles,
        
        [Parameter(Mandatory=$false)]
        [string]$Context = "Build"
    )
    
    $missingFiles = @()
    
    foreach ($file in $RequiredFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        throw "$Context validation failed. Missing files: $($missingFiles -join ', ')"
    }
    
    Write-Log "All required artifacts validated: $($RequiredFiles.Count) files" "SUCCESS"
}

<#
.SYNOPSIS
    Creates isolated temporary directory
.DESCRIPTION
    Creates temp directory that will be cleaned up automatically
#>
function New-TempDirectory {
    param(
        [Parameter(Mandatory=$false)]
        [string]$Prefix = "build-temp"
    )
    
    $tempDir = Join-Path $env:TEMP "$Prefix-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    return $tempDir
}

<#
.SYNOPSIS
    Performs atomic directory move operation
.DESCRIPTION
    Safely moves directory with proper error handling
#>
function Move-DirectoryAtomic {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Source,
        
        [Parameter(Mandatory=$true)]
        [string]$Destination
    )
    
    if (Test-Path $Destination) {
        Remove-Item -Recurse -Force $Destination -ErrorAction SilentlyContinue
    }
    
    Move-Item $Source $Destination -Force
    Write-Log "Atomic move completed: $Source -> $Destination" "SUCCESS"
}

<#
.SYNOPSIS
    Cleans up build resources
.DESCRIPTION
    Removes temporary files and environment variables
#>
function Clear-BuildResources {
    param(
        [Parameter(Mandatory=$false)]
        [string]$BuildDir,
        
        [Parameter(Mandatory=$false)]
        [string[]]$EnvVars = @()
    )
    
    # Clean temporary files
    if ($BuildDir -and (Test-Path $BuildDir)) {
        Get-ChildItem -Path $BuildDir -Filter "*.bat" -ErrorAction SilentlyContinue | 
            Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $BuildDir -Filter "*.tmp" -ErrorAction SilentlyContinue | 
            Remove-Item -Force -ErrorAction SilentlyContinue
    }
    
    # Clean environment variables
    foreach ($var in $EnvVars) {
        if (Get-Item "Env:$var" -ErrorAction SilentlyContinue) {
            Remove-Item "Env:$var"
            Write-Log "Cleared environment variable: $var"
        }
    }
}

<#
.SYNOPSIS
    Writes text content to file using UTF-8 without BOM
.DESCRIPTION
    Safely writes text files ensuring UTF-8 encoding without BOM
#>
function Write-TextUtf8NoBom {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [string]$Content
    )
    
    $directory = Split-Path $Path -Parent
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    [System.IO.File]::WriteAllText(
        $Path, 
        $Content, 
        [System.Text.UTF8Encoding]::new($false)
    )
}

<#
.SYNOPSIS
    Validates that file has no BOM (Byte Order Mark)
.DESCRIPTION
    Checks if file starts with BOM bytes and throws error if found
#>
function Assert-NoBom {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
    
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 3 -and 
        $bytes[0] -eq 0xEF -and 
        $bytes[1] -eq 0xBB -and 
        $bytes[2] -eq 0xBF) {
        throw "❌ BOM detected in file: $Path"
    }
}

<#
.SYNOPSIS
    Creates JSON file without BOM and validates it
.DESCRIPTION
    Combines Write-TextUtf8NoBom and Assert-NoBom for JSON files
#>
function Write-JsonUtf8NoBom {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [string]$JsonContent
    )
    
    Write-TextUtf8NoBom $Path $JsonContent
    Assert-NoBom $Path
    
    # Additional JSON validation using PowerShell
    try {
        $null = $JsonContent | ConvertFrom-Json
    } catch {
        throw "❌ Invalid JSON in file: $Path. Error: $($_.Exception.Message)"
    }
}

<#
.SYNOPSIS
    Checks if command is available
.DESCRIPTION
    Tests command availability in PATH or specified location
#>
function Test-Command {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        
        [Parameter(Mandatory=$false)]
        [string]$WorkingDirectory
    )
    
    try {
        if ($WorkingDirectory) {
            Push-Location $WorkingDirectory
        }
        
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    } finally {
        if ($WorkingDirectory) {
            Pop-Location
        }
    }
}

<#
.SYNOPSIS
    Enhanced logging with colors and timestamps
.DESCRIPTION
    Provides consistent logging across all build scripts
#>
function Write-Log {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO" { "Green" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "SUCCESS" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

<#
.SYNOPSIS
    Starts cleanup process for build directories
.DESCRIPTION
    Cleans up temporary build directories and resources
#>
function Start-Cleanup {
    param(
        [Parameter(Mandatory=$false)]
        [string]$BuildDir
    )
    
    if ($BuildDir -and (Test-Path $BuildDir)) {
        try {
            Write-Log "Starting cleanup of build directory: $BuildDir" "INFO"
            
            # Wait a moment for processes to release files
            Start-Sleep -Milliseconds 2000
            
            # Force remove with error handling
            Remove-Item -Path $BuildDir -Recurse -Force -ErrorAction SilentlyContinue
            
            Write-Log "✅ Cleanup completed for: $BuildDir" "SUCCESS"
        } catch {
            Write-Log "⚠️ Cleanup warning: $($_.Exception.Message)" "WARN"
        }
    }
}

# Export functions are available after sourcing this file
# Use: . "$PSScriptRoot\common.ps1"
