package com.prestamos.repository;

import com.prestamos.entity.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    
    // Consulta optimizada usando índice en prestamista_id
    List<Prestamo> findByPrestamistaIdOrderByFechaCreacionDesc(Long prestamistaId);
    
    // Consulta optimizada con estado usando índices compuestos
    List<Prestamo> findByPrestamistaIdAndEstadoOrderByFechaCreacionDesc(
        Long prestamistaId, 
        Prestamo.EstadoPrestamo estado
    );
    
    // Consulta optimizada con búsqueda por nombre usando índice
    @Query("SELECT p FROM Prestamo p WHERE p.prestamista.id = :prestamistaId " +
           "AND (LOWER(p.nombreCliente) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR p.telefono LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY p.fechaCreacion DESC")
    List<Prestamo> findByPrestamistaIdAndSearchTerm(
        @Param("prestamistaId") Long prestamistaId,
        @Param("search") String search
    );
    
    // Consulta optimizada combinando estado y búsqueda
    @Query("SELECT p FROM Prestamo p WHERE p.prestamista.id = :prestamistaId " +
           "AND p.estado = :estado " +
           "AND (LOWER(p.nombreCliente) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR p.telefono LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY p.fechaCreacion DESC")
    List<Prestamo> findByPrestamistaIdAndEstadoAndSearchTerm(
        @Param("prestamistaId") Long prestamistaId,
        @Param("estado") Prestamo.EstadoPrestamo estado,
        @Param("search") String search
    );
    
    // Verificar existencia para optimizar verificaciones de acceso
    boolean existsByIdAndPrestamistaId(Long id, Long prestamistaId);
    
    // Obtener préstamos vencidos (optimizado con índice en fecha_vencimiento)
    @Query("SELECT p FROM Prestamo p WHERE p.prestamista.id = :prestamistaId " +
           "AND p.fechaVencimiento < CURRENT_DATE " +
           "AND p.estado = 'ACTIVO' " +
           "ORDER BY p.fechaVencimiento ASC")
    List<Prestamo> findVencidosByPrestamistaId(@Param("prestamistaId") Long prestamistaId);
    
    // Contar préstamos por estado (optimizado)
    long countByPrestamistaIdAndEstado(Long prestamistaId, Prestamo.EstadoPrestamo estado);
    
    // Obtener préstamos por cobrador
    List<Prestamo> findByCobradorId(Long cobradorId);
    
    // ============================================
    // CONSULTAS OPTIMIZADAS CON AGREGACIONES SQL
    // ============================================
    
    // Estadísticas del dashboard usando agregaciones SQL (mucho más rápido)
    @Query(value = "SELECT " +
           "COALESCE(SUM(monto_prestado), 0) as total_prestado, " +
           "COALESCE(SUM(monto_prestado - saldo_pendiente), 0) as total_cobrado, " +
           "COALESCE(SUM(saldo_pendiente), 0) as total_pendiente, " +
           "COUNT(*) FILTER (WHERE estado = 'ACTIVO') as prestamos_activos, " +
           "COUNT(*) FILTER (WHERE estado = 'VENCIDO') as prestamos_vencidos, " +
           "COUNT(*) FILTER (WHERE estado = 'FINALIZADO') as prestamos_finalizados " +
           "FROM prestamos WHERE prestamista_id = :prestamistaId",
           nativeQuery = true)
    Object[] getDashboardStats(@Param("prestamistaId") Long prestamistaId);
    
    // Obtener zonas únicas usando DISTINCT (optimizado con índice en zona)
    @Query("SELECT DISTINCT p.zona FROM Prestamo p WHERE p.prestamista.id = :prestamistaId AND p.zona IS NOT NULL AND p.zona != '' ORDER BY p.zona")
    List<String> findDistinctZonasByPrestamistaId(@Param("prestamistaId") Long prestamistaId);
    
    // Obtener total prestado por zona (optimizado)
    @Query(value = "SELECT zona, " +
           "SUM(monto_prestado) as total_prestado, " +
           "SUM(monto_prestado - saldo_pendiente) as total_cobrado " +
           "FROM prestamos WHERE prestamista_id = :prestamistaId " +
           "GROUP BY zona ORDER BY zona",
           nativeQuery = true)
    List<Object[]> getStatsByZona(@Param("prestamistaId") Long prestamistaId);
}

