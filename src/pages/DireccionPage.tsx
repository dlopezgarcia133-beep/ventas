import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import SimCardIcon from '@mui/icons-material/SimCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import axios from 'axios';

const HOY = new Date().toLocaleDateString('en-CA');

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

const ValorFila = ({ label, valor, color }: { label: string; valor: string | number; color?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, px: 1, borderBottom: '1px solid #f0f0f0' }}>
    <Typography fontSize={13} color="#555">{label}</Typography>
    <Typography fontSize={13} fontWeight={600} color={color || '#222'}>{valor}</Typography>
  </Box>
);

const DireccionPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const API = process.env.REACT_APP_API_URL;

  const [modulos, setModulos] = useState<any[]>([]);
  const [moduloId, setModuloId] = useState<number | ''>('');
  const [fecha, setFecha] = useState(HOY);
  const [corte, setCorte] = useState<any>(null);
  const [sinCorte, setSinCorte] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/registro/modulos`, config)
      .then((r) => setModulos(r.data))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = async () => {
    if (!moduloId || !fecha) return;
    setLoading(true);
    setSinCorte(false);
    setCorte(null);
    try {
      const res = await axios.get(`${API}/direccion/cortes`, {
        ...config,
        params: { modulo_id: moduloId, fecha },
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

  // ── computed from corte ──────────────────────────────────────────────────────
  const ef_acc = corte?.accesorios_efectivo ?? 0;
  const ta_acc = corte?.accesorios_tarjeta ?? 0;
  const ef_tel = corte?.telefonos_efectivo ?? 0;
  const ta_tel = corte?.telefonos_tarjeta ?? 0;
  const rec = corte?.adicional_recargas ?? 0;
  const trans = corte?.adicional_transporte ?? 0;
  const otr = corte?.adicional_otros ?? 0;
  const may = corte?.adicional_mayoreo ?? 0;
  const totalAdicional = rec + trans + otr + may;
  const sal = corte?.salida_efectivo ?? 0;
  const total_efectivo_final = ef_acc + ef_tel + totalAdicional - sal;
  const total_tarjeta = ta_acc + ta_tel;

  const moduloNombre = modulos.find((m) => m.id === moduloId)?.nombre || '';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720, mx: 'auto' }}>

      {/* ── Título ──────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <ReceiptLongIcon sx={{ color: '#f97316', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700} color="white">
          Revisión de Cortes
        </Typography>
      </Stack>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={moduloId}
              onChange={(e) => setModuloId(e.target.value as number)}
              label="Módulo"
            >
              {modulos.map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Fecha"
            size="small"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={buscar}
            disabled={!moduloId || !fecha || loading}
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea6c0a' }, fontWeight: 700, whiteSpace: 'nowrap', px: 3 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'BUSCAR'}
          </Button>
        </Stack>
      </Paper>

      {/* ── Estado vacío ──────────────────────────────────────────────────── */}
      {sinCorte && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Sin corte registrado para esta fecha en el módulo seleccionado.
        </Alert>
      )}

      {/* ── Resultados ────────────────────────────────────────────────────── */}
      {corte && (
        <>
          {/* Encabezado del corte */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Typography fontWeight={700} fontSize={15} color="#ccc">
              {moduloNombre} — {corte.fecha}
            </Typography>
            {corte.enviado && <Chip label="ENVIADO" color="success" size="small" />}
            {!corte.enviado && <Chip label="BORRADOR" color="warning" size="small" />}
          </Stack>

          {/* ── Chips ─────────────────────────────────────────────────────── */}
          <Paper sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SimCardIcon sx={{ color: '#15803d', fontSize: 18 }} />
              <Typography fontWeight={700} fontSize={14} color="#15803d">
                Chips del día ({corte.chips_count ?? 0})
              </Typography>
            </Box>
            {(!corte.chips_por_tipo || Object.keys(corte.chips_por_tipo).length === 0) ? (
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

          {/* ── Teléfonos ─────────────────────────────────────────────────── */}
          <Paper sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneAndroidIcon sx={{ color: '#1d4ed8', fontSize: 18 }} />
              <Typography fontWeight={700} fontSize={14} color="#1d4ed8">Teléfonos del día</Typography>
            </Box>
            <Box sx={{ px: 1 }}>
              <ValorFila label="Efectivo" valor={`$${(ef_tel).toFixed(2)}`} color="#1d4ed8" />
              <ValorFila label="Tarjeta" valor={`$${(ta_tel).toFixed(2)}`} color="#1d4ed8" />
            </Box>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#eff6ff', borderTop: '2px solid #bfdbfe', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">Total teléfonos</Typography>
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">${(corte.telefonos_total ?? 0).toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* ── Accesorios ────────────────────────────────────────────────── */}
          <Paper sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontWeight={700} fontSize={14} color="#c2410c">Accesorios del día</Typography>
            </Box>
            <Box sx={{ px: 1 }}>
              <ValorFila label="Efectivo" valor={`$${(ef_acc).toFixed(2)}`} color="#c2410c" />
              <ValorFila label="Tarjeta" valor={`$${(ta_acc).toFixed(2)}`} color="#c2410c" />
            </Box>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff7ed', borderTop: '2px solid #fed7aa', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} color="#c2410c">Total accesorios</Typography>
              <Typography variant="body2" fontWeight={700} color="#c2410c">${(corte.accesorios_total ?? 0).toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* ── Montos Adicionales ────────────────────────────────────────── */}
          <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#FF6600', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOnIcon sx={{ color: 'white', fontSize: 20 }} />
              <Typography fontWeight={700} fontSize={15} color="white" letterSpacing={0.3}>
                MONTOS ADICIONALES
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 0.5 }}>
              <ValorFila label="Recargas Telcel" valor={`$${rec.toFixed(2)}`} />
              <ValorFila label="Recargas YOVOY" valor={`$${trans.toFixed(2)}`} />
              <ValorFila label="Centro de Pagos" valor={`$${otr.toFixed(2)}`} />
              <Box sx={{ border: '1.5px solid #FFD1A9', borderRadius: 2, p: 1, mx: 1, my: 1, bgcolor: '#fff8f3' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FF6600', letterSpacing: 0.5, mb: 0.5 }}>
                  RECARGAS MAYOREO
                </Typography>
                <ValorFila label="Cantidad" valor={`$${may.toFixed(2)}`} color="#FF6600" />
                {corte.adicional_mayoreo_para && (
                  <ValorFila label="Para quién" valor={corte.adicional_mayoreo_para} />
                )}
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #FFD1A9', mx: 2, mb: 2, borderRadius: 2, px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={600} color="#cc4400" fontSize={13}>Total Montos Adicionales</Typography>
              <Typography fontWeight={800} color="#FF6600" fontSize={22}>${totalAdicional.toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* ── Salida de Efectivo ────────────────────────────────────────── */}
          <Paper sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#b71c1c', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDownIcon sx={{ color: 'white', fontSize: 20 }} />
              <Typography fontWeight={700} fontSize={15} color="white" letterSpacing={0.3}>
                SALIDA DE EFECTIVO
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 0.5 }}>
              <ValorFila
                label="Monto de salida"
                valor={`$${sal.toFixed(2)}`}
                color={sal > 0 ? '#b71c1c' : '#222'}
              />
              {corte.nota_salida && (
                <ValorFila label="Nota" valor={corte.nota_salida} />
              )}
            </Box>
          </Paper>

          {/* ── Totales Finales ───────────────────────────────────────────── */}
          <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}>
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
                <TableRow sx={{ bgcolor: 'white' }}>
                  <TableCell sx={{ fontSize: 13, border: 'none', py: 1, pl: 2, color: '#333' }}>Accesorios</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, color: '#222' }}>${ef_acc.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, pr: 2, color: '#222' }}>${ta_acc.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontSize: 13, border: 'none', py: 1, pl: 2, color: '#333' }}>Teléfonos</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, color: '#222' }}>${ef_tel.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, border: 'none', py: 1, pr: 2, color: '#222' }}>${ta_tel.toFixed(2)}</TableCell>
                </TableRow>
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
        </>
      )}
    </Box>
  );
};

export default DireccionPage;
