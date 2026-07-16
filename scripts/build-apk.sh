#!/bin/bash
# =============================================================================
# M3Motors — Build APK local en el Droplet
# =============================================================================
# Ejecutar en el DigitalOcean Droplet para construir el APK sin pasar por EAS.
# Requiere: Java 17+, Android SDK, Node.js 22+, ~2GB disco libre
# =============================================================================

# NO usar set -e — manejar errores explícitamente
# Los exports deben ir al inicio para persistir en sesiones SSH

MOBILE_DIR="/opt/m3motors/frontend/mobile"
APK_DIR="/opt/m3motors/apk"
APK_NAME="M3Motors.apk"
ANDROID_HOME="/opt/android-sdk"

export ANDROID_HOME="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

log "=== M3Motors — Build APK Local ==="

# 1. Verificar/instalar dependencias del sistema
log "[1/7] Verificando dependencias del sistema..."

# Java 17
if command -v java &> /dev/null; then
  log "  Java: $(java -version 2>&1 | head -1)"
else
  log "  Instalando Java 17..."
  apt-get update -qq
  apt-get install -y -qq openjdk-17-jdk
  log "  Java instalado"
fi

# Node.js 22
NODE_MAJOR=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_MAJOR" -lt 22 ]; then
  log "  Instalando Node.js 22 (actual: v$NODE_MAJOR)..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
  log "  Node.js $(node --version) instalado"
else
  log "  Node: $(node --version)"
fi

# Swap para builds de Gradle
SWAP_FILE="/swapfile"
if [ ! -f "$SWAP_FILE" ]; then
  log "  Creando swap de 2GB..."
  fallocate -l 2G "$SWAP_FILE"
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE"
  swapon "$SWAP_FILE"
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
  log "  Swap activado"
else
  if ! swapon --show | grep -q "$SWAP_FILE"; then
    swapon "$SWAP_FILE"
  fi
  log "  Swap ya configurado"
fi

# 2. Configurar Android SDK
if [ ! -d "$ANDROID_HOME" ]; then
  log "[2/7] Instalando Android SDK..."
  mkdir -p "$ANDROID_HOME"
  
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
  unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest" 2>/dev/null || true
  
  yes | sdkmanager --licenses 2>&1 | tail -1
  sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools" 2>&1 | tail -1
  
  log "  Android SDK instalado"
else
  log "[2/7] Android SDK ya instalado"
fi

# 3. Instalar dependencias del proyecto
log "[3/7] Instalando dependencias..."
cd "$MOBILE_DIR"
npm install --legacy-peer-deps 2>&1 | tail -3
INSTALL_EXIT=$?
if [ $INSTALL_EXIT -ne 0 ]; then
  log "  ERROR: npm install falló (exit $INSTALL_EXIT)"
  exit 1
fi
log "  Dependencias instaladas"

# 4. Generar prebuild (Android nativo)
log "[4/7] Generando prebuild..."
npx expo prebuild --platform android --clean 2>&1 | tail -5
PREBUILD_EXIT=$?
if [ $PREBUILD_EXIT -ne 0 ]; then
  log "  WARNING: expo prebuild retornó exit $PREBUILD_EXIT (puede ser normal)"
fi

# Verificar que se generó el directorio android
if [ ! -d "$MOBILE_DIR/android" ]; then
  log "  ERROR: Directorio android/ no se generó"
  exit 1
fi
log "  Prebuild completado"

# Crear local.properties con sdk.dir para que Gradle encuentre el SDK
log "  Configurando local.properties..."
echo "sdk.dir=$ANDROID_HOME" > "$MOBILE_DIR/android/local.properties"
log "  sdk.dir=$ANDROID_HOME"

# 5. Construir APK
log "[5/7] Construyendo APK (puede tomar 3-5 min)..."
cd "$MOBILE_DIR/android"
./gradlew assembleRelease --no-daemon 2>&1 | tail -10
GRADLE_EXIT=$?
if [ $GRADLE_EXIT -ne 0 ]; then
  log "  ERROR: Gradle build falló (exit $GRADLE_EXIT)"
  exit 1
fi
log "  Gradle build completado"

# 6. Verificar que el APK se generó
log "[6/7] Verificando APK..."
APK_SRC="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_SRC" ]; then
  log "  ERROR: APK no generado en $APK_SRC"
  log "  Buscando APKs alternativos..."
  find "$MOBILE_DIR/android" -name "*.apk" -type f 2>/dev/null
  exit 1
fi
APK_SIZE=$(du -h "$APK_SRC" | cut -f1)
log "  APK encontrado: $APK_SIZE"

# 7. Copiar APK al directorio de nginx
log "[7/7] Copiando APK..."
mkdir -p "$APK_DIR"
cp "$APK_SRC" "$APK_DIR/$APK_NAME"

log ""
log "=== Build completado ==="
log "APK: $APK_DIR/$APK_NAME ($APK_SIZE)"
log "URL: https://m3motors.me/apk/$APK_NAME"
