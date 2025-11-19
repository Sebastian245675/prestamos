## syntax=docker/dockerfile:1
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copiamos únicamente los archivos necesarios para resolver dependencias y compilar
COPY pom.xml .
COPY src ./src

# Compila el proyecto y genera el jar (sin ejecutar tests por velocidad)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# Copiamos el artefacto compilado desde el stage anterior
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/${JAR_FILE} app.jar

# Puerto que expone la aplicación Spring Boot
EXPOSE 8080

# Ajustes básicos de memoria para ejecutar en instancias pequeñas de Fly.io
ENV JAVA_TOOL_OPTIONS="-Xms256m -Xmx448m -XX:+ExitOnOutOfMemoryError"

# Configurar Spring Boot para escuchar en todas las interfaces (necesario para fly.io)
ENV SERVER_ADDRESS=0.0.0.0

# Ejecutar la aplicación
CMD ["java", "-jar", "/app/app.jar"]


