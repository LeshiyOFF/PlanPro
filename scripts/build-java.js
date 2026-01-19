const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');

function runCommand(command, cwd) {
  console.log(`🚀 Running: ${command} in ${cwd}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

// 1. Build Java Core (Ant)
const coreDir = path.join(rootDir, 'projectlibre_build');
let antCmd = 'ant';
try {
  execSync('ant -version', { stdio: 'ignore' });
} catch (e) {
  // If global ant is not found, try the bundled one (Windows only)
  if (process.platform === 'win32') {
    antCmd = path.join(coreDir, '..', 'projectlibre_build', 'apache-ant-1.10.15', 'bin', 'ant.bat');
  } else {
    console.error('❌ Ant not found in PATH. Please install Ant.');
    process.exit(1);
  }
}
runCommand(`${antCmd} -f build.xml`, coreDir);

// 2. Build Java API (Maven)
const apiDir = path.join(rootDir, 'projectlibre-api');
let mvnCmd = 'mvn';
try {
  execSync('mvn -version', { stdio: 'ignore' });
} catch (e) {
  // If global mvn is not found, try the bundled one (Windows only)
  if (process.platform === 'win32') {
    mvnCmd = path.join(apiDir, 'apache-maven-3.9.5', 'bin', 'mvn.cmd');
  } else {
    console.error('❌ Maven not found in PATH. Please install Maven.');
    process.exit(1);
  }
}
runCommand(`${mvnCmd} clean package -DskipTests`, apiDir);

// 3. Copy final JAR
const jarSource = path.join(apiDir, 'target', 'projectlibre-api-1.0.0.jar');
const jarDest = path.join(apiDir, 'projectlibre-api-final.jar');
const jarResources = path.join(rootDir, 'resources', 'java', 'projectlibre-api-final.jar');

console.log(`📦 Copying JAR to: ${jarDest}`);
fs.copyFileSync(jarSource, jarDest);

console.log(`📦 Copying JAR to: ${jarResources}`);
if (!fs.existsSync(path.dirname(jarResources))) {
  fs.mkdirSync(path.dirname(jarResources), { recursive: true });
}
fs.copyFileSync(jarSource, jarResources);

console.log('✨ Java build completed successfully!');
