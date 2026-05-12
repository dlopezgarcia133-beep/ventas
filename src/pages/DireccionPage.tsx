import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const HOY = new Date().toLocaleDateString('en-CA');
const MODULOS_OCULTOS = ['V2', 'Cadenas C.', 'MI2', 'BO', 'prueba'];

// ─── Style helpers ────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #e5e5e5',
  color: '#333',
  fontWeight: 700,
  background: '#f5f5f5',
  textAlign: 'left',
  fontSize: 12,
};
const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #e5e5e5',
  fontSize: 13,
};
const tdR: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

const getTotal = (v: any) => v.total ?? (v.precio_unitario || 0) * (v.cantidad || 1);
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
const fmt$ = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Section header helper ────────────────────────────────────────────────────
const sectionHeader = (label: string, icon?: React.ReactNode) => (
  <Box sx={{ px: 2, py: 1.2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: 1 }}>
    {icon}
    <Typography fontWeight={700} fontSize={13} color="#1a1a2e" letterSpacing={0.3}>
      {label}
    </Typography>
  </Box>
);

const sectionFooter = (label: string, value: React.ReactNode) => (
  <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" fontWeight={700} color="#333">{label}</Typography>
    <Typography variant="body2" fontWeight={700} color="#333">{value}</Typography>
  </Box>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CortePendiente {
  id: number;
  modulo_id: number;
  modulo_nombre: string;
  fecha: string;
  total_efectivo: number;
  total_tarjeta: number;
  total_general: number;
}


// ─── DireccionPage ────────────────────────────────────────────────────────────

const DireccionPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const API = process.env.REACT_APP_API_URL;

  // Panel A — pendientes
  const [pendientes, setPendientes] = useState<CortePendiente[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);

  // Panel B — filtro
  const [modulos, setModulos] = useState<any[]>([]);
  const [moduloId, setModuloId] = useState('');
  const [fecha, setFecha] = useState(HOY);
  const [loading, setLoading] = useState(false);
  const [sinCorte, setSinCorte] = useState(false);

  // Panel C — detalle
  const [corte, setCorte] = useState<any>(null);
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; sev: 'success' | 'error' } | null>(null);

  // Layout — panel derecho: filtro (false) o detalle (true)
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // ── cargar módulos y pendientes al montar ─────────────────────────────────
  const cargarPendientes = useCallback(async () => {
    setLoadingPendientes(true);
    try {
      const { data } = await axios.get(`${API}/direccion/cortes-pendientes`, config);
      setPendientes(data);
    } catch {
      /* silencioso */
    } finally {
      setLoadingPendientes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarPendientes();
    axios
      .get(`${API}/registro/modulos`, config)
      .then((r) => setModulos(r.data))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── fetch corte detail ────────────────────────────────────────────────────
  const fetchCorte = async (mId: string, f: string) => {
    if (!mId || !f) return;
    setLoading(true);
    setSinCorte(false);
    setCorte(null);
    try {
      const res = await axios.get(`${API}/direccion/cortes`, {
        ...config,
        params: { modulo_id: Number(mId), fecha: f },
      });
      if (res.data) {
        setCorte(res.data);
      } else {
        setSinCorte(true);
      }
    } catch {
      setSinCorte(true);
    } finally {
      setLoading(false);
    }
  };

  const buscar = () => {
    setMostrarDetalle(true);
    fetchCorte(moduloId, fecha);
  };

  const abrirCortePendiente = (c: CortePendiente) => {
    const mId = String(c.modulo_id);
    setModuloId(mId);
    setFecha(c.fecha);
    setMostrarDetalle(true);
    fetchCorte(mId, c.fecha);
  };

  const volverAlFiltro = () => {
    setMostrarDetalle(false);
    setCorte(null);
    setSinCorte(false);
  };

  // ── marcar revisado ───────────────────────────────────────────────────────
  const marcarRevisado = async () => {
    if (!corte) return;
    setMarcando(true);
    try {
      const { data } = await axios.put(
        `${API}/direccion/cortes/${corte.id}/marcar-revisado`,
        {},
        config,
      );
      setCorte((prev: any) => ({ ...prev, ...data }));
      setSnack({ msg: 'Corte marcado como revisado correctamente', sev: 'success' });
      setDialogConfirm(false);
      cargarPendientes();
    } catch {
      setSnack({ msg: 'Error al marcar como revisado', sev: 'error' });
    } finally {
      setMarcando(false);
    }
  };

  // ── derived values ────────────────────────────────────────────────────────
  const ventas: any[] = corte?.ventas ?? [];
  const ventasAcc = ventas.filter((v) => v.tipo_producto === 'accesorios');
  const ventasTel = ventas.filter((v) => v.tipo_producto === 'telefono');

  const ef_acc = ventasAcc.filter((v) => v.metodo_pago?.toLowerCase() === 'efectivo').reduce((s: number, v: any) => s + getTotal(v), 0);
  const ta_acc = ventasAcc.filter((v) => v.metodo_pago?.toLowerCase() === 'tarjeta').reduce((s: number, v: any) => s + getTotal(v), 0);
  const ef_tel = ventasTel.filter((v) => v.metodo_pago?.toLowerCase() === 'efectivo').reduce((s: number, v: any) => s + getTotal(v), 0);
  const ta_tel = ventasTel.filter((v) => v.metodo_pago?.toLowerCase() === 'tarjeta').reduce((s: number, v: any) => s + getTotal(v), 0);
  const rec   = corte?.adicional_recargas   ?? 0;
  const trans = corte?.adicional_transporte ?? 0;
  const otr   = corte?.adicional_otros      ?? 0;
  const may   = corte?.adicional_mayoreo    ?? 0;
  const totalAdicional = rec + trans + otr + may;
  const sal   = corte?.salida_efectivo      ?? 0;
  const subtotalAcc = ventasAcc.reduce((s: number, v: any) => s + getTotal(v), 0);
  const subtotalTel = ventasTel.reduce((s: number, v: any) => s + getTotal(v), 0);
  const total_efectivo_final = ef_acc + ef_tel + totalAdicional - sal;
  const total_tarjeta        = ta_acc + ta_tel;

  const moduloNombre = modulos.find((m) => String(m.id) === moduloId)?.nombre ?? '';

  // ── JSX fragments reusados en mobile y desktop ────────────────────────────

  const panelFiltro = (
    <>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Revisión de Corte</Typography>
        {corte?.enviado && <Chip label="ENVIADO" color="success" size="small" />}
        {corte && !corte.enviado && <Chip label="BORRADOR" color="warning" size="small" />}
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={moduloId}
              onChange={(e) => setModuloId(e.target.value)}
              label="Módulo"
              displayEmpty
            >
              <MenuItem value="" disabled>Seleccionar módulo</MenuItem>
              {modulos
                .filter((m) => !MODULOS_OCULTOS.includes(m.nombre))
                .sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' }))
                .map((m) => (
                  <MenuItem key={m.id} value={String(m.id)}>{m.nombre}</MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            type="date" size="small" label="Fecha" value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained" size="small"
            onClick={buscar}
            disabled={!moduloId || !fecha || loading}
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea6c0a' }, fontWeight: 700, whiteSpace: 'nowrap', minHeight: 40 }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Buscar'}
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const sinCorteAlert = (
    <Alert severity="info" sx={{ mb: 2 }}>
      Sin corte registrado para <strong>{moduloNombre}</strong> el <strong>{fecha}</strong>.
    </Alert>
  );

  const panelDetalle = corte ? (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 13 }}>
        {moduloNombre} — {corte.fecha}
      </Typography>

      {/* Chips */}
      <Paper sx={{ mb: 1.5, overflow: 'hidden' }}>
        {sectionHeader(`Chips del día (${corte.chips_count ?? 0})`)}
        {!corte.chips_por_tipo || Object.keys(corte.chips_por_tipo).length === 0 ? (
          <Box px={2} py={1.5}>
            <Typography variant="body2" color="text.secondary" fontSize={13}>Sin chips para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Tipo</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(corte.chips_por_tipo as Record<string, number>).map(([tipo, cantidad]) => (
                  <tr key={tipo}>
                    <td style={tdStyle}>{tipo}</td>
                    <td style={tdR}>{cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
            {sectionFooter('Total chips', corte.chips_count)}
          </>
        )}
      </Paper>

      {/* Teléfonos */}
      <Paper sx={{ mb: 1.5, overflow: 'hidden' }}>
        {sectionHeader(`Teléfonos del día (${ventasTel.length})`)}
        {ventasTel.length === 0 ? (
          <Box px={2} py={1.5}>
            <Typography variant="body2" color="text.secondary" fontSize={13}>Sin teléfonos para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Modelo</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Método</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {ventasTel.map((v) => (
                  <tr key={v.id}>
                    <td style={{ ...tdStyle, maxWidth: 220 }}>{v.producto}</td>
                    <td style={tdStyle}>{capitalize(v.tipo_venta || '')}</td>
                    <td style={tdStyle}>{capitalize(v.metodo_pago || '')}</td>
                    <td style={tdR}>${getTotal(v).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
            {sectionFooter('Total teléfonos', `$${subtotalTel.toFixed(2)}`)}
          </>
        )}
      </Paper>

      {/* Accesorios */}
      <Paper sx={{ mb: 1.5, overflow: 'hidden' }}>
        {sectionHeader(`Accesorios del día (${ventasAcc.length})`)}
        {ventasAcc.length === 0 ? (
          <Box px={2} py={1.5}>
            <Typography variant="body2" color="text.secondary" fontSize={13}>Sin accesorios para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Descripción</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Cant.</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Precio Prom.</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(
                  ventasAcc.reduce(
                    (acc: Record<string, { producto: string; precio: number; cantidad: number; total: number }>, v: any) => {
                      const key = `${v.producto}||${getTotal(v)}`;
                      if (!acc[key]) acc[key] = { producto: v.producto, precio: getTotal(v), cantidad: 0, total: 0 };
                      acc[key].cantidad += v.cantidad || 1;
                      acc[key].total += getTotal(v);
                      return acc;
                    },
                    {}
                  )
                ).map((g) => (
                  <tr key={g.producto + g.precio}>
                    <td style={{ ...tdStyle, maxWidth: 260 }}>{g.producto}</td>
                    <td style={tdR}>{g.cantidad}</td>
                    <td style={tdR}>${(g.total / g.cantidad).toFixed(2)}</td>
                    <td style={tdR}>${g.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
            {sectionFooter('Total accesorios', `$${subtotalAcc.toFixed(2)}`)}
          </>
        )}
      </Paper>

      {/* Montos Adicionales */}
      <Paper sx={{ mb: 1.5, overflow: 'hidden', borderRadius: 2 }}>
        {sectionHeader('MONTOS ADICIONALES', <MonetizationOnIcon sx={{ color: '#FF6600', fontSize: 16 }} />)}
        <Box sx={{ p: 2 }}>
          {[
            { label: 'Recargas Telcel', val: rec   },
            { label: 'Recargas YOVOY',  val: trans  },
            { label: 'Centro de Pagos', val: otr   },
          ].map(({ label, val }) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid #f0f0f0' }}>
              <Typography fontSize={13} color="#555">{label}</Typography>
              <Typography fontSize={13} fontWeight={600} color="#222">${val.toFixed(2)}</Typography>
            </Box>
          ))}
          <Box sx={{ border: '1px solid #e5e5e5', borderRadius: 1.5, p: 1.5, mt: 1, mb: 1, bgcolor: '#fafafa' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.5, mb: 0.5 }}>
              RECARGAS MAYOREO
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
              <Typography fontSize={13} color="#555">Cantidad</Typography>
              <Typography fontSize={13} fontWeight={600} color="#333">${may.toFixed(2)}</Typography>
            </Box>
            {corte.adicional_mayoreo_para && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                <Typography fontSize={13} color="#555">Para quién</Typography>
                <Typography fontSize={13} fontWeight={600} color="#222">{corte.adicional_mayoreo_para}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 1.5, px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={600} color="#333" fontSize={13}>Total Montos Adicionales</Typography>
            <Typography fontWeight={800} color="#1a1a2e" fontSize={20}>${totalAdicional.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Salida de Efectivo */}
      <Paper sx={{ mb: 1.5, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ px: 2, py: 1.2, bgcolor: '#b71c1c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDownIcon sx={{ color: 'white', fontSize: 16 }} />
          <Typography fontWeight={700} fontSize={13} color="white" letterSpacing={0.3}>
            SALIDA DE EFECTIVO
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid #f0f0f0' }}>
            <Typography fontSize={13} color="#555">Monto de salida</Typography>
            <Typography fontSize={13} fontWeight={600} color={sal > 0 ? '#b71c1c' : '#222'}>
              {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
            </Typography>
          </Box>
          {corte.nota_salida && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
              <Typography fontSize={13} color="#555">Nota</Typography>
              <Typography fontSize={13} color="#333">{corte.nota_salida}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Totales Finales */}
      <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ px: 2, py: 1.2, bgcolor: '#1a2744', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: '#FF6600', fontSize: 16 }} />
          <Typography fontWeight={700} fontSize={13} color="white" letterSpacing={0.3}>
            TOTALES FINALES
          </Typography>
        </Box>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: '#555', border: 'none', py: 0.8, pl: 2, width: '44%', letterSpacing: 0.5 }}>CONCEPTO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: '#555', border: 'none', py: 0.8, width: '28%', letterSpacing: 0.5 }}>EFECTIVO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: '#555', border: 'none', py: 0.8, pr: 2, width: '28%', letterSpacing: 0.5 }}>TARJETA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { label: 'Accesorios', ef: ef_acc, ta: ta_acc },
              { label: 'Teléfonos',  ef: ef_tel, ta: ta_tel },
            ].map(({ label, ef, ta }) => (
              <TableRow key={label} sx={{ bgcolor: label === 'Teléfonos' ? '#fafafa' : 'white' }}>
                <TableCell sx={{ fontSize: 13, border: 'none', py: 0.8, pl: 2, color: '#333' }}>{label}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, color: '#222' }}>${ef.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, pr: 2, color: '#222' }}>${ta.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'white' }}>
              <TableCell sx={{ fontSize: 13, border: 'none', py: 0.8, pl: 2, color: '#333' }}>Recargas</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, color: '#222' }}>${totalAdicional.toFixed(2)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, pr: 2, color: '#aaa' }}>—</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontSize: 13, border: 'none', py: 0.8, pl: 2, color: '#333' }}>Salidas</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, color: sal > 0 ? '#d32f2f' : '#222' }}>
                {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 0.8, pr: 2, color: '#aaa' }}>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} sx={{ border: 'none', p: 0, borderTop: '2px solid #eee' }} />
            </TableRow>
            <TableRow sx={{ bgcolor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, border: 'none', py: 1.2, pl: 2, color: '#2e7d32' }}>TOTAL EFECTIVO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 18, border: 'none', py: 1.2, color: '#2e7d32' }}>${total_efectivo_final.toFixed(2)}</TableCell>
              <TableCell sx={{ border: 'none', bgcolor: '#e8f5e9' }} />
            </TableRow>
            <TableRow sx={{ bgcolor: '#eff6ff' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, border: 'none', py: 1.2, pl: 2, color: '#1d4ed8' }}>TOTAL TARJETA</TableCell>
              <TableCell sx={{ border: 'none', bgcolor: '#eff6ff' }} />
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 18, border: 'none', py: 1.2, pr: 2, color: '#1d4ed8' }}>${total_tarjeta.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Botón MARCAR REVISADO */}
      {corte.revisado_direccion ? (
        <Alert severity="success" sx={{ mb: 2, fontSize: 14, borderRadius: 2 }}>
          ✅ Corte revisado por <strong>{corte.revisado_por}</strong> el{' '}
          {new Date(corte.revisado_at).toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </Alert>
      ) : (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => setDialogConfirm(true)}
          sx={{
            bgcolor: '#FF6600',
            '&:hover': { bgcolor: '#ea5c00' },
            fontWeight: 700,
            fontSize: { xs: 14, sm: 16 },
            minHeight: 52,
            mb: 2,
            borderRadius: 2,
          }}
        >
          ✅ MARCAR CORTE COMO REVISADO
        </Button>
      )}
    </>
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>

      {/* ── Grid: 2 columnas en desktop, apilado en mobile ────────────── */}
      <Box
        sx={{
          display: { xs: 'block', lg: 'grid' },
          gridTemplateColumns: { lg: '40% 60%' },
          gap: '20px',
          alignItems: 'start',
        }}
      >

        {/* ══ COLUMNA IZQUIERDA — Cortes pendientes ══════════════════════ */}
        <Box
          sx={{
            maxHeight: { lg: 'calc(100vh - 120px)' },
            overflowY: { lg: 'auto' },
            mb: { xs: 3, lg: 0 },
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            📋 Cortes pendientes de revisar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 13 }}>
            {loadingPendientes
              ? 'Cargando…'
              : `${pendientes.length} corte${pendientes.length !== 1 ? 's' : ''} esperando tu revisión`}
          </Typography>

          {loadingPendientes ? (
            <Box textAlign="center" py={3}>
              <CircularProgress sx={{ color: '#FF6600' }} size={32} />
            </Box>
          ) : pendientes.length === 0 ? (
            <Alert severity="success" sx={{ mb: 2, fontSize: 14 }}>
              ✅ Todos los cortes están revisados al día
            </Alert>
          ) : (
            <Box
              sx={{
                overflowY: 'auto',
                maxHeight: { xs: 600, lg: '100%' },
                border: '1px solid #e5e5e5',
                borderRadius: 2,
              }}
            >
              {pendientes.map((c, idx) => (
                <Box
                  key={c.id}
                  onClick={() => abrirCortePendiente(c)}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    px: 2,
                    py: '8px',
                    bgcolor: '#ffffff',
                    borderBottom: idx < pendientes.length - 1 ? '1px solid #e5e5e5' : 'none',
                    cursor: 'pointer',
                    gap: 0.5,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  {/* Módulo + fecha */}
                  <Box sx={{ flex: { sm: '0 0 38%' }, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} color="#1a1a2e" lineHeight={1.3}>
                      {c.modulo_nombre}
                    </Typography>
                    <Typography fontSize={11} color="#888">
                      {fmtFecha(c.fecha)}
                    </Typography>
                  </Box>

                  {/* Monto + desglose */}
                  <Box sx={{ flex: { sm: '0 0 37%' }, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={16} color="#333" lineHeight={1.2}>
                      {fmt$(c.total_general)}
                    </Typography>
                    <Typography fontSize={11} color="#888" noWrap>
                      Ef: {fmt$(c.total_efectivo)} · Ta: {fmt$(c.total_tarjeta)}
                    </Typography>
                  </Box>

                  {/* Botón REVISAR */}
                  <Box
                    sx={{
                      flex: { sm: '0 0 25%' },
                      display: 'flex',
                      justifyContent: { xs: 'stretch', sm: 'flex-end' },
                      mt: { xs: 0.5, sm: 0 },
                    }}
                  >
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={(e) => { e.stopPropagation(); abrirCortePendiente(c); }}
                      sx={{
                        bgcolor: '#FF6600',
                        '&:hover': { bgcolor: '#ea5c00' },
                        fontWeight: 700,
                        fontSize: 12,
                        py: '6px',
                        px: '12px',
                        minHeight: { xs: 36, sm: 30 },
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: 1.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      REVISAR
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ══ COLUMNA DERECHA — Panel dinámico ═══════════════════════════ */}
        <Box
          sx={{
            maxHeight: { lg: 'calc(100vh - 120px)' },
            overflowY: { lg: 'auto' },
          }}
        >

          {/* -- MOBILE (xs a lg): filtro siempre visible, detalle debajo -- */}
          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
            <Divider sx={{ mb: 3 }} />
            {panelFiltro}
            {sinCorte && !loading && sinCorteAlert}
            {panelDetalle}
          </Box>

          {/* -- DESKTOP (lg+): ESTADO A (filtro) o ESTADO B (detalle) -- */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {!mostrarDetalle ? (
              /* ESTADO A — Filtro */
              <>
                {panelFiltro}
                {sinCorte && !loading && sinCorteAlert}
              </>
            ) : (
              /* ESTADO B — Detalle */
              <>
                <Button
                  startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                  onClick={volverAlFiltro}
                  size="small"
                  sx={{
                    mb: 2,
                    color: '#666',
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f5f5f5', color: '#333' },
                  }}
                >
                  Volver al filtro
                </Button>

                {loading && (
                  <Box textAlign="center" py={6}>
                    <CircularProgress sx={{ color: '#FF6600' }} size={32} />
                  </Box>
                )}

                {sinCorte && !loading && sinCorteAlert}

                {panelDetalle}
              </>
            )}
          </Box>

        </Box>
      </Box>

      {/* ── Confirmation Dialog ───────────────────────────────────── */}
      <Dialog open={dialogConfirm} onClose={() => !marcando && setDialogConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Confirmar revisión?</DialogTitle>
        <DialogContent>
          <Typography>¿Confirmas que ya revisaste este corte?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogConfirm(false)}
            disabled={marcando}
            variant="outlined"
            sx={{ minHeight: 44, flex: 1 }}
          >
            NO
          </Button>
          <Button
            variant="contained"
            onClick={marcarRevisado}
            disabled={marcando}
            sx={{ bgcolor: '#FF6600', '&:hover': { bgcolor: '#ea5c00' }, minHeight: 44, flex: 1, fontWeight: 700 }}
          >
            {marcando ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'SÍ, CONFIRMAR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────── */}
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert severity={snack?.sev} variant="filled" onClose={() => setSnack(null)} sx={{ width: '100%' }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DireccionPage;
