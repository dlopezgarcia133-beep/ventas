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
  padding: '2px 6px',
  borderBottom: '1px solid #e5e5e5',
  color: '#444',
  fontWeight: 700,
  background: '#f5f5f5',
  textAlign: 'left',
  fontSize: 10,
  lineHeight: 1.2,
};
const tdStyle: React.CSSProperties = {
  padding: '3px 6px',
  borderBottom: '1px solid #e5e5e5',
  fontSize: 11,
  lineHeight: 1.2,
};
const tdR: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

const getTotal = (v: any) => v.total ?? (v.precio_unitario || 0) * (v.cantidad || 1);
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');
const fmt$ = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Section header / footer helpers ─────────────────────────────────────────
type SectionConfig = { bg: string; color: string; border: string };

const SECTION_CHIPS:    SectionConfig = { bg: '#E8F5E9', color: '#2E7D32', border: '#C8E6C9' };
const SECTION_TELS:     SectionConfig = { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB' };
const SECTION_ACC:      SectionConfig = { bg: '#FFF3E0', color: '#E65100', border: '#FFE0B2' };
const SECTION_MONTOS:   SectionConfig = { bg: '#FFF3E0', color: '#FF6B00', border: '#FFD7A0' };
const SECTION_SALIDA:   SectionConfig = { bg: '#c62828', color: '#ffffff', border: '#c62828' };
const SECTION_TOTALES:  SectionConfig = { bg: '#1a2744', color: '#ffffff', border: '#1a2744' };

const sectionHeader = (label: string, cfg: SectionConfig, icon?: React.ReactNode) => (
  <Box sx={{
    px: '12px', py: '4px',
    bgcolor: cfg.bg,
    borderBottom: `1px solid ${cfg.border}`,
    display: 'flex', alignItems: 'center', gap: 0.75,
    minHeight: 28,
  }}>
    {icon}
    <Typography fontWeight={700} fontSize={12} color={cfg.color} letterSpacing={0.2} lineHeight={1.2}>
      {label}
    </Typography>
  </Box>
);

const sectionFooter = (label: string, value: React.ReactNode, cfg: SectionConfig) => (
  <Box sx={{
    px: '12px', py: '3px',
    bgcolor: cfg.bg,
    borderTop: `1px solid ${cfg.border}`,
    display: 'flex', justifyContent: 'space-between',
  }}>
    <Typography fontSize={11} fontWeight={700} color={cfg.color}>{label}</Typography>
    <Typography fontSize={11} fontWeight={700} color={cfg.color}>{value}</Typography>
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

  // ── Panel B: filtro ───────────────────────────────────────────────────────
  const panelFiltro = (
    <>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700} fontSize={16}>Revisión de Corte</Typography>
        {corte?.enviado && <Chip label="ENVIADO" color="success" size="small" />}
        {corte && !corte.enviado && <Chip label="BORRADOR" color="warning" size="small" />}
      </Stack>

      <Paper sx={{ p: 1.5, mb: 1.5 }}>
        <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
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
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea6c0a' }, fontWeight: 700, whiteSpace: 'nowrap', minHeight: 38 }}
          >
            {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Buscar'}
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const sinCorteAlert = (
    <Alert severity="info" sx={{ mb: 1.5, py: 0.5, fontSize: 13 }}>
      Sin corte registrado para <strong>{moduloNombre}</strong> el <strong>{fecha}</strong>.
    </Alert>
  );

  // ── Panel C: detalle ──────────────────────────────────────────────────────
  // Tarjetas individuales — se reorganizan en grid 2 columnas (lg+).

  const cardChips = (
    <Paper sx={{ overflow: 'hidden' }}>
      {sectionHeader(`Chips del día (${corte?.chips_count ?? 0})`, SECTION_CHIPS)}
      {!corte?.chips_por_tipo || Object.keys(corte.chips_por_tipo).length === 0 ? (
        <Box px="12px" py="6px">
          <Typography fontSize={11} color="text.secondary">Sin chips para esta fecha</Typography>
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
          {sectionFooter('Total chips', corte.chips_count, SECTION_CHIPS)}
        </>
      )}
    </Paper>
  );

  const cardTelefonos = (
    <Paper sx={{ overflow: 'hidden' }}>
      {sectionHeader(`Teléfonos del día (${ventasTel.length})`, SECTION_TELS)}
      {ventasTel.length === 0 ? (
        <Box px="12px" py="6px">
          <Typography fontSize={11} color="text.secondary">Sin teléfonos para esta fecha</Typography>
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
                  <td style={{ ...tdStyle, maxWidth: 200 }}>{v.producto}</td>
                  <td style={tdStyle}>{capitalize(v.tipo_venta || '')}</td>
                  <td style={tdStyle}>{capitalize(v.metodo_pago || '')}</td>
                  <td style={tdR}>${getTotal(v).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
          {sectionFooter('Total teléfonos', `$${subtotalTel.toFixed(2)}`, SECTION_TELS)}
        </>
      )}
    </Paper>
  );

  const cardAccesorios = (
    <Paper sx={{ overflow: 'hidden' }}>
      {sectionHeader(`Accesorios del día (${ventasAcc.length})`, SECTION_ACC)}
      {ventasAcc.length === 0 ? (
        <Box px="12px" py="6px">
          <Typography fontSize={11} color="text.secondary">Sin accesorios para esta fecha</Typography>
        </Box>
      ) : (
        <>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Descripción</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Cant.</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>P. Prom.</th>
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
                  <td style={{ ...tdStyle, maxWidth: 240 }}>{g.producto}</td>
                  <td style={tdR}>{g.cantidad}</td>
                  <td style={tdR}>${(g.total / g.cantidad).toFixed(2)}</td>
                  <td style={tdR}>${g.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
          {sectionFooter('Total accesorios', `$${subtotalAcc.toFixed(2)}`, SECTION_ACC)}
        </>
      )}
    </Paper>
  );

  const cardMontos = (
    <Paper sx={{ overflow: 'hidden', borderRadius: 1 }}>
      {sectionHeader('MONTOS ADICIONALES', SECTION_MONTOS,
        <MonetizationOnIcon sx={{ color: SECTION_MONTOS.color, fontSize: 15 }} />
      )}
      <Box sx={{ px: '12px', py: '6px' }}>
        {[
          { label: 'Recargas Telcel', val: rec   },
          { label: 'Recargas YOVOY',  val: trans  },
          { label: 'Centro de Pagos', val: otr   },
        ].map(({ label, val }) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: '3px', borderBottom: '1px solid #f0f0f0' }}>
            <Typography fontSize={11} color="#555">{label}</Typography>
            <Typography fontSize={11} fontWeight={600} color="#222">${val.toFixed(2)}</Typography>
          </Box>
        ))}

        {/* Mayoreo */}
        <Box sx={{ border: '1px solid #FFD7A0', borderRadius: 1, px: '10px', py: '5px', mt: '6px', mb: '6px', bgcolor: '#fffaf5' }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#FF6B00', letterSpacing: 0.5, mb: '2px' }}>
            RECARGAS MAYOREO
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontSize={11} color="#555">Cantidad</Typography>
            <Typography fontSize={11} fontWeight={600} color="#333">${may.toFixed(2)}</Typography>
          </Box>
          {corte?.adicional_mayoreo_para && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontSize={11} color="#555">Para quién</Typography>
              <Typography fontSize={11} fontWeight={600} color="#222">{corte.adicional_mayoreo_para}</Typography>
            </Box>
          )}
        </Box>

        {/* Total adicional */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFF3E0', border: '1px solid #FFD7A0', borderRadius: 1, px: '10px', py: '5px' }}>
          <Typography fontWeight={600} color="#E65100" fontSize={11}>Total Adicional</Typography>
          <Typography fontWeight={800} color="#FF6B00" fontSize={14}>${totalAdicional.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Paper>
  );

  const cardSalida = (
    <Paper sx={{ overflow: 'hidden', borderRadius: 1 }}>
      {sectionHeader('SALIDA DE EFECTIVO', SECTION_SALIDA,
        <TrendingDownIcon sx={{ color: '#ffffff', fontSize: 15 }} />
      )}
      <Box sx={{ px: '12px', py: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '3px' }}>
          <Typography fontSize={11} color="#555">Monto de salida</Typography>
          <Typography fontSize={11} fontWeight={600} color={sal > 0 ? '#b71c1c' : '#222'}>
            {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
          </Typography>
        </Box>
        {corte?.nota_salida && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '3px' }}>
            <Typography fontSize={11} color="#555">Nota</Typography>
            <Typography fontSize={11} color="#333">{corte.nota_salida}</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

  const cardTotales = (
    <Paper sx={{ overflow: 'hidden', borderRadius: 1 }}>
      {sectionHeader('TOTALES FINALES', SECTION_TOTALES,
        <ReceiptLongIcon sx={{ color: '#FF6600', fontSize: 15 }} />
      )}
      <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 700, fontSize: 10, color: '#555', border: 'none', py: '3px', pl: '12px', width: '44%', letterSpacing: 0.4 }}>CONCEPTO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, color: '#555', border: 'none', py: '3px', width: '28%', letterSpacing: 0.4 }}>EFECTIVO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, color: '#555', border: 'none', py: '3px', pr: '12px', width: '28%', letterSpacing: 0.4 }}>TARJETA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { label: 'Accesorios', ef: ef_acc, ta: ta_acc },
            { label: 'Teléfonos',  ef: ef_tel, ta: ta_tel },
          ].map(({ label, ef, ta }) => (
            <TableRow key={label} sx={{ bgcolor: label === 'Teléfonos' ? '#fafafa' : 'white' }}>
              <TableCell sx={{ fontSize: 11, border: 'none', py: '3px', pl: '12px', color: '#333', lineHeight: 1.2 }}>{label}</TableCell>
              <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', color: '#222', lineHeight: 1.2 }}>${ef.toFixed(2)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', pr: '12px', color: '#222', lineHeight: 1.2 }}>${ta.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ bgcolor: 'white' }}>
            <TableCell sx={{ fontSize: 11, border: 'none', py: '3px', pl: '12px', color: '#333', lineHeight: 1.2 }}>Recargas</TableCell>
            <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', color: '#222', lineHeight: 1.2 }}>${totalAdicional.toFixed(2)}</TableCell>
            <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', pr: '12px', color: '#aaa', lineHeight: 1.2 }}>—</TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: '#fafafa' }}>
            <TableCell sx={{ fontSize: 11, border: 'none', py: '3px', pl: '12px', color: '#333', lineHeight: 1.2 }}>Salidas</TableCell>
            <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', color: sal > 0 ? '#d32f2f' : '#222', lineHeight: 1.2 }}>
              {sal > 0 ? `-$${sal.toFixed(2)}` : `$${sal.toFixed(2)}`}
            </TableCell>
            <TableCell align="right" sx={{ fontSize: 11, border: 'none', py: '3px', pr: '12px', color: '#aaa', lineHeight: 1.2 }}>—</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} sx={{ border: 'none', p: 0, borderTop: '1px solid #e5e5e5' }} />
          </TableRow>
          <TableRow sx={{ bgcolor: '#e8f5e9' }}>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, border: 'none', py: '5px', pl: '12px', color: '#2e7d32', lineHeight: 1.2 }}>TOTAL EFECTIVO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, fontSize: 14, border: 'none', py: '5px', color: '#2e7d32', lineHeight: 1.2 }}>${total_efectivo_final.toFixed(2)}</TableCell>
            <TableCell sx={{ border: 'none', bgcolor: '#e8f5e9' }} />
          </TableRow>
          <TableRow sx={{ bgcolor: '#eff6ff' }}>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, border: 'none', py: '5px', pl: '12px', color: '#1d4ed8', lineHeight: 1.2 }}>TOTAL TARJETA</TableCell>
            <TableCell sx={{ border: 'none', bgcolor: '#eff6ff' }} />
            <TableCell align="right" sx={{ fontWeight: 800, fontSize: 14, border: 'none', py: '5px', pr: '12px', color: '#1d4ed8', lineHeight: 1.2 }}>${total_tarjeta.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );

  const panelDetalle = corte ? (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 12 }}>
        {moduloNombre} — {corte.fecha}
      </Typography>

      {/* Grid interno: 2 columnas en desktop, apilado en mobile */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          columnGap: '12px',
          rowGap: '8px',
          alignItems: 'start',
          mb: '8px',
        }}
      >
        {/* Columna izquierda interna */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          {cardChips}
          {cardTelefonos}
          {cardAccesorios}
        </Box>

        {/* Columna derecha interna */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          {cardMontos}
          {cardSalida}
          {cardTotales}
        </Box>
      </Box>

      {/* Botón MARCAR REVISADO — full width abajo del grid */}
      {corte.revisado_direccion ? (
        <Alert severity="success" sx={{ mb: 1, py: 0.5, fontSize: 13, borderRadius: 1 }}>
          ✅ Revisado por <strong>{corte.revisado_por}</strong>{' '}
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
          onClick={() => setDialogConfirm(true)}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            fontWeight: 700,
            fontSize: 13,
            minHeight: 36,
            maxHeight: 36,
            mb: 1,
            borderRadius: 1.5,
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
          <Typography variant="h6" fontWeight={700} fontSize={16} sx={{ mb: 0.5 }}>
            📋 Cortes pendientes de revisar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 12 }}>
            {loadingPendientes
              ? 'Cargando…'
              : `${pendientes.length} corte${pendientes.length !== 1 ? 's' : ''} esperando revisión`}
          </Typography>

          {loadingPendientes ? (
            <Box textAlign="center" py={3}>
              <CircularProgress sx={{ color: '#FF6600' }} size={28} />
            </Box>
          ) : pendientes.length === 0 ? (
            <Alert severity="success" sx={{ fontSize: 13, py: 0.5 }}>
              ✅ Todos los cortes están revisados al día
            </Alert>
          ) : (
            <Box
              sx={{
                overflowY: 'auto',
                maxHeight: { xs: 400, lg: '100%' },
                border: '1px solid #e5e5e5',
                borderRadius: 1.5,
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
                    px: '12px',
                    py: '6px',
                    bgcolor: '#ffffff',
                    borderBottom: idx < pendientes.length - 1 ? '1px solid #e5e5e5' : 'none',
                    cursor: 'pointer',
                    gap: '4px',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  {/* Módulo + fecha */}
                  <Box sx={{ flex: { sm: '0 0 38%' }, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} color="#1a1a2e" lineHeight={1.3}>
                      {c.modulo_nombre}
                    </Typography>
                    <Typography fontSize={11} color="#888" lineHeight={1.2}>
                      {fmtFecha(c.fecha)}
                    </Typography>
                  </Box>

                  {/* Monto + desglose */}
                  <Box sx={{ flex: { sm: '0 0 37%' }, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={15} color="#333" lineHeight={1.2}>
                      {fmt$(c.total_general)}
                    </Typography>
                    <Typography fontSize={11} color="#888" noWrap lineHeight={1.2}>
                      Ef: {fmt$(c.total_efectivo)} · Ta: {fmt$(c.total_tarjeta)}
                    </Typography>
                  </Box>

                  {/* Botón REVISAR */}
                  <Box
                    sx={{
                      flex: { sm: '0 0 25%' },
                      display: 'flex',
                      justifyContent: { xs: 'stretch', sm: 'flex-end' },
                      mt: { xs: '4px', sm: 0 },
                    }}
                  >
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                      onClick={(e) => { e.stopPropagation(); abrirCortePendiente(c); }}
                      sx={{
                        bgcolor: '#FF6600',
                        '&:hover': { bgcolor: '#ea5c00' },
                        fontWeight: 700,
                        fontSize: 11,
                        py: '4px',
                        px: '10px',
                        minHeight: { xs: 32, sm: 26 },
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: 1,
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
            <Divider sx={{ mb: 2 }} />
            {panelFiltro}
            {sinCorte && !loading && sinCorteAlert}
            {panelDetalle}
          </Box>

          {/* -- DESKTOP (lg+): ESTADO A (filtro) o ESTADO B (detalle) -- */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {!mostrarDetalle ? (
              <>
                {panelFiltro}
                {sinCorte && !loading && sinCorteAlert}
              </>
            ) : (
              <>
                <Button
                  startIcon={<ArrowBackIcon sx={{ fontSize: 13 }} />}
                  onClick={volverAlFiltro}
                  size="small"
                  sx={{
                    mb: 1.5,
                    color: '#666',
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: 'none',
                    py: '3px',
                    '&:hover': { bgcolor: '#f5f5f5', color: '#333' },
                  }}
                >
                  Volver al filtro
                </Button>

                {loading && (
                  <Box textAlign="center" py={4}>
                    <CircularProgress sx={{ color: '#FF6600' }} size={28} />
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
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16, pb: 1 }}>¿Confirmar revisión?</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography fontSize={14}>¿Confirmas que ya revisaste este corte?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogConfirm(false)}
            disabled={marcando}
            variant="outlined"
            sx={{ minHeight: 36, flex: 1, fontSize: 13 }}
          >
            NO
          </Button>
          <Button
            variant="contained"
            onClick={marcarRevisado}
            disabled={marcando}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, minHeight: 36, flex: 1, fontWeight: 700, fontSize: 13 }}
          >
            {marcando ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'SÍ, CONFIRMAR'}
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
