# 🚀 Ejecutar Backend - Instrucciones para Windows

## ⚠️ Problema: Git Bash no reconoce comandos de Windows

Si estás en **Git Bash** (MINGW64), hay dos opciones:

---

## ✅ Opción 1: Usar PowerShell o CMD (Más fácil)

### Paso 1: Abre PowerShell o CMD
- Presiona `Windows + X` y selecciona **"Windows PowerShell"** o **"Terminal"**
- O busca "PowerShell" en el menú de inicio

### Paso 2: Navega a la carpeta backend
```powershell
cd C:\Users\Nadie\Downloads\prestamos\backend
```

### Paso 3: Instala Maven (si no está instalado)

**Opción A: Con Chocolatey (si lo tienes):**
```powershell
choco install maven
```

**Opción B: Descargar manualmente:**
1. Ve a: https://maven.apache.org/download.cgi
2. Descarga el archivo `apache-maven-X.X.X-bin.zip`
3. Extrae y agrega a PATH, o usa la ruta completa

**Opción C: Crear Maven Wrapper (más fácil):**
```powershell
# Instala Maven Wrapper en el proyecto
mvn wrapper:wrapper
```

Luego ejecuta:
```powershell
.\mvnw.cmd spring-boot:run
```

---

## ✅ Opción 2: Instalar Maven Globalmente

### Paso 1: Descargar Maven
1. Ve a: https://maven.apache.org/download.cgi
2. Descarga: `apache-maven-3.9.6-bin.zip` (o la última versión)
3. Extrae en: `C:\Program Files\Apache\maven`

### Paso 2: Agregar a PATH
1. Busca "Variables de entorno" en Windows
2. Edita "Path" en Variables del sistema
3. Agrega: `C:\Program Files\Apache\maven\bin`
4. Reinicia la terminal

### Paso 3: Verificar
```bash
mvn -version
```

### Paso 4: Ejecutar backend
```bash
cd backend
mvn spring-boot:run
```

---

## ✅ Opción 3: Crear Maven Wrapper (Recomendado)

Si tienes Maven instalado temporalmente o puedes instalarlo una vez:

```bash
# En Git Bash, PowerShell o CMD
cd backend
mvn wrapper:wrapper
```

Esto creará los archivos `mvnw` y `mvnw.cmd`.

Luego en Git Bash:
```bash
./mvnw spring-boot:run
```

O en PowerShell/CMD:
```powershell
.\mvnw.cmd spring-boot:run
```

---

## 🎯 Solución Rápida AHORA

**Usa PowerShell o CMD:**

1. Abre PowerShell (presiona `Windows + X` → PowerShell)
2. Ejecuta:
```powershell
cd C:\Users\Nadie\Downloads\prestamos\backend
```

3. Si tienes Maven instalado:
```powershell
mvn spring-boot:run
```

4. Si NO tienes Maven, primero instálalo o crea el wrapper:
```powershell
# Necesitas Maven para esto, descárgalo de https://maven.apache.org/download.cgi
mvn wrapper:wrapper
.\mvnw.cmd spring-boot:run
```

---

## 💡 Recomendación

**Para desarrollo rápido:** Usa PowerShell y crea el Maven Wrapper una vez, luego siempre usa `.\mvnw.cmd`.

**Para producción:** Instala Maven globalmente.

