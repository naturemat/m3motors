#!/bin/bash
# =============================================================================
# M3Motors — Build APK local en el Droplet
# =============================================================================
# Ejecutar en el DigitalOcean Droplet para construir el APK sin pasar por EAS.
# Requiere: Java 17+, Android SDK, Node.js 22+
# =============================================================================

set -e

MOBILE_DIR="/opt/m3motors/frontend/mobile"
APK_DIR="/opt/m3motors/apk"
APK_NAME="M3Motors.apk"

echo "=== M3Motors — Build APK Local ==="

# 1. Verificar dependencias
echo "[1/6] Verificando dependencias..."

if ! command -v java &> /dev/null; then
  echo "  Instalando Java 17..."
  apt-get update -qq
  apt-get install -y -qq openjdk-17-jdk > /dev/null 2>&1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
echo "  Java: $(java -version 2>&1 | head -1)"

if ! command -v node &> /dev/null; then
  echo "  ERROR: Node.js no instalado. Instalar Node.js 22+ primero."
  exit 1
fi
echo "  Node: $(node --version)"

# 2. Configurar Android SDK si no existe
ANDROID_HOME="/opt/android-sdk"
if [ ! -d "$ANDROID_HOME" ]; then
  echo "[2/6] Instalando Android SDK..."
  mkdir -p "$ANDROID_HOME"
  
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
  unzip -q cmdtools.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest" 2>/dev/null || true
  
  export ANDROID_HOME="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
  
  yes | sdkmanager --licenses > /dev/null 2>&1 || true
  sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1
  
  echo "  Android SDK instalado en $ANDROID_HOME"
else
  echo "[2/6] Android SDK ya instalado"
  export ANDROID_HOME="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi

# 3. Instalar dependencias del proyecto
echo "[3/6] Instalando dependencias..."
cd "$MOBILE_DIR"
npm install --legacy-peer-deps --silent 2>/dev/null

# 4. Generar prebuild (Android nativo)
echo "[4/6] Generando prebuild..."
npx expo prebuild --platform android --clean --silent 2>/dev/null

# 5. Construir APK
echo "[5/6] Construyendo APK..."
cd "$MOBILE_DIR/android"
./gradlew assembleRelease --quiet 2>/dev/null

# 6. Copiar APK al directorio de nginx
echo "[6/6] Copiando APK..."
mkdir -p "$APK_DIR"
cp "$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk" "$APK_DIR/$APK_NAME"

APK_SIZE=$(du -h "$APK_DIR/$APK_NAME" | cut -f1)
echo ""
echo "=== Build completado ==="
echo "APK: $APK_DIR/$APK_NAME ($APK_SIZE)"
echo "URL: https://m3motors.me/apk/$APK_NAME"
