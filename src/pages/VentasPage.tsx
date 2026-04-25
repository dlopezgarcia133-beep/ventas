import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography, Autocomplete, Alert, Paper,
  TableContainer, MenuItem, FormControlLabel, FormControl, FormLabel,
  RadioGroup, Radio, TablePagination, Table, TableHead, TableRow,
  TableCell, TableBody, Divider, Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { ProductoEnVenta, Usuario, Venta } from '../Types';
import { useNavigate } from 'react-router-dom';

// ─── helpers ────────────────────────────────────────────────────────────────
const HOY = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" local time

const thStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #e2e8f0',
  color: '#f97316',
  fontWeight: 700,
  background: '#f8fafc',
  textAlign: 'left',
};
const tdStyle: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #e2e8f0' };

// ────────────────────────────────────────────────────────────────────────────

const FormularioVentaMultiple = () => {
  // ── Estado general ───────────────────────────────────────────────────────
  const [productos, setProductos] = useState<string[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const ventasTelefonos = ventas.filter((v) => v.tipo_producto === 'telefono');

  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState('');
  const [telefono, settelefono] = useState('');
  const [carrito, setCarrito] = useState<ProductoEnVenta[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const [tipoVenta, setTipoVenta] = useState<'accesorio' | 'chip' | 'telefono'>('accesorio');
  const [tipoChip, setTipoChip] = useState('');
  const [numero, setNumero] = useState('');
  const [recarga, setRecarga] = useState('');

  const [telefonoMarca, setTelefonoMarca] = useState('');
  const [telefonoModelo, setTelefonoModelo] = useState('');
  const [telefonoTipo_venta, setTelefonoTipo_venta] = useState('');
  const [telefonoPrecio, setTelefonoPrecio] = useState('');
  const [Chip_casado, setChip_casado] = useState('');

  const [fecha, setFecha] = useState('');
  const [opcionesTelefonos, setOpcionesTelefonos] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [rol, setRol] = useState<Usuario['rol'] | null>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [totalAccesorios, setTotalAccesorios] = useState(0);
  const [totalTelefonos, setTotalTelefonos] = useState(0);
  const [cvip, setcvip] = useState<boolean>(false);
  const [paginaAcc, setPaginaAcc] = useState(0);
  const [paginaTel, setPaginaTel] = useState(0);
  const filasPorPagina = 10;

  // ── Estado asesor ────────────────────────────────────────────────────────
  const [comisionesData, setComisionesData] = useState<any>(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ── Fetches ──────────────────────────────────────────────────────────────
  const fetchVentas = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fecha: fecha || undefined,
          modulo_id: user?.is_admin ? moduloId || undefined : undefined,
        },
      });
      setVentas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComisionesData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/comisiones/comisiones/ciclo`,
        config,
      );
      setComisionesData(res.data);
    } catch (err) {
      console.error('Error fetching comisiones:', err);
    }
  };

  useEffect(() => {
    if (ventas.length > 0) {
      const acc = ventas.filter((v) => v.tipo_producto === 'accesorios' && !v.cancelada);
      setTotalAccesorios(acc.reduce((s, v) => s + v.precio_unitario * v.cantidad, 0));
      const tel = ventas.filter((v) => v.tipo_producto === 'telefono' && !v.cancelada);
      setTotalTelefonos(tel.reduce((s, v) => s + v.precio_unitario * v.cantidad, 0));
    }
  }, [ventas]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventario/inventario/general/productos-nombres`,
          config,
        );
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchPrecio = async () => {
      if (producto) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/inventario/inventario/general/${encodeURIComponent(producto)}`,
            config,
          );
          setPrecio(res.data.precio);
        } catch {
          setPrecio(null);
          setMensaje({ tipo: 'error', texto: 'Producto no encontrado en inventario.' });
        }
      }
    };
    fetchPrecio();
  }, [producto]);

  useEffect(() => {
    const fetchUserAndModulos = async () => {
      try {
        if (token) {
          const resUser = await axios.get<Usuario>(
            `${process.env.REACT_APP_API_URL}/auth/usuarios/me`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUser(resUser.data);
          setRol(resUser.data.rol);
          const resModulos = await axios.get(
            `${process.env.REACT_APP_API_URL}/registro/modulos`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setModulos(resModulos.data);
        }
      } catch (err) {
        console.error('Error al cargar usuario/modulos:', err);
      }
    };
    fetchUserAndModulos();
  }, []);

  // Para asesor: auto-cargar fecha de hoy y comisiones
  useEffect(() => {
    if (rol === 'asesor') {
      setFecha(HOY);
      fetchComisionesData();
    }
  }, [rol]);

  useEffect(() => {
    fetchVentas();
  }, [fecha, moduloId, user]);

  // ── Acciones ─────────────────────────────────────────────────────────────
  const agregarAlCarrito = () => {
    if (!producto || precio === null || cantidad <= 0) return;
    const nuevo: ProductoEnVenta = {
      producto, cantidad, precio_unitario: precio, id: 0, nombre: '', tipo_producto: 'accesorios',
    };
    setCarrito([...carrito, nuevo]);
    setProducto('');
    setCantidad(1);
    setPrecio(null);
  };

  const enviarCarrito = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/ventas/multiples`,
        { productos: carrito, telefono_cliente: telefono, metodo_pago: metodoPago },
        config,
      );
      setMensaje({ tipo: 'success', texto: 'Venta registrada con éxito.' });
      setCarrito([]);
      settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesData(); }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.detail || 'Error al registrar la venta' });
    }
  };

  const cancelarVenta = async (id: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta venta?')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/ventas/ventas/${id}/cancelar`, {}, config);
      alert('Venta cancelada');
      fetchVentas();
      if (rol === 'asesor') fetchComisionesData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al cancelar la venta');
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips`,
        { tipo_chip: tipoChip, numero_telefono: numero, monto_recarga: parseFloat(recarga), telefono_cliente: telefono || null, cvip },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
      );
      setMensaje({ tipo: 'success', texto: 'Venta de chip registrada correctamente' });
      setTipoChip(''); setNumero(''); setRecarga(''); settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesData(); }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.detail || 'Error al registrar la venta' });
    }
  };

  const registrarVentaTelefono = async () => {
    if (!telefonoMarca || !telefonoModelo || !telefonoPrecio || !telefonoTipo_venta) {
      setMensaje({ tipo: 'error', texto: 'Faltan datos del teléfono.' });
      return;
    }
    const p = Number(telefonoPrecio);
    if (isNaN(p) || p <= 0) { setMensaje({ tipo: 'error', texto: 'Precio inválido.' }); return; }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/ventas`,
        {
          productos: [{
            producto: `${telefonoMarca} ${telefonoModelo}`,
            cantidad: 1, precio_unitario: p,
            tipo_producto: 'telefono', tipo_venta: telefonoTipo_venta,
            chip_casado: Chip_casado || null,
          }],
          metodo_pago: metodoPago,
          telefono_cliente: telefono?.trim() || '',
        },
        config,
      );
      setMensaje({ tipo: 'success', texto: 'Venta de teléfono registrada correctamente' });
      setTelefonoMarca(''); setTelefonoModelo(''); setTelefonoTipo_venta('');
      setMetodoPago(''); setTelefonoPrecio(''); setChip_casado(''); settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesData(); }
    } catch (err: any) {
      let msg = 'Error al registrar la venta de teléfono';
      if (Array.isArray(err?.response?.data?.detail)) msg = err.response.data.detail.map((e: any) => e.msg).join(' | ');
      else if (typeof err?.response?.data?.detail === 'string') msg = err.response.data.detail;
      setMensaje({ tipo: 'error', texto: msg });
    }
  };

  const buscarTelefonos = async (texto: string) => {
    if (!texto || texto.length < 2) { setOpcionesTelefonos([]); return; }
    setBuscando(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventario/buscar?query=${encodeURIComponent(texto)}`,
        config,
      );
      setOpcionesTelefonos(res.data);
    } catch { setOpcionesTelefonos([]); }
    finally { setBuscando(false); }
  };

  // ── Cálculos asesor del día ──────────────────────────────────────────────
  const ventasHoyAcc = ventas.filter((v) => v.tipo_producto === 'accesorios' && v.fecha === HOY);
  const ventasHoyTel = ventas.filter((v) => v.tipo_producto === 'telefono' && v.fecha === HOY);
  const chipsHoy: any[] = (comisionesData?.ventas_chips || []).filter(
    (c: any) => c.fecha && c.fecha.startsWith(HOY),
  );

  const comisionAccHoy = (comisionesData?.ventas_accesorios || [])
    .filter((v: any) => v.fecha && v.fecha.startsWith(HOY))
    .reduce((s: number, v: any) => s + (v.comision_total || 0), 0);
  const comisionTelHoy = (comisionesData?.ventas_telefonos || [])
    .filter((v: any) => v.fecha && v.fecha.startsWith(HOY))
    .reduce((s: number, v: any) => s + (v.comision_total || 0), 0);
  const comisionChipsHoy = chipsHoy.reduce((s, c) => s + (c.comision || 0), 0);
  const totalComisionHoy = comisionAccHoy + comisionTelHoy;

  // ── Formulario (compartido) ───────────────────────────────────────────────
  const formulario = (
    <Paper sx={{ borderRadius: 2, p: 2.5 }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>Registrar Venta</Typography>

      {mensaje && <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>{mensaje.texto}</Alert>}

      <TextField
        select label="Tipo de venta" value={tipoVenta}
        onChange={(e) => { setTipoVenta(e.target.value as any); setMensaje(null); }}
        fullWidth margin="normal"
      >
        <MenuItem value="accesorio">Accesorio</MenuItem>
        <MenuItem value="chip">Chip</MenuItem>
        <MenuItem value="telefono">Teléfono</MenuItem>
      </TextField>

      {/* ── Accesorio ── */}
      {tipoVenta === 'accesorio' && (
        <>
          <Autocomplete
            options={productos.filter((p) => !p.toLowerCase().includes('telefono'))}
            value={producto}
            onChange={(_, v) => setProducto(v || '')}
            renderInput={(params) => <TextField {...params} label="Producto" fullWidth margin="normal" />}
          />
          <TextField label="Precio Unitario" type="number" value={precio ?? ''} onChange={(e) => setPrecio(e.target.value === '' ? null : Number(e.target.value))} fullWidth margin="normal" />
          <TextField label="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} fullWidth margin="normal" />
          <TextField select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} fullWidth margin="normal" required error={!metodoPago} helperText={!metodoPago ? 'Este campo es obligatorio' : ''}>
            <MenuItem value="efectivo">Efectivo 💵</MenuItem>
            <MenuItem value="tarjeta">Tarjeta 💳</MenuItem>
          </TextField>
          <Button variant="outlined" fullWidth onClick={agregarAlCarrito} sx={{ mt: 1 }} disabled={!producto || cantidad <= 0}>Agregar al Carrito</Button>
          <TextField label="Teléfono del cliente" value={telefono} onChange={(e) => settelefono(e.target.value)} fullWidth margin="normal" />
          <Box mt={2}>
            <Typography variant="h6">Carrito</Typography>
            {carrito.length === 0
              ? <Typography color="text.secondary">No hay productos agregados</Typography>
              : <ul>{carrito.map((p, i) => <li key={i}>{p.producto} — {p.cantidad} × ${p.precio_unitario}</li>)}</ul>}
          </Box>
          <Typography variant="h6" mt={1}>Total: ${carrito.reduce((a, p) => a + p.precio_unitario * p.cantidad, 0).toFixed(2)}</Typography>
          <Button variant="contained" fullWidth onClick={enviarCarrito} sx={{ mt: 2 }} disabled={carrito.length === 0}>Registrar Venta</Button>
        </>
      )}

      {/* ── Chip ── */}
      {tipoVenta === 'chip' && (
        <>
          <TextField select label="Chip" value={tipoChip} onChange={(e) => setTipoChip(e.target.value)} fullWidth margin="normal">
            <MenuItem value="Chip Equipo">Chip Equipo / Promo / ATO</MenuItem>
            <MenuItem value="Chip Express">Chip Express / ATO</MenuItem>
            <MenuItem value="Portabilidad">Portabilidad / ATO</MenuItem>
            <MenuItem value="Chip Cero/Libre">Chip Cero / Libre / EKT</MenuItem>
            <MenuItem value="Chip Preactivado">Chip Preactivado / Otras Cadenas</MenuItem>
            <MenuItem value="Chip Coppel">Chip Express Coppel</MenuItem>
            <MenuItem value="Portabilidad Coppel">Portabilidad Coppel</MenuItem>
            <MenuItem value="Porta Otras cadenas">Portabilidad / EKT / Otras Cadenas</MenuItem>
            <MenuItem value="Activacion">Telefono Activado de Cadenas</MenuItem>
          </TextField>
          <TextField label="Número" type="tel" value={numero} onChange={(e) => setNumero(e.target.value)} fullWidth margin="normal" />
          <TextField label="Recarga" type="number" value={recarga} onChange={(e) => setRecarga(e.target.value)} fullWidth margin="normal" />
          <FormControl sx={{ mt: 1 }}>
            <FormLabel>Cliente VIP</FormLabel>
            <RadioGroup row value={cvip} onChange={(e) => setcvip(e.target.value === 'true')}>
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!tipoChip || !numero || !recarga} sx={{ mt: 2 }}>Registrar Venta de Chip</Button>
        </>
      )}

      {/* ── Teléfono ── */}
      {tipoVenta === 'telefono' && (
        <>
          <Autocomplete
            freeSolo loading={buscando} options={opcionesTelefonos}
            value={`${telefonoMarca} ${telefonoModelo}`.trim()}
            onInputChange={(_, v) => buscarTelefonos(v)}
            onChange={(_, v) => {
              if (typeof v === 'string') {
                const p = v.split(' ');
                setTelefonoMarca(p[0] || '');
                setTelefonoModelo(p.slice(1).join(' ') || '');
              }
            }}
            renderInput={(params) => <TextField {...params} label="Teléfono (marca + modelo)" fullWidth margin="normal" />}
          />
          <TextField select label="Tipo" value={telefonoTipo_venta} onChange={(e) => setTelefonoTipo_venta(e.target.value)} fullWidth margin="normal">
            <MenuItem value="Contado">Contado</MenuItem>
            <MenuItem value="Pajoy">Pajoy</MenuItem>
            <MenuItem value="Paguitos">Paguitos</MenuItem>
          </TextField>
          <TextField label="Precio" type="number" value={telefonoPrecio} onChange={(e) => setTelefonoPrecio(e.target.value)} fullWidth margin="normal" />
          <TextField select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} fullWidth margin="normal" required>
            <MenuItem value="efectivo">💵 Efectivo</MenuItem>
            <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
          </TextField>
          <TextField label="Chip casado" value={Chip_casado} onChange={(e) => setChip_casado(e.target.value)} fullWidth margin="normal" />
          <Button variant="contained" color="secondary" fullWidth onClick={registrarVentaTelefono}
            disabled={!telefonoMarca || !telefonoModelo || !telefonoTipo_venta || !telefonoPrecio} sx={{ mt: 2 }}>
            Registrar Venta Teléfono
          </Button>
        </>
      )}
    </Paper>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA ASESOR
  // ════════════════════════════════════════════════════════════════════════════
  if (rol === 'asesor') {
    return (
      <Grid container spacing={2} sx={{ mt: 2, px: 2 }}>
        {/* Columna izquierda: formulario */}
        <Grid item xs={12} md={6}>
          {formulario}
        </Grid>

        {/* Columna derecha: tabla del día + comisiones */}
        <Grid item xs={12} md={6}>

          {/* ── Ventas del día ── */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Ventas del día
            </Typography>

            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Descripción</th>
                    <th style={thStyle}>Precio</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {ventasHoyAcc.map((v) => (
                    <tr key={`acc-${v.id}`}>
                      <td style={tdStyle}><Chip label="Acc" size="small" sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} /></td>
                      <td style={tdStyle}>{v.producto}</td>
                      <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={tdStyle}>
                        <Button size="small" color="error" variant="outlined" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)} sx={{ py: 0.2, fontSize: 11 }}>
                          Cancelar
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {ventasHoyTel.map((v) => (
                    <tr key={`tel-${v.id}`}>
                      <td style={tdStyle}><Chip label="Tel" size="small" sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} /></td>
                      <td style={tdStyle}>{v.producto}</td>
                      <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={tdStyle}>
                        <Button size="small" color="error" variant="outlined" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)} sx={{ py: 0.2, fontSize: 11 }}>
                          Cancelar
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {chipsHoy.map((c, i) => (
                    <tr key={`chip-${i}`}>
                      <td style={tdStyle}><Chip label="Chip" size="small" sx={{ bgcolor: '#f0fdf4', color: '#22c55e', fontWeight: 700, fontSize: 11 }} /></td>
                      <td style={tdStyle}>{c.tipo_chip} · {c.numero_telefono}</td>
                      <td style={tdStyle}>—</td>
                      <td style={tdStyle}></td>
                    </tr>
                  ))}

                  {ventasHoyAcc.length === 0 && ventasHoyTel.length === 0 && chipsHoy.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: 20 }}>
                        Sin ventas registradas hoy
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={3} mt={1.5} pt={1} sx={{ borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="body2" color="text.secondary">
                Accesorios: <strong>{ventasHoyAcc.length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teléfonos: <strong>{ventasHoyTel.length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chips: <strong>{chipsHoy.length}</strong>
              </Typography>
            </Box>
          </Paper>

          {/* ── Comisiones del día ── */}
          <Paper sx={{ p: 2.5, bgcolor: '#f97316', color: 'white', border: 'none' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Comisiones del día
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ opacity: 0.85 }}>Accesorios</Typography>
                <Typography variant="body2" fontWeight={600}>${comisionAccHoy.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ opacity: 0.85 }}>Teléfonos</Typography>
                <Typography variant="body2" fontWeight={600}>${comisionTelHoy.toFixed(2)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.35)' }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={700}>Total comisionado</Typography>
              <Typography variant="h5" fontWeight={800}>${totalComisionHoy.toFixed(2)}</Typography>
            </Box>
          </Paper>

        </Grid>
      </Grid>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA ADMIN / ENCARGADO (sin cambios respecto al original)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
        {formulario}
      </Grid>

      {/* ── Tablas grandes ── */}
      <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Realizadas</Typography>
          <div style={{ marginBottom: '1rem' }}>
            {user?.is_admin && modulos.length > 0 && (
              <>
                <label htmlFor="modulo">Selecciona Módulo</label>
                <select
                  id="modulo"
                  value={moduloId ?? ''}
                  onChange={(e) => setModuloId(e.target.value ? Number(e.target.value) : null)}
                  style={{ display: 'block', marginTop: 4, marginBottom: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }}
                >
                  <option value="">-- Selecciona un módulo --</option>
                  {modulos.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </>
            )}
            <TextField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} size="small" />
            <Button variant="contained" onClick={fetchVentas} style={{ marginLeft: '1rem' }}>Buscar</Button>
          </div>

          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nombre', 'Producto', 'Cantidad', 'Precio', 'Total', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', color: '#f97316', fontWeight: 700, background: '#f8fafc', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.filter((v) => v.tipo_producto === 'accesorios')
                  .slice(paginaAcc * filasPorPagina, (paginaAcc + 1) * filasPorPagina)
                  .map((v) => (
                    <tr key={v.id}>
                      <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                      <td style={{ padding: 8 }}>{v.producto}</td>
                      <td style={{ padding: 8 }}>{v.cantidad}</td>
                      <td style={{ padding: 8 }}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>${typeof v.total === 'number' ? v.total.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>{`${v.fecha} ${v.hora}`}</td>
                      <td style={{ padding: 8 }}>{v.cancelada ? 'Cancelada' : 'Activa'}</td>
                      <td style={{ padding: 8 }}>
                        <Button variant="outlined" size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>Cancelar</Button>
                      </td>
                    </tr>
                  ))}
                {ventas.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 8, textAlign: 'center' }}>No hay ventas registradas</td></tr>
                )}
              </tbody>
            </Box>
          </Paper>
          <TablePagination
            component="div"
            count={ventas.filter((v) => v.tipo_producto === 'accesorios').length}
            page={paginaAcc}
            onPageChange={(_, p) => setPaginaAcc(p)}
            rowsPerPage={filasPorPagina}
            rowsPerPageOptions={[filasPorPagina]}
          />
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">Total Ventas Accesorios: ${totalAccesorios.toFixed(2)}</Typography>
          </Box>
        </Box>
      </TableContainer>

      <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Teléfonos</Typography>
          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nombre', 'Telefono', 'Chip casado', 'Tipo', 'Precio', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', color: '#f97316', fontWeight: 700, background: '#f8fafc', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventasTelefonos.filter((v) => v.tipo_producto === 'telefono')
                  .slice(paginaTel * filasPorPagina, (paginaTel + 1) * filasPorPagina)
                  .map((v) => (
                    <tr key={v.id}>
                      <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                      <td style={{ padding: 8 }}>{v.producto}</td>
                      <td style={{ padding: 8 }}>{v.chip_casado}</td>
                      <td style={{ padding: 8 }}>{v.tipo_venta}</td>
                      <td style={{ padding: 8 }}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleDateString()}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ color: v.cancelada ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                          {v.cancelada ? 'Cancelada' : 'Activa'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Button variant="outlined" size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>Cancelar</Button>
                      </td>
                    </tr>
                  ))}
                {ventasTelefonos.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 8, textAlign: 'center' }}>No hay ventas de teléfonos</td></tr>
                )}
              </tbody>
            </Box>
          </Paper>
          <TablePagination
            component="div"
            count={ventasTelefonos.length}
            page={paginaTel}
            onPageChange={(_, p) => setPaginaTel(p)}
            rowsPerPage={filasPorPagina}
            rowsPerPageOptions={[filasPorPagina]}
          />
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">Total Ventas Teléfonos: ${totalTelefonos.toFixed(2)}</Typography>
          </Box>
        </Box>
      </TableContainer>

      <Button variant="contained" onClick={() => navigate('/corte')}>Corte</Button>
    </Grid>
  );
};

export default FormularioVentaMultiple;
