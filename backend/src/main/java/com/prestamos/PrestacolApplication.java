package com.prestamos;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
// @EnableScheduling // Temporalmente comentado hasta restaurar NotificacionService
@EnableCaching
public class PrestacolApplication {
    public static void main(String[] args) {
        // Cargar variables de entorno desde archivo .env
        try {
            Dotenv dotenv = null;
            String userDir = System.getProperty("user.dir");
            
            String[] possiblePaths = {
                ".env",
                "backend/.env",
                "./backend/.env",
                userDir + "/.env",
                userDir + "/backend/.env"
            };
            
            java.io.File envFile = null;
            for (String path : possiblePaths) {
                java.io.File testFile = new java.io.File(path);
                if (testFile.exists()) {
                    envFile = testFile;
                    System.out.println("✓ Archivo .env encontrado en: " + testFile.getAbsolutePath());
                    break;
                }
            }
            
            if (envFile != null) {
                java.io.File parentDir = envFile.getParentFile();
                if (parentDir != null) {
                    dotenv = Dotenv.configure()
                        .directory(parentDir.getAbsolutePath())
                        .ignoreIfMissing()
                        .load();
                } else {
                    dotenv = Dotenv.configure()
                        .ignoreIfMissing()
                        .load();
                }
            } else {
                dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();
            }
            
            // Establecer las variables como System Properties para que Spring Boot las lea
            if (dotenv != null) {
                for (var entry : dotenv.entries()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    System.setProperty(key, value);
                    
                    // Establecer propiedades específicas de Spring
                    if (key.equals("DB_URL")) {
                        System.setProperty("spring.datasource.url", value);
                    } else if (key.equals("DB_USERNAME")) {
                        System.setProperty("spring.datasource.username", value);
                    } else if (key.equals("DB_PASSWORD")) {
                        System.setProperty("spring.datasource.password", value);
                    } else if (key.equals("EMAIL_USERNAME")) {
                        System.setProperty("spring.mail.username", value);
                    } else if (key.equals("EMAIL_PASSWORD")) {
                        System.setProperty("spring.mail.password", value);
                    } else if (key.equals("EMAIL_FROM")) {
                        System.setProperty("email.from", value);
                        System.setProperty("EMAIL_FROM", value);
                    } else if (key.equals("EMAIL_ENABLED")) {
                        System.setProperty("email.enabled", value);
                    }
                }
                System.out.println("✓ Variables del archivo .env cargadas correctamente");
            }
        } catch (Exception e) {
            System.out.println("⚠ No se pudo cargar el archivo .env: " + e.getMessage());
        }
        
        SpringApplication.run(PrestacolApplication.class, args);
    }
}

