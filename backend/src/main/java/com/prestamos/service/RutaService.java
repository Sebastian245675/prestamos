package com.prestamos.service;

import com.prestamos.entity.Ruta;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.RutaRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RutaService {
    
    private final RutaRepository rutaRepository;
    private final UsuarioRepository usuarioRepository;
    
    @Transactional
    public Ruta crearRuta(Long prestamistaId, String nombre, String color) {
        Usuario prestamista = usuarioRepository.findById(prestamistaId)
            .orElseThrow(() -> new RuntimeException("Prestamista no encontrado"));
        
        // Validar que el color sea válido
        if (!color.matches("^#[0-9A-Fa-f]{6}$")) {
            throw new RuntimeException("Color inválido. Debe ser formato hexadecimal (#RRGGBB)");
        }
        
        // Validar que no exista una ruta con el mismo nombre
        List<Ruta> rutasExistentes = rutaRepository.findByPrestamistaIdOrderByNombreAsc(prestamistaId);
        boolean nombreExiste = rutasExistentes.stream()
            .anyMatch(r -> r.getNombre().equalsIgnoreCase(nombre) && r.getActiva());
        
        if (nombreExiste) {
            throw new RuntimeException("Ya existe una ruta activa con ese nombre");
        }
        
        Ruta ruta = new Ruta();
        ruta.setPrestamista(prestamista);
        ruta.setNombre(nombre.trim());
        ruta.setColor(color.toUpperCase());
        ruta.setActiva(true);
        
        ruta = rutaRepository.save(ruta);
        
        log.info("Ruta creada: ID {} con nombre '{}' para prestamista {}", ruta.getId(), nombre, prestamistaId);
        
        return ruta;
    }
    
    @Transactional(readOnly = true)
    public List<Ruta> obtenerRutas(Long prestamistaId) {
        return rutaRepository.findByPrestamistaIdOrderByNombreAsc(prestamistaId);
    }
    
    @Transactional(readOnly = true)
    public List<Ruta> obtenerRutasActivas(Long prestamistaId) {
        return rutaRepository.findByPrestamistaIdAndActivaTrueOrderByNombreAsc(prestamistaId);
    }
    
    @Transactional
    public void eliminarRuta(Long rutaId, Long prestamistaId) {
        Ruta ruta = rutaRepository.findById(rutaId)
            .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));
        
        if (!ruta.getPrestamista().getId().equals(prestamistaId)) {
            throw new RuntimeException("No tienes permisos para eliminar esta ruta");
        }
        
        // Desactivar en lugar de eliminar
        ruta.setActiva(false);
        rutaRepository.save(ruta);
        
        log.info("Ruta desactivada: ID {} por prestamista {}", rutaId, prestamistaId);
    }
    
    @Transactional
    public Ruta actualizarRuta(Long rutaId, Long prestamistaId, String nombre, String color) {
        Ruta ruta = rutaRepository.findById(rutaId)
            .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));
        
        if (!ruta.getPrestamista().getId().equals(prestamistaId)) {
            throw new RuntimeException("No tienes permisos para actualizar esta ruta");
        }
        
        if (nombre != null && !nombre.trim().isEmpty()) {
            ruta.setNombre(nombre.trim());
        }
        
        if (color != null && color.matches("^#[0-9A-Fa-f]{6}$")) {
            ruta.setColor(color.toUpperCase());
        }
        
        ruta = rutaRepository.save(ruta);
        
        log.info("Ruta actualizada: ID {} por prestamista {}", rutaId, prestamistaId);
        
        return ruta;
    }
}

