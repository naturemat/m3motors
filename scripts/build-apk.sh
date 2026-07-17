#!/bin/bash
# =============================================================================
# M3Motors — Build APK con Capacitor (desde el web)
# =============================================================================
# Construye el APK usando Capacitor envolviendo el web existente.
# Requiere: Java 17+, Android SDK, Node.js 22+, ~2GB disco libre
# =============================================================================

WEB_DIR="/opt/m3motors/frontend/web"
APK_DIR="/opt/m3motors/apk"
APK_NAME="M3Motors.apk"
ANDROID_HOME="/opt/android-sdk"

export ANDROID_HOME="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Cleanup old build artifacts
rm -rf "$WEB_DIR/android/app/build" 2>/dev/null || true
rm -rf "$APK_DIR/$APK_NAME" 2>/dev/null || true

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

log "=== M3Motors — Build APK (Capacitor) ==="

# 1. Verificar dependencias del sistema
log "[1/7] Verificando dependencias..."

# Java 17
if command -v java &> /dev/null; then
  log "  Java: $(java -version 2>&1 | head -1)"
else
  log "  Instalando Java 17..."
  apt-get update -qq
  apt-get install -y -qq openjdk-17-jdk
fi

# Node.js 22
NODE_MAJOR=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_MAJOR" -lt 22 ]; then
  log "  Instalando Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
log "  Node: $(node --version)"

# Swap
SWAP_FILE="/swapfile"
if [ ! -f "$SWAP_FILE" ]; then
  log "  Creando swap de 2GB..."
  fallocate -l 2G "$SWAP_FILE"
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE"
  swapon "$SWAP_FILE"
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
else
  swapon "$SWAP_FILE" 2>/dev/null || true
fi

# 2. Configurar Android SDK
if [ ! -d "$ANDROID_HOME" ]; then
  log "[2/7] Instalando Android SDK..."
  mkdir -p "$ANDROID_HOME"
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip
  unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest" 2>/dev/null || true
  yes | sdkmanager --licenses > /dev/null 2>&1 || true
  sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1
  log "  Android SDK instalado"
else
  log "[2/7] Android SDK ya instalado"
fi

# 3. Instalar dependencias y construir web
log "[3/7] Instalando dependencias del web..."
cd "$WEB_DIR"
npm install --legacy-peer-deps 2>&1 | grep -v "^$"
log "  Dependencias instaladas"

log "[4/7] Construyendo web..."
npm run build 2>&1 | grep -E "✓|error"
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  log "  ERROR: Web build falló"
  exit 1
fi
log "  Web build completado"

# 4. Inicializar Capacitor si es primera vez
if [ ! -d "$WEB_DIR/android" ]; then
  log "[5/7] Inicializando Capacitor Android..."
  cd "$WEB_DIR"
  npx cap init M3Motors com.m3motors.mobile --web-dir dist 2>&1 | grep -E "√|error" || true
  npx cap add android 2>&1 | grep -E "√|error" || true
  log "  Capacitor inicializado"
fi

# 5. Sincronizar Capacitor
log "[6/7] Sincronizando Capacitor..."
cd "$WEB_DIR"
npx cap sync android 2>&1
SYNC_EXIT=$?
if [ $SYNC_EXIT -ne 0 ]; then
  log "  ERROR: Capacitor sync falló (exit $SYNC_EXIT)"
  log "  Verificando directorio android..."
  ls -la android/ 2>/dev/null || log "  Directorio android/ no existe"
  exit 1
fi
log "  Capacitor sync completado"

# Crear local.properties
echo "sdk.dir=$ANDROID_HOME" > "$WEB_DIR/android/local.properties"

# 6. Construir APK con Gradle
log "[7/7] Construyendo APK..."
cd "$WEB_DIR/android"
chmod +x gradlew
./gradlew assembleDebug --no-daemon --info 2>&1 | tee /tmp/gradle-output.log | tail -50
GRADLE_EXIT=${PIPESTATUS[0]}
if [ $GRADLE_EXIT -ne 0 ]; then
  log "  ERROR: Gradle build falló (exit $GRADLE_EXIT)"
  log "  Últimas 30 líneas del log:"
  tail -30 /tmp/gradle-output.log 2>/dev/null || true
  exit 1
fi

# Verificar APK
APK_SRC="$WEB_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_SRC" ]; then
  log "  ERROR: APK no generado"
  find "$WEB_DIR/android" -name "*.apk" -type f 2>/dev/null
  exit 1
fi

# Copiar APK
mkdir -p "$APK_DIR"
cp "$APK_SRC" "$APK_DIR/$APK_NAME"
APK_SIZE=$(du -h "$APK_DIR/$APK_NAME" | cut -f1)

log ""
log "=== Build completado ==="
log "APK: $APK_DIR/$APK_NAME ($APK_SIZE)"
log "URL: https://m3motors.me/apk/$APK_NAME"
