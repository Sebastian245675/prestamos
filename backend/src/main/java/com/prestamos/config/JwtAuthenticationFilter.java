package com.prestamos.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Permitir rutas públicas sin verificar token
        String path = request.getRequestURI();
        String servletPath = request.getServletPath() != null ? request.getServletPath() : "";
        String pathInfo = request.getPathInfo() != null ? request.getPathInfo() : "";
        
        // Construir path relativo al context path (Spring Security ve rutas sin /api)
        String relativePath = servletPath + pathInfo;
        
        // Si path completo incluye /api, extraer la parte relativa
        if (path.startsWith("/api") && !relativePath.startsWith("/")) {
            relativePath = path.substring(4); // Remover "/api"
        }
        
        // Normalizar: asegurar que empiece con /
        if (!relativePath.startsWith("/")) {
            relativePath = "/" + relativePath;
        }
        
        // Verificar rutas públicas (comparar tanto con path completo como relativo)
        boolean isPublicRoute = relativePath.startsWith("/auth/") || 
                               relativePath.startsWith("/public/") || 
                               relativePath.startsWith("/payment/") ||
                               path.startsWith("/api/auth/") || 
                               path.startsWith("/api/public/") || 
                               path.startsWith("/api/payment/") ||
                               path.equals("/api/auth/register") ||
                               path.equals("/api/auth/login");
        
        if (isPublicRoute) {
            log.debug("Ruta pública detectada, saltando verificación JWT: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                try {
                    if (jwtUtil.validateToken(jwt)) {
                        String email = jwtUtil.getEmailFromToken(jwt);
                        
                        // Crear autenticación
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                email, 
                                null, 
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        log.info("JWT válido para usuario: {} en ruta: {}", email, path);
                    } else {
                        log.warn("JWT inválido recibido desde IP: {} en ruta: {}", getClientIp(request), path);
                        sendErrorResponse(response, "Token inválido o expirado", HttpStatus.UNAUTHORIZED);
                        return;
                    }
                } catch (Exception tokenEx) {
                    log.error("Error al procesar token JWT en ruta {}: {}", path, tokenEx.getMessage());
                    sendErrorResponse(response, "Token inválido o expirado", HttpStatus.UNAUTHORIZED);
                    return;
                }
            } else {
                log.warn("No se encontró token JWT en la petición a ruta: {}", path);
            }
            // Si no hay token, dejar que Spring Security maneje la autorización
        } catch (Exception ex) {
            log.error("Error inesperado en filtro JWT en ruta {}: {}", path, ex.getMessage(), ex);
            // En caso de error inesperado, dejar que Spring Security maneje la autorización
            // No bloquear la petición para evitar que el servidor se caiga
        }
        
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendErrorResponse(HttpServletResponse response, String message, HttpStatus status) 
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("message", message);
        errorResponse.put("status", status.value());
        
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
