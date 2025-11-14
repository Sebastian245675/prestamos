import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Calendar, RefreshCw, ShieldCheck, Users, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { usuariosService } from '../services/usuariosService'
import { liquidacionService } from '../services/liquidacionService'

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))

const createEmptyLiquidacion = (cobradorNombre = 'Sin cobrador seleccionado', ruta = 'Sin ruta asignada') => ({
  ruta,
  cobrador: cobradorNombre,
  baseTrabajador: 0,
  gastos: 0,
  ingresos: 0,
  pagos: 0,
  ventas: 0,
  efectivoAEntregar: 0,
  faltanteOSobrante: 0,
  efectivoEntregado: 0,
  papeleria: 0,
  pleno: 0,
  positivos: 0,
  cargueGastoPersonal: 0,
  clientesRenovados: [],
  clientesPagados: [],
})

export default function LiquidacionCobradores() {
  const [cobradores, setCobradores] = useState([])
  const [selectedCobrador, setSelectedCobrador] = useState('')
  const [fechaInicio, setFechaInicio] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  })
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [loadingCobradores, setLoadingCobradores] = useState(true)
  const [liquidacion, setLiquidacion] = useState(null)

  const clientesRenovados = useMemo(() => liquidacion?.clientesRenovados || [], [liquidacion])
  const clientesPagados = useMemo(() => liquidacion?.clientesPagados || [], [liquidacion])

  useEffect(() => {
    const cargarCobradores = async () => {
      try {
        setLoadingCobradores(true)
        const data = await usuariosService.getCobradores()
        setCobradores(data)
        if (data.length > 0) {
          setSelectedCobrador(data[0].id.toString())
        }
      } catch (error) {
        console.error('Error al obtener cobradores:', error)
        toast.error('No se pudieron cargar los cobradores')
      } finally {
        setLoadingCobradores(false)
      }
    }

    cargarCobradores()
  }, [])

  useEffect(() => {
    const cargarLiquidacion = async () => {
      if (!selectedCobrador) {
        setLiquidacion(null)
        return
      }

      try {
        setLoading(true)
        const data = await liquidacionService.getLiquidacion(selectedCobrador, {
          fechaInicio,
          fechaFin,
        })
        setLiquidacion(data)
      } catch (error) {
        console.error('Error al obtener la liquidación:', error)
        const mensaje = error.response?.data?.message || 'No se pudo cargar la liquidación'
        toast.error(mensaje)
        const cobradorSeleccionado = cobradores.find((c) => c.id.toString() === selectedCobrador)
        const rutaPrincipal =
          cobradorSeleccionado?.rutasAsignadas?.[0]?.nombre || 'Sin ruta asignada'
        const nombreCobrador = cobradorSeleccionado?.nombreCompleto || 'Sin cobrador seleccionado'
        setLiquidacion(createEmptyLiquidacion(nombreCobrador, rutaPrincipal))
      } finally {
        setLoading(false)
      }
    }

    cargarLiquidacion()
  }, [selectedCobrador, fechaInicio, fechaFin])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Liquidación</h1>
          <p className="text-gray-600">
            Gestiona la liquidación de tus cobradores con información consolidada
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck size={18} className="text-primary-600" />
          Información protegida desde el backend
        </div>
      </div>

      <div className="card space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Ruta
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCobrador}
                onChange={(e) => setSelectedCobrador(e.target.value)}
                className="input-field"
                disabled={loadingCobradores || cobradores.length === 0}
              >
                {loadingCobradores ? (
                  <option value="">Cargando cobradores...</option>
                ) : cobradores.length === 0 ? (
                  <option value="">No tienes cobradores registrados</option>
                ) : (
                  cobradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreCompleto}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Fecha inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Fecha final
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              onClick={() => {
                if (selectedCobrador) {
                  setFechaInicio(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
                  setFechaFin(new Date().toISOString().split('T')[0])
                }
              }}
              className="btn-primary inline-flex items-center justify-center space-x-2 w-full h-12"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Cargar datos</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Cobrador</span>
            <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
              <button className="px-4 py-1 text-xs font-semibold text-white bg-emerald-500">Activo</button>
              <button className="px-4 py-1 text-xs font-semibold text-gray-500 bg-white hover:bg-gray-50 transition">
                Inactivar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wide text-primary-600">
            <button className="hover:text-primary-700 transition-colors">Ver detalles liquidación</button>
            <button className="hover:text-primary-700 transition-colors">Ver faltantes</button>
            <button className="hover:text-primary-700 transition-colors">Crear colchón/clavo</button>
            <button className="hover:text-primary-700 transition-colors">Observaciones</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-600">Generando liquidación...</p>
          </div>
        </div>
      ) : !liquidacion ? (
        <div className="card py-12 text-center text-gray-500">
          Selecciona un cobrador y rango de fechas para consultar su liquidación.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resumen de liquidación</h2>
                <p className="text-sm text-gray-500">
                  {liquidacion.ruta} &bull; {liquidacion.cobrador}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileSpreadsheet size={18} className="text-primary-600" />
                Información al {new Date(fechaFin).toLocaleDateString('es-CO')}
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                { label: 'Base trabajador', key: 'baseTrabajador', currency: true },
                { label: 'Gastos', key: 'gastos', currency: true },
                { label: 'Ingresos', key: 'ingresos', currency: true },
                { label: 'Pagos', key: 'pagos', currency: true },
                { label: 'Ventas', key: 'ventas', currency: true },
                { label: 'Efectivo a entregar', key: 'efectivoAEntregar', currency: true },
                { label: 'Efectivo entregado', key: 'efectivoEntregado', currency: true },
                { label: 'Faltante o sobrante', key: 'faltanteOSobrante', currency: true },
                { label: 'Papelería', key: 'papeleria', currency: true },
                { label: 'Pleno', key: 'pleno', currency: true },
                { label: 'Positivos', key: 'positivos', currency: false },
                { label: 'C. G y P', key: 'cargueGastoPersonal', currency: true },
              ].map(({ label, key, currency }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-4 flex flex-col gap-2"
                >
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label}
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {currency ? formatCurrency(liquidacion[key]) : Number(liquidacion[key] || 0).toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="card space-y-6">
            <header className="flex items-center gap-3">
              <Users size={20} className="text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Clientes renovados y nuevos
                </h3>
                <p className="text-sm text-gray-500">
                  Últimas ventas registradas por el cobrador en el periodo seleccionado
                </p>
              </div>
            </header>

            {clientesRenovados.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="font-medium">No hay ventas renovadas</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'ID',
                        'Fecha registro',
                        'Estado',
                        'Cédula',
                        'Cliente',
                        'Teléfono',
                        'Debe',
                        'Último saldo',
                        'Valor a entregar',
                        'Valor venta',
                        'Papelería',
                        'Domingo',
                        'D. Atrasados',
                        'D. Vencidos',
                        'C. adelantadas',
                        'V. cuota',
                      ].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {clientesRenovados.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="px-4 py-3 text-gray-700">{cliente.id}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {cliente.fechaRegistro
                            ? new Date(cliente.fechaRegistro).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {cliente.estado || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.cedula || '-'}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {cliente.cliente || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.telefono || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.debe)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.ultimoSaldo)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorAEntregar)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorVenta)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.papeleria)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.domingo ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700">{cliente.diasAtrasados ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700">{cliente.diasVencidos ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700">{cliente.cuotasAdelantadas ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorCuota)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card space-y-6">
            <header className="flex items-center gap-3">
              <AlertCircle size={20} className="text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Clientes cancelados y pagados
                </h3>
                <p className="text-sm text-gray-500">
                  Detalle de pagos totales realizados por los clientes del cobrador
                </p>
              </div>
            </header>

            {clientesPagados.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="font-medium">No hay ventas pagadas</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'ID',
                        'F. pago total',
                        'Cédula',
                        'Cliente',
                        'Valor total',
                        'Último saldo',
                        'Modalidad',
                        'Valor del pago',
                        'Fecha del pago',
                        'Días',
                        'V. cuota',
                      ].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {clientesPagados.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="px-4 py-3 text-gray-700">{cliente.id}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {cliente.fechaPagoTotal
                            ? new Date(cliente.fechaPagoTotal).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.cedula || '-'}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {cliente.cliente || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorTotal)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.ultimoSaldo)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.modalidad || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorPago)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {cliente.fechaPago
                            ? new Date(cliente.fechaPago).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{cliente.dias ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(cliente.valorCuota)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

