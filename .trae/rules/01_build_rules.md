# PROJECT LIBRE - BUILD RULES

## 1. BUILD ENVIRONMENT
1.1 Java 17 fixed - DO NOT change
1.2 Ant 1.10.15 fixed - DO NOT upgrade  
1.3 Build command: `projectlibre_build/apache-ant-1.10.15/bin/ant.bat -f projectlibre_build/build.xml`
1.4 Project compiles - MINIMAL fixes only

## 2. PROJECT STRUCTURE
2.1 Source locations fixed:
   - Core: `projectlibre_core/src/`
   - Build: `projectlibre_build/build.xml`
2.2 Git remotes configured:
   - Primary: `origin` (https://github.com/LeshiyOFF/projectlibre-modern.git)
   - Source: `sourceforge`
2.3 .gitignore configured for Node.js/Electron