import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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

const HOY = new Date().toLocaleDateString('en-CA');

// ─── Style helpers ────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #e2e8f0',
  color: '#f97316',
  fontWeight: 700,
  background: '#f8fafc',
  textAlign: 'left',
};
const tdStyle: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #e2e8f0' };
const tdR: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

// ─── Comision helpers (mirrored from VentasPage) ──────────────────────────────
const ACC_KEYWORDS: [string, number][] = [
  ['BOCINA', 20], ['CARGADOR', 20],
  ['EX. SMART WATCH', 20], ['SMART WATCH', 20],
  ['FUNDA DE BRAZO', 20], ['FUNDA DE IPAD', 20],
  ['TABLET $2499', 200], ['TABLET', 100],
  ['MANOS LIBRES $749', 20], ['MANOS LIBRES $799', 20], ['MANOS LIBRES $849', 20],
  ['MANOS LIBRES $899', 20], ['MANOS LIBRES $949', 20], ['MANOS LIBRES $999', 20],
  ['MANOS LIBRES $1099', 20], ['MANOS LIBRES $1199', 20], ['MANOS LIBRES $1249', 20],
  ['MANOS LIBRES $1299', 20], ['MANOS LIBRES $1399', 20], ['MANOS LIBRES $1449', 20],
  ['MANOS LIBRES $1499', 20], ['MANOS LIBRES', 10],
  ['FUNDA $160', 10], ['FUNDA', 20],
  ['MICA DE HIDROGEL $399', 20], ['MICA DE HIDROGEL', 10],
  ['MICA $40', 5], ['MICA $99', 5], ['MICA $120', 5], ['MICA', 10],
  ['PROTECTOR $79', 5], ['PROTECTOR $99', 5], ['PROTECTOR $120', 5],
  ['PROTECTOR $130', 5], ['PROTECTOR $149', 5], ['PROTECTOR $169', 5],
  ['PROTECTOR $180', 5], ['PROTECTOR $199', 5],
  ['PROTECTOR $249', 10], ['PROTECTOR $299', 10], ['PROTECTOR $349', 10],
  ['PROTECTOR $399', 15], ['PROTECTOR', 20],
  ['BASE PARA COCHE', 10], ['CABLE USB', 10],
  ['CÁMARA', 10], ['CAMARA', 10],
  ['GAMEBOY', 10], ['GAME BOY', 10],
  ['POWER BANK', 10], ['WEBCAM', 10],
];

