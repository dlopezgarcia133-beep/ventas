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
  padding: 8,
  borderBottom: '1px solid #e2e8f0',
  color: '#f97316',
  fontWeight: 700,
  background: '#f8fafc',
  textAlign: 'left',
};
const tdStyle: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #e2e8f0' };
const tdR: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

const getTotal = (v: any) => v.total ?? (v.precio_unitario || 0) * (v.cantidad || 1);
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
const fmt$ = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

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
  const rec  = corte?.adicional_recargas   ?? 0;
  const trans = corte?.adicional_transporte ?? 0;
  const otr  = corte?.adicional_otros      ?? 0;
  const may  = corte?.adicional_mayoreo    ?? 0;
  const totalAdicional = rec + trans + otr + may;
  const sal  = corte?.salida_efectivo      ?? 0;
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
        {corte?.enviado && <Chip label="ENVIADO" color="success" />}
        {corte && !corte.enviado && <Chip label="BORRADOR" color="warning" />}
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {moduloNombre} — {corte.fecha}
      </Typography>

      {/* Chips */}
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
          <Typography fontWeight={700} fontSize={14} color="#15803d">
            Chips del día ({corte.chips_count ?? 0})
          </Typography>
        </Box>
        {!corte.chips_por_tipo || Object.keys(corte.chips_por_tipo).length === 0 ? (
          <Box px={2} py={2}>
            <Typography variant="body2" color="text.secondary">Sin chips para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#f0fdf4', borderTop: '2px solid #bbf7d0', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#15803d">Total chips</Typography>
              <Typography variant="body2" fontWeight={700} color="#15803d">{corte.chips_count}</Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Teléfonos */}
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
          <Typography fontWeight={700} fontSize={14} color="#1d4ed8">
            Teléfonos del día ({ventasTel.length})
          </Typography>
        </Box>
        {ventasTel.length === 0 ? (
          <Box px={2} py={2}>
            <Typography variant="body2" color="text.secondary">Sin teléfonos para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#eff6ff', borderTop: '2px solid #bfdbfe', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">Total teléfonos</Typography>
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">${subtotalTel.toFixed(2)}</Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Accesorios */}
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
          <Typography fontWeight={700} fontSize={14} color="#c2410c">
            Accesorios del día ({ventasAcc.length})
          </Typography>
        </Box>
        {ventasAcc.length === 0 ? (
          <Box px={2} py={2}>
            <Typography variant="body2" color="text.secondary">Sin accesorios para esta fecha</Typography>
          </Box>
        ) : (
          <>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff7ed', borderTop: '2px solid #fed7aa', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#c2410c">Total accesorios</Typography>
              <Typography variant="body2" fontWeight={700} color="#c2410c">${subtotalAcc.toFixed(2)}</Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Montos Adicionales */}
      <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2, bgcolor: 'white' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#FF6600', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOnIcon sx={{ color: 'white', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize={15} color="white" letterSpacing={0.3}>
            MONTOS ADICIONALES
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {[
            { label: 'Recargas Telcel', val: rec   },
            { label: 'Recargas YOVOY',  val: trans  },
            { label: 'Centro de Pagos', val: otr   },
          ].map(({ label, val }) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #f0f0f0' }}>
              <Typography fontSize={13} color="#555">{label}</Typography>
              <Typography fontSize={13} fontWeight={600} color="#222">${val.toFixed(2)}</Typography>
            </Box>
          ))}
          <Box sx={{ border: '1.5px solid #FFD1A9', borderRadius: 2, p: 1.5, mt: 1, mb: 1, bgcolor: '#fff8f3' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FF6600', letterSpacing: 0.5, mb: 0.5 }}>
              RECARGAS MAYOREO
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography fontSize={13} color="#555">Cantidad</Typography>
              <Typography fontSize={13} fontWeight={600} color="#FF6600">${may.toFixed(2)}</Typography>
            </Box>
            {corte.adicional_mayoreo_para && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography fontSize={13} color="#555">Para quién</Typography>
                <Typography fontSize={13} fontWeight={600} color="#222">{corte.adicional_mayoreo_para}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #FFD1A9', borderRadius: 2, px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={600} color="#cc4400" fontSize={13}>Total Montos Adicionales</Typography>
            <Typography fontWeight={800} color="#FF6600" fontSize={22}>${totalAdicional.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Salida de Efectivo */}
      <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2, bgcolor: 'white' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#b71c1c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDownIcon sx={{ color: 'white', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize={15} color="white" letterSpacing={0.3}>
            SALIDA DE EFECTIVO
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #f0f0f0' }}>
            <Typography fontSize={13} color="#555">Monto de salida</Typography>
            <Typography fontSize={13} fontWeight={600} color={sal > 0 ? '#b71c1c' : '#222'}>
              {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
            </Typography>
          </Box>
          {corte.nota_salida && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
              <Typography fontSize={13} color="#555">Nota</Typography>
              <Typography fontSize={13} color="#333">{corte.nota_salida}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Totales Finales */}
      <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 2, bgcolor: 'white' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#1a2744', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: '#FF6600', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize={15} color="white" letterSpacing={0.3}>
            TOTALES FINALES
          </Typography>
        </Box>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: '#555', border: 'none', py: 1, pl: 2, width: '44%', letterSpacing: 0.5 }}>CONCEPTO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: '#FF6600', border: 'none', py: 1, width: '28%', letterSpacing: 0.5 }}>EFECTIVO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: '#FF6600', border: 'none', py: 1, pr: 2, width: '28%', letterSpacing: 0.5 }}>TARJETA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { label: 'Accesorios', ef: ef_acc, ta: ta_acc },
              { label: 'Teléfonos',  ef: ef_tel, ta: ta_tel },
            ].map(({ label, ef, ta }) => (
              <TableRow key={label} sx={{ bgcolor: label === 'Teléfonos' ? '#fafafa' : 'white' }}>
                <TableCell sx={{ fontSize: 13, border: 'none', py: 1, pl: 2, color: '#333' }}>{label}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, color: '#222' }}>${ef.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, pr: 2, color: '#222' }}>${ta.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'white' }}>
              <TableCell sx={{ fontSize: 13, border: 'none', py: 1, pl: 2, color: '#333' }}>Recargas</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, color: '#222' }}>${totalAdicional.toFixed(2)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, pr: 2, color: '#aaa' }}>—</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontSize: 13, border: 'none', py: 1, pl: 2, color: '#333' }}>Salidas</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, color: sal > 0 ? '#d32f2f' : '#222' }}>
                {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, pr: 2, color: '#aaa' }}>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} sx={{ border: 'none', p: 0, borderTop: '2px solid #eee' }} />
            </TableRow>
            <TableRow sx={{ bgcolor: '#e8f5e9' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, border: 'none', py: 1.5, pl: 2, color: '#2e7d32' }}>TOTAL EFECTIVO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 20, border: 'none', py: 1.5, color: '#2e7d32' }}>${total_efectivo_final.toFixed(2)}</TableCell>
              <TableCell sx={{ border: 'none', bgcolor: '#e8f5e9' }} />
            </TableRow>
            <TableRow sx={{ bgcolor: '#fff3e0' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, border: 'none', py: 1.5, pl: 2, color: '#FF6600' }}>TOTAL TARJETA</TableCell>
              <TableCell sx={{ border: 'none', bgcolor: '#fff3e0' }} />
              <TableCell align="right" sx={{ fontWeight: 800, fontSize: 20, border: 'none', py: 1.5, pr: 2, color: '#FF6600' }}>${total_tarjeta.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Botón MARCAR REVISADO */}
      {corte.revisado_direccion ? (
        <Alert severity="success" sx={{ mb: 3, fontSize: 15, borderRadius: 2 }}>
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
            fontSize: { xs: 15, sm: 17 },
            minHeight: 56,
            mb: 3,
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {loadingPendientes
              ? 'Cargando…'
              : `${pendientes.length} corte${pendientes.length !== 1 ? 's' : ''} esperando tu revisión`}
          </Typography>

          {loadingPendientes ? (
            <Box textAlign="center" py={3}>
              <CircularProgress sx={{ color: '#FF6600' }} />
            </Box>
          ) : pendientes.length === 0 ? (
            <Alert severity="success" sx={{ mb: 3, fontSize: 15 }}>
              ✅ Todos los cortes están revisados al día
            </Alert>
          ) : (
            <Box
              sx={{
                overflowY: 'auto',
                maxHeight: { xs: 600, lg: '100%' },
                border: '1px solid #e2e8f0',
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
                    minHeight: 56,
                    px: 2,
                    py: { xs: 1.5, sm: 1 },
                    bgcolor: '#FFF8F0',
                    borderBottom: idx < pendientes.length - 1 ? '1px solid #e2e8f0' : 'none',
                    cursor: 'pointer',
                    gap: { xs: 0.5, sm: 1 },
                    '&:hover': { bgcolor: '#FFF3E0' },
                  }}
                >
                  <Box sx={{ flex: { sm: '0 0 40%' }, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={{ xs: 16, sm: 15 }} color="#c2410c">
                      {c.modulo_nombre}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {fmtFecha(c.fecha)}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: { sm: '0 0 35%' }, minWidth: 0 }}>
                    <Typography fontWeight={800} fontSize={{ xs: 20, sm: 17 }} color="#FF6600" lineHeight={1.2}>
                      {fmt$(c.total_general)}
                    </Typography>
                    <Typography fontSize={11} color="#888" noWrap>
                      Ef: {fmt$(c.total_efectivo)} · Ta: {fmt$(c.total_tarjeta)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: { sm: '0 0 25%' },
                      display: 'flex',
                      justifyContent: { xs: 'stretch', sm: 'flex-end' },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={(e) => { e.stopPropagation(); abrirCortePendiente(c); }}
                      sx={{
                        bgcolor: '#FF6600',
                        '&:hover': { bgcolor: '#ea5c00' },
                        fontWeight: 700,
                        fontSize: 13,
                        minHeight: { xs: 44, sm: 36 },
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
                  startIcon={<ArrowBackIcon />}
                  onClick={volverAlFiltro}
                  sx={{
                    mb: 2,
                    color: '#FF6600',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#fff3e0' },
                  }}
                >
                  Volver al filtro
                </Button>

                {loading && (
                  <Box textAlign="center" py={6}>
                    <CircularProgress sx={{ color: '#FF6600' }} />
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
