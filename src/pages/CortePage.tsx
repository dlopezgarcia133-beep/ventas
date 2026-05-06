import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Grid } from '@mui/material';
import axios from 'axios';
import { obtenerRolDesdeToken } from '../components/Token';

// ─── CorteVisual (admin/contador) ─────────────────────────────────────────────
const CorteVisual = ({ corte, ventas }: { corte: any; ventas: any[] }) => {
  const totalAdicional =
    (corte.adicional_recargas || 0) +
    (corte.adicional_transporte || 0) +
    (corte.adicional_otros || 0);
  const totalFinal = (corte.total_sistema || 0) + totalAdicional;
  const totalEfectivo =
    (corte.accesorios_efectivo || 0) + (corte.telefonos_efectivo || 0) + totalAdicional;
  const totalTarjeta = (corte.accesorios_tarjeta || 0) + (corte.telefonos_tarjeta || 0);
  const totalAccesorios = ventas
    .filter((v) => v.tipo_producto === 'accesorios')
    .reduce((s, v) => s + (v.total || 0), 0);

  const th = (label: string) => (
    <th key={label} style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'left' }}>
      {label}
    </th>
  );

  return (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5">Corte del Día ({corte.fecha})</Typography>
        {corte.enviado && <Chip label="Enviado" color="success" size="small" />}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Ventas de Accesorios</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Efectivo: ${(corte.accesorios_efectivo || 0).toFixed(2)}</Typography>
            <Typography>Tarjeta: ${(corte.accesorios_tarjeta || 0).toFixed(2)}</Typography>
            <Typography fontWeight={600}>Total: ${(corte.accesorios_total || 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Ventas de Teléfonos</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Efectivo: ${(corte.telefonos_efectivo || 0).toFixed(2)}</Typography>
            <Typography>Tarjeta: ${(corte.telefonos_tarjeta || 0).toFixed(2)}</Typography>
            <Typography fontWeight={600}>Total: ${(corte.telefonos_total || 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Montos Adicionales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Recargas Telcel: ${(corte.adicional_recargas || 0).toFixed(2)}</Typography>
            <Typography>Recargas YOVOY: ${(corte.adicional_transporte || 0).toFixed(2)}</Typography>
            <Typography>Centro de Pagos: ${(corte.adicional_otros || 0).toFixed(2)}</Typography>
            {(corte.salida_efectivo || 0) > 0 && (
              <Typography sx={{ mt: 1 }} color="warning.main">
                Salida Efectivo: ${(corte.salida_efectivo || 0).toFixed(2)}
              </Typography>
            )}
            {corte.nota_salida && (
              <Typography variant="body2" color="text.secondary">
                Nota: {corte.nota_salida}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Totales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Total Sistema: ${(corte.total_sistema || 0).toFixed(2)}</Typography>
            <Typography>Total Adicional: ${totalAdicional.toFixed(2)}</Typography>
            <Typography sx={{ mt: 1 }}>Efectivo: ${totalEfectivo.toFixed(2)}</Typography>
            <Typography>Tarjeta: ${totalTarjeta.toFixed(2)}</Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Total General: ${totalFinal.toFixed(2)}</strong>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Detalle de Ventas Accesorios</Typography>
        <Paper>
          <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Nombre', 'Producto', 'Cantidad', 'Precio', 'Total', 'Fecha'].map(th)}</tr>
            </thead>
            <tbody>
              {ventas
                .filter((v) => v.tipo_producto === 'accesorios')
                .map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                    <td style={{ padding: 8 }}>{v.producto}</td>
                    <td style={{ padding: 8 }}>{v.cantidad}</td>
                    <td style={{ padding: 8 }}>${v.precio_unitario?.toFixed(2)}</td>
                    <td style={{ padding: 8 }}>${v.total?.toFixed(2)}</td>
                    <td style={{ padding: 8 }}>{v.fecha}</td>
                  </tr>
                ))}
              {ventas.filter((v) => v.tipo_producto === 'accesorios').length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 8, textAlign: 'center' }}>
                    Sin ventas
                  </td>
                </tr>
              )}
            </tbody>
          </Box>
        </Paper>
        <Box mt={2} textAlign="right">
          <Typography variant="subtitle1" fontWeight={600}>
            Total Accesorios: ${totalAccesorios.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Detalle de Ventas Teléfonos</Typography>
        <Paper>
          <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Nombre', 'Producto', 'Tipo', 'Precio', 'Fecha'].map(th)}</tr>
            </thead>
            <tbody>
              {ventas
                .filter((v) => v.tipo_producto === 'telefono')
                .map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                    <td style={{ padding: 8 }}>{v.producto}</td>
                    <td style={{ padding: 8 }}>{v.tipo_venta}</td>
                    <td style={{ padding: 8 }}>${v.precio_unitario?.toFixed(2)}</td>
                    <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleDateString()}</td>
                  </tr>
                ))}
              {ventas.filter((v) => v.tipo_producto === 'telefono').length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 8, textAlign: 'center' }}>
                    Sin ventas
                  </td>
                </tr>
              )}
            </tbody>
          </Box>
        </Paper>
        <Box mt={2} textAlign="right">
          <Typography variant="subtitle1" fontWeight={600}>
            Total Teléfonos: $
            {ventas
              .filter((v) => v.tipo_producto === 'telefono')
              .reduce((s, v) => s + (v.precio_unitario || 0), 0)
              .toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── CortePage ────────────────────────────────────────────────────────────────
const CortePage = () => {
  const rolToken = obtenerRolDesdeToken();
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const API = process.env.REACT_APP_API_URL;

  // ── admin / contador state
  const [cortesGuardados, setCortesGuardados] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // ── encargado state
  const [resumen, setResumen] = useState<any>(null);
  const [corteHoy, setCorteHoy] = useState<any>(null);
  const [recargas, setRecargas] = useState('');
  const [transporte, setTransporte] = useState('');
  const [otros, setOtros] = useState('');
  const [salidaEfectivo, setSalidaEfectivo] = useState('');
  const [notaSalida, setNotaSalida] = useState('');
  const [msgRecargas, setMsgRecargas] = useState('');
  const [msgSalida, setMsgSalida] = useState('');
  const [msgEnviar, setMsgEnviar] = useState('');
  const [loadingRecargas, setLoadingRecargas] = useState(false);
  const [loadingSalida, setLoadingSalida] = useState(false);
  const [loadingEnviar, setLoadingEnviar] = useState(false);
  const midnightRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bloqueado = corteHoy?.enviado === true;

  // ── encargado: load on mount
  useEffect(() => {
    if (rolToken !== 'encargado') return;
    const cargar = async () => {
      try {
        const [resRes, corteRes] = await Promise.all([
          axios.get(`${API}/ventas/corte-general`, config),
          axios.get(`${API}/ventas/cortes/hoy`, config),
        ]);
        setResumen(resRes.data);
        const c = corteRes.data;
        if (c) {
          setCorteHoy(c);
          setRecargas(c.adicional_recargas ? String(c.adicional_recargas) : '');
          setTransporte(c.adicional_transporte ? String(c.adicional_transporte) : '');
          setOtros(c.adicional_otros ? String(c.adicional_otros) : '');
          setSalidaEfectivo(c.salida_efectivo ? String(c.salida_efectivo) : '');
          setNotaSalida(c.nota_salida || '');
        }
      } catch (err) {
        console.error('Error al cargar datos del corte', err);
      }
    };
    cargar();
  }, [rolToken]);

  // ── midnight auto-send
  useEffect(() => {
    if (rolToken !== 'encargado' || bloqueado) return;
    const ahora = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    const ms = manana.getTime() - ahora.getTime();
    midnightRef.current = setTimeout(() => enviarCorte(true), ms);
    return () => { if (midnightRef.current) clearTimeout(midnightRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloqueado, rolToken]);

  // ── admin/contador: modules + filtered cortes
  useEffect(() => {
    if (rolToken !== 'contador' && rolToken !== 'admin') return;
    axios.get(`${API}/registro/modulos`, config).then((r) => setModulos(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (rolToken !== 'contador' && rolToken !== 'admin') return;
    if (filtroModulo || filtroFecha) {
      const params: any = {};
      if (filtroFecha) params.fecha = filtroFecha;
      if (filtroModulo) params.modulo_id = filtroModulo;
      axios
        .get(`${API}/ventas/ventas/cortes`, { ...config, params })
        .then((r) => setCortesGuardados(r.data))
        .catch(console.error);
    } else {
      setCortesGuardados([]);
    }
  }, [filtroModulo, filtroFecha]);

  // ── encargado actions
  const guardarRecargas = async () => {
    setLoadingRecargas(true);
    setMsgRecargas('');
    try {
      const res = await axios.patch(
        `${API}/ventas/cortes/hoy/recargas`,
        {
          adicional_recargas: parseFloat(recargas || '0'),
          adicional_transporte: parseFloat(transporte || '0'),
          adicional_otros: parseFloat(otros || '0'),
        },
        config,
      );
      setCorteHoy(res.data);
      setMsgRecargas('Recargas guardadas correctamente');
    } catch (err: any) {
      setMsgRecargas(err?.response?.data?.detail || 'Error al guardar recargas');
    } finally {
      setLoadingRecargas(false);
    }
  };

  const guardarSalida = async () => {
    setLoadingSalida(true);
    setMsgSalida('');
    try {
      const res = await axios.patch(
        `${API}/ventas/cortes/hoy/salida`,
        {
          salida_efectivo: parseFloat(salidaEfectivo || '0'),
          nota_salida: notaSalida || null,
        },
        config,
      );
      setCorteHoy(res.data);
      setMsgSalida('Salida guardada correctamente');
    } catch (err: any) {
      setMsgSalida(err?.response?.data?.detail || 'Error al guardar salida');
    } finally {
      setLoadingSalida(false);
    }
  };

  const enviarCorte = async (automatico = false) => {
    setLoadingEnviar(true);
    setMsgEnviar('');
    try {
      const res = await axios.post(`${API}/ventas/cortes/hoy/enviar`, {}, config);
      setCorteHoy(res.data);
      setMsgEnviar(
        automatico ? 'Corte enviado automáticamente a medianoche' : 'Corte enviado correctamente',
      );
    } catch (err: any) {
      setMsgEnviar(err?.response?.data?.detail || 'Error al enviar el corte');
    } finally {
      setLoadingEnviar(false);
    }
  };

  // ── derived totals (encargado live view)
  const totalAdicional =
    parseFloat(recargas || '0') + parseFloat(transporte || '0') + parseFloat(otros || '0');
  const totalSistema = resumen?.total_sistema || 0;
  const totalGeneral = totalSistema + totalAdicional;
  const totalEfectivo =
    (resumen?.ventas_productos?.efectivo ?? 0) +
    (resumen?.ventas_telefonos?.efectivo ?? 0) +
    totalAdicional;
  const totalTarjeta =
    (resumen?.ventas_productos?.tarjeta ?? 0) + (resumen?.ventas_telefonos?.tarjeta ?? 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN / CONTADOR VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (rolToken === 'contador' || rolToken === 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Cortes Registrados
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por módulo</InputLabel>
              <Select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                label="Filtrar por módulo"
              >
                <MenuItem value="">Todos</MenuItem>
                {modulos.map((m: any) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              label="Filtrar por fecha"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        {cortesGuardados.length === 0 ? (
          <Typography>No hay cortes registrados.</Typography>
        ) : (
          cortesGuardados.map((corte, i) => (
            <CorteVisual key={i} corte={corte} ventas={corte.ventas || []} />
          ))
        )}
      </Box>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENCARGADO VIEW — two-column layout
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Corte del Día
        </Typography>
        {bloqueado && <Chip label="ENVIADO" color="success" />}
      </Stack>

      <Grid container spacing={3}>
        {/* ── Columna izquierda: Balance del Día ─────────────────────────── */}
        <Grid item xs={12} md={6}>
          {/* Recargas */}
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Montos Adicionales
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <TextField
              label="Recargas Telcel"
              type="number"
              value={recargas}
              onChange={(e) => setRecargas(e.target.value)}
              fullWidth
              margin="normal"
              disabled={bloqueado}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Recargas YOVOY"
              type="number"
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              fullWidth
              margin="normal"
              disabled={bloqueado}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Centro de Pagos"
              type="number"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              fullWidth
              margin="normal"
              disabled={bloqueado}
              inputProps={{ min: 0 }}
            />
            {msgRecargas && (
              <Alert
                severity={msgRecargas.toLowerCase().includes('error') ? 'error' : 'success'}
                sx={{ mt: 1 }}
              >
                {msgRecargas}
              </Alert>
            )}
            {!bloqueado && (
              <Button
                variant="outlined"
                onClick={guardarRecargas}
                disabled={loadingRecargas}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loadingRecargas ? 'Guardando...' : 'Guardar Recargas'}
              </Button>
            )}
          </Paper>

          {/* Salida de efectivo */}
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Salida de Efectivo
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <TextField
              label="Monto de salida"
              type="number"
              value={salidaEfectivo}
              onChange={(e) => setSalidaEfectivo(e.target.value)}
              fullWidth
              margin="normal"
              disabled={bloqueado}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Nota"
              value={notaSalida}
              onChange={(e) => setNotaSalida(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              disabled={bloqueado}
            />
            {msgSalida && (
              <Alert
                severity={msgSalida.toLowerCase().includes('error') ? 'error' : 'success'}
                sx={{ mt: 1 }}
              >
                {msgSalida}
              </Alert>
            )}
            {!bloqueado && (
              <Button
                variant="outlined"
                onClick={guardarSalida}
                disabled={loadingSalida}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loadingSalida ? 'Guardando...' : 'Guardar Salida'}
              </Button>
            )}
          </Paper>

          {/* Enviar corte */}
          {!bloqueado && (
            <Button
              variant="contained"
              color="error"
              size="large"
              fullWidth
              onClick={() => enviarCorte(false)}
              disabled={loadingEnviar}
              sx={{ py: 2, fontWeight: 700, fontSize: '1rem' }}
            >
              {loadingEnviar ? 'Enviando...' : 'ENVIAR CORTE DEL DÍA'}
            </Button>
          )}
          {msgEnviar && (
            <Alert
              severity={msgEnviar.toLowerCase().includes('error') ? 'error' : 'success'}
              sx={{ mt: 2 }}
            >
              {msgEnviar}
            </Alert>
          )}
        </Grid>

        {/* ── Columna derecha: Resumen del Día ───────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ventas de Accesorios
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              Efectivo: ${(resumen?.ventas_productos?.efectivo ?? 0).toFixed(2)}
            </Typography>
            <Typography>
              Tarjeta: ${(resumen?.ventas_productos?.tarjeta ?? 0).toFixed(2)}
            </Typography>
            <Typography fontWeight={600}>
              Total: ${(resumen?.ventas_productos?.total ?? 0).toFixed(2)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ventas de Teléfonos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              Efectivo: ${(resumen?.ventas_telefonos?.efectivo ?? 0).toFixed(2)}
            </Typography>
            <Typography>
              Tarjeta: ${(resumen?.ventas_telefonos?.tarjeta ?? 0).toFixed(2)}
            </Typography>
            <Typography fontWeight={600}>
              Total: ${(resumen?.ventas_telefonos?.total ?? 0).toFixed(2)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Día
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Total Sistema: ${totalSistema.toFixed(2)}</Typography>
            <Typography>Total Adicional: ${totalAdicional.toFixed(2)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Efectivo: ${totalEfectivo.toFixed(2)}</Typography>
            <Typography>Tarjeta: ${totalTarjeta.toFixed(2)}</Typography>
            {parseFloat(salidaEfectivo || '0') > 0 && (
              <Typography sx={{ mt: 1 }} color="warning.main">
                Salida Efectivo: -${parseFloat(salidaEfectivo || '0').toFixed(2)}
              </Typography>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Total General: ${totalGeneral.toFixed(2)}</strong>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CortePage;