const TEL_EXACT_MAP: Record<string, number> = {
  'TELEFONO LIBRE HONOR 200 LITE 256GB': 250,
  'TELEFONO LIBRE HONOR MAGIC 5 LITE 128GB': 200,
  'TELEFONO LIBRE HONOR MAGIC 5 LITE 256GB': 200,
  'TELEFONO LIBRE HONOR X5': 200,
  'TELEFONO LIBRE HONOR X6A 128GB': 200,
  'TELEFONO LIBRE HONOR X6B PLUS 256GB': 200,
  'TELEFONO LIBRE HONOR X7A': 250,
  'TELEFONO LIBRE HONOR X7B 128GB': 100,
  'TELEFONO LIBRE HONOR X7B 256GB': 100,
  'TELEFONO LIBRE HONOR X7C 256GB': 100,
  'TELEFONO LIBRE HONOR X8A 128GB': 200,
  'TELEFONO LIBRE HONOR X9C 256GB': 200,
  'TELEFONO LIBRE IPHONE 12 128GB': 100,
  'TELEFONO LIBRE IPHONE 13 128GB': 100,
  'TELEFONO LIBRE IPHONE 14 128GB': 100,
  'TELEFONO LIBRE IPHONE 15 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 PLUS 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 PRO 128GB': 100,
  'TELEFONO LIBRE IPHONE 16E 128GB': 100,
  'TELEFONO LIBRE KODAK KD50': 100,
  'TELEFONO LIBRE MOTOROLA G31 128GB': 100,
  'TELEFONO LIBRE MOTOROLA G85 256GB': 100,
  'TELEFONO LIBRE OPPO A18 128GB': 100,
  'TELEFONO LIBRE OPPO A40 128GB': 100,
  'TELEFONO LIBRE OPPO A78 128GB': 100,
  'TELEFONO LIBRE REALME C11': 200,
  'TELEFONO LIBRE REALME C51': 200,
  'TELEFONO LIBRE RF IPHONE 11 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 11 64GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 PRO MAX 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 PRO MAX 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 PRO 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 15 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 15 PROMAX 256GB': 100,
  'TELEFONO LIBRE SAMSUNG A05S 128GB': 100,
  'TELEFONO LIBRE SAMSUNG A06 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A06 64GB': 50,
  'TELEFONO LIBRE SAMSUNG A16 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A16 256GB': 50,
  'TELEFONO LIBRE SAMSUNG A23 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A25 5G 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A25 5G 256GB': 200,
  'TELEFONO LIBRE SAMSUNG A26 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A35 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A35 256GB': 200,
  'TELEFONO LIBRE SAMSUNG A55 256GB': 200,
  'TELEFONO LIBRE VIVO Y01': 200,
  'TELEFONO LIBRE WIKO T10': 200,
  'TELEFONO LIBRE XIAOMI REDMI 10A 64GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI 13 128GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI 13C 128GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 10 PRO 128GB': 200,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 12 PRO 128GB': 200,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 13 128GB': 100,
  'TELEFONO LIBRE ZTE A31': 200,
  'TELEFONO LIBRE ZTE A55': 100,
  'TELEFONO LIBRE ZTE V60 SMART': 100,
  'TELEFONO TELCEL ACER A62 ULTRA': 200,
  'TELEFONO TELCEL HONOR X8A': 100,
  'TELEFONO TELCEL IPHONE 11 64GB': 100,
  'TELEFONO TELCEL IPHONE 12 128GB': 100,
  'TELEFONO TELCEL IPHONE 13 128GB': 100,
  'TELEFONO TELCEL IPHONE 14 128GB': 100,
  'TELEFONO TELCEL IPHONE 15 128GB': 100,
  'TELEFONO TELCEL MOTOROLA EDGE 30 128GB': 100,
  'TELEFONO TELCEL MOTOROLA G24 256GB': 50,
  'TELEFONO TELCEL MOTOROLA G32 128GB': 200,
  'TELEFONO TELCEL MOTOROLA G53': 100,
  'TELEFONO TELCEL NUBIA Z353': 100,
  'TELEFONO TELCEL OPPO A5 256GB': 100,
  'TELEFONO TELCEL OPPO A79 256GB': 100,
  'TELEFONO TELCEL REALME NOTE 60 128GB': 200,
  'TELEFONO TELCEL SAMSUNG A05S 64GB': 100,
  'TELEFONO TELCEL SAMSUNG A06 64GB': 50,
  'TELEFONO TELCEL SAMSUNG A16 128GB': 50,
  'TELEFONO TELCEL SAMSUNG A25': 200,
  'TELEFONO TELCEL SAMSUNG A25 128GB': 50,
  'TELEFONO TELCEL SAMSUNG A35': 100,
  'TELEFONO TELCEL SAMSUNG A35 128GB': 200,
  'TELEFONO TELCEL ZTE A51': 200,
  'TELEFONO TELCEL ZTE A55': 100,
  'TELEFONO TELCEL ZTE V40 PRO': 100,
  'TELEFONO TELCEL ZTE V40 VITA': 100,
  'TELEFONO TELCEL ZTE V60 SMART': 100,
};

const calcComision = (v: any): number => {
  const nombre = (v.producto || '').toUpperCase();
  if (v.tipo_producto === 'telefono') {
    const tipo = (v.tipo_venta || '').toLowerCase();
    const base = TEL_EXACT_MAP[nombre];
    const inMap = base !== undefined;
    if (tipo === 'contado') return inMap ? base : 10;
    if (tipo === 'pajoy') return inMap ? 100 + base : 100;
    if (tipo === 'paguitos') return inMap ? 110 + base : 110;
    return 0;
  }
  if (v.tipo_producto === 'accesorios') {
    for (const [keyword, comision] of ACC_KEYWORDS) {
      if (nombre.includes(keyword)) return comision;
    }
    return 0;
  }
  return 0;
};

const getTotal = (v: any) => v.total ?? (v.precio_unitario || 0) * (v.cantidad || 1);

