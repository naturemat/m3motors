#!/bin/bash
# =============================================================================
# M3Motors — Build APK local en el Droplet
# =============================================================================
# Ejecutar en el DigitalOcean Droplet para construir el APK sin pasar por EAS.
# Requiere: Java 17+, Android SDK, Node.js 22+, ~2GB disco libre
# =============================================================================

set -e

MOBILE_DIR="/opt/m3motors/frontend/mobile"
APK_DIR="/opt/m3motors/apk"
APK_NAME="M3Motors.apk"

echo "=== M3Motors — Build APK Local ==="

# 1. Verificar/instalar dependencias del sistema
echo "[1/7] Verificando dependencias del sistema..."

# Java 17
if ! command -v java &> /dev/null; then
  echo "  Instalando Java 17..."
  apt-get update -qq
  apt-get install -y -qq openjdk-17-jdk > /dev/null 2>&1
fi
echo "  Java: $(java -version 2>&1 | head -1)"

# Node.js 22 (el droplet tiene 18, necesita 22)
NODE_MAJOR=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "  Instalando Node.js 22 (actual: v$NODE_MAJOR)..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null 2>&1
  echo "  Node.js $(node --version) instalado"
else
  echo "  Node: $(node --version)"
fi

# Swap para builds de Gradle (1.9GB RAM es justo)
SWAP_FILE="/swapfile"
if [ ! -f "$SWAP_FILE" ]; then
  echo "  Creando swap de 2GB para builds..."
  fallocate -l 2G "$SWAP_FILE"
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE" > /dev/null 2>&1
  swapon "$SWAP_FILE"
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
  echo "  Swap activado"
else
  if ! swapon --show | grep -q "$SWAP_FILE"; then
    swapon "$SWAP_FILE"
  fi
  echo "  Swap ya configurado"
fi

# 2. Configurar Android SDK
ANDROID_HOME="/opt/android-sdk"
if [ ! -d "$ANDROID_HOME" ]; then
  echo "[2/7] Instalando Android SDK..."
  mkdir -p "$ANDROID_HOME"
  
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
  unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest" 2>/dev/null || true
  
  export ANDROID_HOME="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
  
  yes | sdkmanager --licenses > /dev/null 2>&1 || true
  sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1
  
  echo "  Android SDK instalado"
else
  echo "[2/7] Android SDK ya instalado"
  export ANDROID_HOME="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi

# 3. Instalar dependencias del proyecto
echo "[3/7] Instalando dependencias..."
cd "$MOBILE_DIR"
npm install --legacy-peer-deps --silent 2>/dev/null

# 4. Generar prebuild (Android nativo)
echo "[4/7] Generando prebuild..."
npx expo prebuild --platform android --clean --silent 2>/dev/null

# 5. Construir APK
echo "[5/7] Construyendo APK (puede tomar 3-5 min)..."
cd "$MOBILE_DIR/android"
./gradlew assembleRelease --quiet --no-daemon 2>/dev/null

# 6. Verificar que el APK se generó
echo "[6/7] Verificando APK..."
APK_SRC="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_SRC" ]; then
  echo "  ERROR: APK no generado en $APK_SRC"
  exit 1
fi

# 7. Copiar APK al directorio de nginx
echo "[7/7] Copiando APK..."
mkdir -p "$APK_DIR"
cp "$APK_SRC" "$APK_DIR/$APK_NAME"

APK_SIZE=$(du -h "$APK_DIR/$APK_NAME" | cut -f1)
echo ""
echo "=== Build completado ==="
echo "APK: $APK_DIR/$APK_NAME ($APK_SIZE)"
echo "URL: https://m3motors.me/apk/$APK_NAME"
