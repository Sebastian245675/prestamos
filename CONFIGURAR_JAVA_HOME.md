# 🚀 Instrucciones para Ejecutar el Backend

## ⚠️ JAVA_HOME no está configurado

Ejecuta estos comandos en tu terminal Git Bash:

### Paso 1: Configurar JAVA_HOME temporalmente

```bash
export JAVA_HOME="/c/Program Files/Java/jdk-25"
```

### Paso 2: Verificar que funciona

```bash
echo $JAVA_HOME
```

Deberías ver: `/c/Program Files/Java/jdk-25`

### Paso 3: Ejecutar el backend

```bash
./mvnw spring-boot:run
```

---

## 🔧 Si quieres configurar JAVA_HOME permanentemente

### Opción A: En Git Bash (solo para Git Bash)

Edita el archivo `~/.bashrc` o `~/.bash_profile`:

```bash
nano ~/.bashrc
```

Agrega esta línea al final:
```bash
export JAVA_HOME="/c/Program Files/Java/jdk-25"
export PATH="$JAVA_HOME/bin:$PATH"
```

Guarda y ejecuta:
```bash
source ~/.bashrc
```

### Opción B: En Windows (para todas las terminales)

1. Presiona `Windows + X` → **Sistema**
2. Haz clic en **Configuración avanzada del sistema**
3. Haz clic en **Variables de entorno**
4. En **Variables del sistema**, haz clic en **Nueva**
5. Nombre: `JAVA_HOME`
6. Valor: `C:\Program Files\Java\jdk-25`
7. Haz clic en **Aceptar**
8. Reinicia la terminal

---

## ⚡ Solución Rápida AHORA

Ejecuta estos 3 comandos en orden:

```bash
export JAVA_HOME="/c/Program Files/Java/jdk-25"
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run
```