// ─── CorteVisual (admin / contador) ──────────────────────────────────────────
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
    <th key={label} style={thStyle}>{label}</th>
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
              <Typography variant="body2" color="text.secondary">Nota: {corte.nota_salida}</Typography>
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
              {ventas.filter((v) => v.tipo_producto === 'accesorios').map((v) => (
                <tr key={v.id}>
                  <td style={tdStyle}>{v.empleado?.username}</td>
                  <td style={tdStyle}>{v.producto}</td>
                  <td style={tdStyle}>{v.cantidad}</td>
                  <td style={tdStyle}>${v.precio_unitario?.toFixed(2)}</td>
                  <td style={tdStyle}>${v.total?.toFixed(2)}</td>
                  <td style={tdStyle}>{v.fecha}</td>
                </tr>
              ))}
              {ventas.filter((v) => v.tipo_producto === 'accesorios').length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center' }}>Sin ventas</td></tr>
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
              {ventas.filter((v) => v.tipo_producto === 'telefono').map((v) => (
                <tr key={v.id}>
                  <td style={tdStyle}>{v.empleado?.username}</td>
                  <td style={tdStyle}>{v.producto}</td>
                  <td style={tdStyle}>{v.tipo_venta}</td>
                  <td style={tdStyle}>${v.precio_unitario?.toFixed(2)}</td>
                  <td style={tdStyle}>{new Date(v.fecha).toLocaleDateString()}</td>
                </tr>
              ))}
              {ventas.filter((v) => v.tipo_producto === 'telefono').length === 0 && (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>Sin ventas</td></tr>
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

  // ── admin / contador state ────────────────────────────────────────────────
  const [cortesGuardados, setCortesGuardados] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // ── encargado left-column state ───────────────────────────────────────────
  const [resumen, setResumen] = useState<any>(null);
  const [chips, setChips] = useState<any[]>([]);
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

  // ── encargado right-column state ──────────────────────────────────────────
  const [fechaDerecha, setFechaDerecha] = useState(HOY);
  const [ventasDerecha, setVentasDerecha] = useState<any[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);

  const midnightRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bloqueado = corteHoy?.enviado === true;

  // ── derived: right column ────────────────────────────────────────────────
  const ventasDerechaAcc = ventasDerecha.filter(
    (v) => v.tipo_producto === 'accesorios' && !v.cancelada,
  );
  const ventasDerechaTel = ventasDerecha.filter(
    (v) => v.tipo_producto === 'telefono' && !v.cancelada,
  );
  const todasVentas = [...ventasDerechaAcc, ...ventasDerechaTel];
  const subtotalDerechaAcc = ventasDerechaAcc.reduce((s, v) => s + getTotal(v), 0);
  const subtotalDerechaTel = ventasDerechaTel.reduce((s, v) => s + getTotal(v), 0);
  const comisionDerechaAcc = ventasDerechaAcc.reduce((s, v) => s + calcComision(v), 0);
  const comisionDerechaTel = ventasDerechaTel.reduce((s, v) => s + calcComision(v), 0);

  // ── derived: left column (desglose calculado desde ventasDerecha) ─────────
  const ef_acc = ventasDerechaAcc.filter((v) => v.metodo_pago?.toLowerCase() === 'efectivo').reduce((s, v) => s + getTotal(v), 0);
  const ta_acc = ventasDerechaAcc.filter((v) => v.metodo_pago?.toLowerCase() === 'tarjeta').reduce((s, v) => s + getTotal(v), 0);
  const ef_tel = ventasDerechaTel.filter((v) => v.metodo_pago?.toLowerCase() === 'efectivo').reduce((s, v) => s + getTotal(v), 0);
  const ta_tel = ventasDerechaTel.filter((v) => v.metodo_pago?.toLowerCase() === 'tarjeta').reduce((s, v) => s + getTotal(v), 0);
  const rec = parseFloat(recargas || '0');
  const trans = parseFloat(transporte || '0');
  const otr = parseFloat(otros || '0');
  const totalAdicional = rec + trans + otr;
  const sal = parseFloat(salidaEfectivo || '0');
  const total_tarjeta = ta_acc + ta_tel;
  const subtotal_efectivo = ef_acc + ef_tel + totalAdicional;
  const total_efectivo_final = subtotal_efectivo - sal;

  console.log('TODOS LOS CHIPS:', JSON.stringify(chips.slice(0, 5)));
  const chipsHoy = chips.filter((c) => {
    const fecha = c.fecha ? String(c.fecha).slice(0, 10) : '';
    return fecha === fechaDerecha && !c.cancelada;
  });
  const chipsTotal = chipsHoy.reduce((s: number, c: any) => s + (c.monto_recarga || 0), 0);
  const chipsPorTipo = chipsHoy.reduce((acc: Record<string, number>, c: any) => {
    const tipo = c.tipo_chip || 'Sin tipo';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  // ── fetch ventas for right column ─────────────────────────────────────────
  const fetchVentasDerecha = async (fecha: string) => {
    setLoadingVentas(true);
    try {
      const res = await axios.get(`${API}/ventas/ventas`, { ...config, params: { fecha } });
      setVentasDerecha(res.data);
    } catch {
      setVentasDerecha([]);
    } finally {
      setLoadingVentas(false);
    }
  };

  // ── on mount: load all encargado data ─────────────────────────────────────
  useEffect(() => {
    if (rolToken !== 'encargado') return;
    const cargar = async () => {
      const [resRes, chipsRes] = await Promise.all([
        axios.get(`${API}/ventas/corte-general`, config).catch(() => ({ data: null })),
        axios.get(`${API}/ventas/venta_chips`, config).catch(() => ({ data: [] })),
      ]);
      setResumen(resRes.data);
      setChips(chipsRes.data ?? []);
    };
    cargar();
    fetchVentasDerecha(HOY);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolToken]);

  // ── midnight auto-send ────────────────────────────────────────────────────
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

  // ── admin/contador: modules ───────────────────────────────────────────────
  useEffect(() => {
    if (rolToken !== 'contador' && rolToken !== 'admin') return;
    axios.get(`${API}/registro/modulos`, config).then((r) => setModulos(r.data)).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroModulo, filtroFecha]);

  // ── encargado actions ─────────────────────────────────────────────────────
  const guardarRecargas = async () => {
    setLoadingRecargas(true);
    setMsgRecargas('');
    try {
      const res = await axios.patch(
        `${API}/ventas/cortes/hoy/recargas`,
        { adicional_recargas: rec, adicional_transporte: trans, adicional_otros: otr },
        config,
      );
      setCorteHoy(res.data);
      setMsgRecargas('Recargas guardadas');
    } catch (err: any) {
      setMsgRecargas(err?.response?.data?.detail || 'Error al guardar');
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
        { salida_efectivo: sal, nota_salida: notaSalida || null },
        config,
      );
      setCorteHoy(res.data);
      setMsgSalida('Salida guardada');
    } catch (err: any) {
      setMsgSalida(err?.response?.data?.detail || 'Error al guardar');
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
      setMsgEnviar(automatico ? 'Corte enviado automáticamente' : 'Corte enviado correctamente');
    } catch (err: any) {
      setMsgEnviar(err?.response?.data?.detail || 'Error al enviar');
    } finally {
      setLoadingEnviar(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN / CONTADOR VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (rolToken === 'contador' || rolToken === 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Cortes Registrados</Typography>
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
                  <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
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

  // ─────────────────────────────────────────────────────────────────────────
  // ENCARGADO VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Corte del Día</Typography>
        {bloqueado && <Chip label="ENVIADO" color="success" />}
      </Stack>

      <Grid container spacing={3} alignItems="flex-start">
        {/* ══════════════════════════════════════════════════════════════════
            COLUMNA IZQUIERDA — Balance
        ══════════════════════════════════════════════════════════════════ */}
        <Grid item xs={12} md={6}>

          {/* ── Resumen General ── */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Resumen General</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              component="table"
              sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Categoría</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Ventas</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <Chip label="Acc" size="small"
                      sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} />
                    &nbsp; Accesorios
                  </td>
                  <td style={tdR}>
                    {ventasDerechaAcc.length > 0 ? ventasDerechaAcc.length : '—'}
                  </td>
                  <td style={tdR}>
                    <strong>${subtotalDerechaAcc.toFixed(2)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <Chip label="Tel" size="small"
                      sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} />
                    &nbsp; Teléfonos
                  </td>
                  <td style={tdR}>
                    {ventasDerechaTel.length > 0 ? ventasDerechaTel.length : '—'}
                  </td>
                  <td style={tdR}>
                    <strong>${subtotalDerechaTel.toFixed(2)}</strong>
                  </td>
                </tr>
                {chipsHoy.length === 0 ? (
                  <tr>
                    <td style={tdStyle}>
                      <Chip label="Chip" size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: 11 }} />
                      &nbsp; Chips
                    </td>
                    <td style={tdR}>—</td>
                    <td style={tdR}>—</td>
                  </tr>
                ) : (
                  Object.entries(chipsPorTipo).map(([tipo, cantidad]) => (
                    <tr key={tipo}>
                      <td style={tdStyle}>
                        <Chip label="Chip" size="small"
                          sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: 11 }} />
                        &nbsp; {tipo}
                      </td>
                      <td style={tdR}>{cantidad as number}</td>
                      <td style={tdR}>—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Paper>

          {/* ── Desglose Efectivo / Tarjeta ── */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Desglose</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              component="table"
              sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
            >
              <thead>
                <tr>
                  <th style={thStyle} />
                  <th style={{ ...thStyle, textAlign: 'right' }}>Efectivo</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Tarjeta</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Accesorios</td>
                  <td style={tdR}>${ef_acc.toFixed(2)}</td>
                  <td style={tdR}>${ta_acc.toFixed(2)}</td>
                  <td style={tdR}><strong>${(ef_acc + ta_acc).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td style={tdStyle}>Teléfonos</td>
                  <td style={tdR}>${ef_tel.toFixed(2)}</td>
                  <td style={tdR}>${ta_tel.toFixed(2)}</td>
                  <td style={tdR}><strong>${(ef_tel + ta_tel).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </Box>
          </Paper>

          {/* ── Montos Adicionales ── */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Montos Adicionales</Typography>
            <Divider sx={{ mb: 1 }} />
            <TextField
              label="Recargas Telcel" type="number" value={recargas}
              onChange={(e) => setRecargas(e.target.value)}
              fullWidth margin="dense" size="small" disabled={bloqueado} inputProps={{ min: 0 }}
            />
            <TextField
              label="Recargas YOVOY" type="number" value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              fullWidth margin="dense" size="small" disabled={bloqueado} inputProps={{ min: 0 }}
            />
            <TextField
              label="Centro de Pagos" type="number" value={otros}
              onChange={(e) => setOtros(e.target.value)}
              fullWidth margin="dense" size="small" disabled={bloqueado} inputProps={{ min: 0 }}
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
                variant="outlined" fullWidth sx={{ mt: 1.5 }}
                onClick={guardarRecargas} disabled={loadingRecargas}
              >
                {loadingRecargas ? 'Guardando...' : 'Guardar Recargas'}
              </Button>
            )}
          </Paper>

          {/* ── Salida de Efectivo ── */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Salida de Efectivo</Typography>
            <Divider sx={{ mb: 1 }} />
            <TextField
              label="Monto de salida" type="number" value={salidaEfectivo}
              onChange={(e) => setSalidaEfectivo(e.target.value)}
              fullWidth margin="dense" size="small" disabled={bloqueado} inputProps={{ min: 0 }}
            />
            <TextField
              label="Nota" value={notaSalida}
              onChange={(e) => setNotaSalida(e.target.value)}
              fullWidth margin="dense" size="small" multiline rows={2} disabled={bloqueado}
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
                variant="outlined" fullWidth sx={{ mt: 1.5 }}
                onClick={guardarSalida} disabled={loadingSalida}
              >
                {loadingSalida ? 'Guardando...' : 'Guardar Salida'}
              </Button>
            )}
          </Paper>

          {/* ── Totales Finales ── */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Totales Finales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Total Tarjeta</Typography>
              <Typography fontWeight={600}>${total_tarjeta.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Subtotal Efectivo</Typography>
              <Typography fontWeight={600}>${subtotal_efectivo.toFixed(2)}</Typography>
            </Box>
            {sal > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="warning.main">Salida</Typography>
                <Typography color="warning.main">-${sal.toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={700}>Total Efectivo Final</Typography>
              <Typography fontWeight={700} color="success.main" fontSize={16}>
                ${total_efectivo_final.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {/* ── Enviar Corte ── */}
          {!bloqueado ? (
            <Button
              variant="contained" size="large" fullWidth
              sx={{ py: 2, fontWeight: 700, fontSize: '1rem', bgcolor: '#f97316', '&:hover': { bgcolor: '#ea6c0a' } }}
              onClick={() => enviarCorte(false)} disabled={loadingEnviar}
            >
              {loadingEnviar ? 'Enviando...' : 'ENVIAR CORTE DEL DÍA'}
            </Button>
          ) : (
            <Alert severity="success">Corte del día enviado y bloqueado.</Alert>
          )}
          {msgEnviar && (
            <Alert
              severity={msgEnviar.toLowerCase().includes('error') ? 'error' : 'success'}
              sx={{ mt: 1.5 }}
            >
              {msgEnviar}
            </Alert>
          )}
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMNA DERECHA — Resumen completo del día
        ══════════════════════════════════════════════════════════════════ */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Resumen del Día
          </Typography>

          {/* Filtro de fecha */}
          <Box display="flex" gap={1} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              type="date" size="small" value={fechaDerecha}
              onChange={(e) => setFechaDerecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained" size="small"
              sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea6c0a' } }}
              onClick={() => fetchVentasDerecha(fechaDerecha)}
            >
              Buscar
            </Button>
          </Box>

          {loadingVentas ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              {/* Tabla de ventas */}
              <Paper
                sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', mb: 2, overflow: 'hidden' }}
              >
                <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                  <Typography fontWeight={700} fontSize={14} color="#c2410c">
                    Ventas del {fechaDerecha === HOY ? 'día de hoy' : fechaDerecha}
                    {fechaDerecha !== HOY && (
                      <Chip label="Solo lectura" size="small" sx={{ ml: 1, fontSize: 11 }} />
                    )}
                  </Typography>
                </Box>
                {todasVentas.length === 0 ? (
                  <Box px={2} py={3}>
                    <Typography variant="body2" color="text.secondary">
                      Sin ventas para esta fecha
                    </Typography>
                  </Box>
                ) : (
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Descripción</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Comisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasVentas.map((v) => (
                        <tr key={v.id}>
                          <td style={tdStyle}>
                            {v.tipo_producto === 'accesorios' ? (
                              <Chip label="Acc" size="small"
                                sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} />
                            ) : (
                              <Chip label="Tel" size="small"
                                sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} />
                            )}
                          </td>
                          <td style={{ ...tdStyle, maxWidth: 180 }}>
                            {v.producto}
                            {v.tipo_venta && (
                              <span style={{ color: '#64748b', fontWeight: 400 }}> — {v.tipo_venta}</span>
                            )}
                          </td>
                          <td style={tdR}>${getTotal(v).toFixed(2)}</td>
                          <td style={{ ...tdR, color: '#15803d', fontWeight: 600 }}>
                            ${calcComision(v).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                )}

                {/* Subtotales */}
                {todasVentas.length > 0 && (
                  <Box
                    sx={{
                      px: 2, py: 1.5,
                      bgcolor: '#f8fafc',
                      borderTop: '2px solid #e2e8f0',
                      display: 'flex',
                      gap: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Accesorios:{' '}
                      <strong>{ventasDerechaAcc.length} ventas</strong>{' '}
                      | <strong>${subtotalDerechaAcc.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Teléfonos:{' '}
                      <strong>{ventasDerechaTel.length} ventas</strong>{' '}
                      | <strong>${subtotalDerechaTel.toFixed(2)}</strong>
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Comisiones del día */}
              {todasVentas.length > 0 && (
                <Paper
                  sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden' }}
                >
                  <Box sx={{ px: 2, py: 1.5, bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                    <Typography fontWeight={700} fontSize={14} color="#15803d">
                      Comisiones del Día
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="text.secondary">Accesorios</Typography>
                      <Typography variant="body2" fontWeight={600}>${comisionDerechaAcc.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="text.secondary">Teléfonos</Typography>
                      <Typography variant="body2" fontWeight={600}>${comisionDerechaTel.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontWeight={700}>Total Comisionado</Typography>
                      <Typography fontWeight={700} color="success.main">
                        ${(comisionDerechaAcc + comisionDerechaTel).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CortePage;
