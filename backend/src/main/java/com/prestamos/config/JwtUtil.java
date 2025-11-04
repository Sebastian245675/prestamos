package com.prestamos.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        // Validar que la clave sea lo suficientemente larga
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT secret debe tener al menos 32 caracteres");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email no puede ser nulo o vacío");
        }
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("iat", now);
        
        try {
            return Jwts.builder()
                    .claims(claims)
                    .subject(email)
                    .issuedAt(now)
                    .expiration(expiryDate)
                    .signWith(getSigningKey(), Jwts.SIG.HS256)
                    .compact();
        } catch (Exception e) {
            log.error("Error al generar token JWT: {}", e.getMessage());
            throw new RuntimeException("Error al generar token", e);
        }
    }
    
    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error al extraer email del token: {}", e.getMessage());
            throw new RuntimeException("Token inválido", e);
        }
    }
    
    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return false;
            }
            
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // Validar expiración
            Date expiration = claims.getExpiration();
            if (expiration.before(new Date())) {
                log.warn("Token expirado");
                return false;
            }
            
            // Validar que el subject (email) no esté vacío
            String email = claims.getSubject();
            if (email == null || email.trim().isEmpty()) {
                log.warn("Token sin subject válido");
                return false;
            }
            
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token expirado: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.warn("Token no soportado: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.warn("Token mal formado: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.warn("Firma del token inválida: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.warn("Token vacío o nulo: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Error al validar token: {}", e.getMessage());
            return false;
        }
    }
    
    public Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getExpiration();
        } catch (Exception e) {
            log.error("Error al obtener fecha de expiración: {}", e.getMessage());
            return null;
        }
    }
}

