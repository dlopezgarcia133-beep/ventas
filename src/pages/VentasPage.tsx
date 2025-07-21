import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import {
  Box, TextField, Button, Typography, Autocomplete, Alert, Paper,
  TableContainer, Container, Table, TableHead, TableRow, TableCell, TableBody,Grid,MenuItem,
  FormControlLabel,Switch,Slide
} from '@mui/material';
import axios from 'axios';
import { ProductoEnVenta, Venta } from '../Types';
import { useNavigate } from 'react-router-dom';

const FormularioVentaMultiple = () => {
  const [productos, setProductos] = useState<string[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventasTelefonos, setVentasTelefonos] = useState<Venta[]>([]);
  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [correo, setCorreo] = useState('');
  const [carrito, setCarrito] = useState<ProductoEnVenta[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [tipoChip, setTipoChip] = useState('');
  const [numero, setNumero] = useState('');
  const [recarga, setRecarga] = useState('');
  const [telefonoMarca, setTelefonoMarca] = useState('');
  const [telefonoModelo, setTelefonoModelo] = useState('');
  const [telefonoChecked, setTelefonoChecked] = useState(false);
  const [telefonoTipo, setTelefonoTipo] = useState('');
  const [telefonoPrecio, setTelefonoPrecio] = useState('');
  const [telefonosDisponibles, setTelefonosDisponibles] = useState<
  { marca: string; modelo: string; cantidad: number }[]
>([]);
  const Container = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/inventario/inventario/general/productos-nombres`, config);
        setProductos(res.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };

    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchPrecio = async () => {
      if (producto) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/inventario/inventario/general/${encodeURIComponent(producto)}`, config);
          setPrecio(res.data.precio);
        } catch (err) {
          setPrecio(null);
          setMensaje({ tipo: 'error', texto: 'Producto no encontrado en inventario.' });
        }
      }
    };

    fetchPrecio();
  }, [producto]);
  
   const cargarVentas = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas`, config);
    const todas = res.data;
    
    // Solo ventas con producto definido (no teléfonos)
    const generales = todas.filter((v: Venta) => v.producto);

    // Solo ventas de teléfonos (donde no hay producto, pero hay marca/modelo)
    const telefonos = todas.filter((v: Venta) => !v.producto);

    setVentas(generales);
    setVentasTelefonos(telefonos);
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.detail || 'Error al cargar las ventas';
    setMensaje({ tipo: 'error', texto: msg });
  }
};
  

  const agregarAlCarrito = () => {
    if (!producto || !precio || cantidad <= 0) return;

    const nuevo: ProductoEnVenta = {
      producto,
      cantidad,
      precio_unitario: precio,
      id: 0,
      nombre: ''
    };

    setCarrito([...carrito, nuevo]);
    setProducto('');
    setCantidad(1);
    setPrecio(null);
  };

  const enviarCarrito = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/ventas/ventas/multiples`, {
        productos: carrito,
        correo_cliente: correo
      }, config);

      setMensaje({ tipo: 'success', texto: 'Venta registrada con éxito.' });
      setCarrito([]);
      setCorreo('');
    } catch (err: any) {
      console.error(err);
    const msg = err?.response?.data?.detail || 'Error al registrar la venta ';
    setMensaje({ tipo: 'error', texto: msg });;
    }
  };

  const cancelarVenta = async (id: number) => {
  if (!window.confirm("¿Estás seguro de cancelar esta venta?")) return;
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/ventas/ventas/${id}/cancelar`, {}, config);
    alert("Venta cancelada");
    cargarVentas(); // para recargar la tabla
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al cancelar la venta");
  }
};

  const handleChange = () => {
    setChecked(!checked);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/ventas/venta_chips`, {
        tipo_chip: tipoChip,
        numero_telefono: numero,
        monto_recarga: parseFloat(recarga),
        correo_cliente: correo || null,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setMensaje({ tipo: 'success', texto: 'Venta de chip registrada correctamente' });
      setTipoChip('');
      setNumero('');
      setRecarga('');
      setCorreo('');
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || 'Error al registrar la venta';
      setMensaje({ tipo: 'error', texto: msg });
    }
  };

  useEffect(() => {
  const fetchTelefonosDisponibles = async () => {
    try {
      const modulo = localStorage.getItem("modulo"); // o usa el módulo del usuario logueado
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/inventario_telefonos/modulo?modulo=${modulo}`, config);
      const disponibles = res.data;
      setTelefonosDisponibles(disponibles);  // Guarda lista de { marca, modelo, cantidad }
    } catch (err) {
      console.error("Error al cargar inventario de teléfonos", err);
    }
  };

  fetchTelefonosDisponibles();
}, []);


const registrarVentaTelefono = async () => {
  const telefono = telefonosDisponibles.find(
    (t) =>
      t.marca.toLowerCase().trim() === telefonoMarca.toLowerCase().trim() &&
      t.modelo.toLowerCase().trim() === telefonoModelo.toLowerCase().trim()
  );

  if (!telefono || telefono.cantidad <= 0) {
    setMensaje({ tipo: 'error', texto: 'Este teléfono no está disponible en el inventario del módulo.' });
    return;
  }

  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/ventas/venta_telefonos`, {
      marca: telefonoMarca,
      modelo: telefonoModelo,
      tipo: telefonoTipo,
      precio_venta: parseFloat(telefonoPrecio),
      correo_cliente: correo || null
    }, config);

    setMensaje({ tipo: 'success', texto: 'Venta de teléfono registrada correctamente' });
    setTelefonoMarca('');
    setTelefonoModelo('');
    setTelefonoTipo('');
    setTelefonoPrecio('');
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.detail || 'Error al registrar la venta de teléfono';
    setMensaje({ tipo: 'error', texto: msg });
  }
};




  useEffect(() => {
    cargarVentas();
  }, []);

  return (
    <Grid container spacing={ 2 } sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
      <Paper sx={{borderRadius: 2, boxShadow: 3, p: 2, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>Registrar Venta</Typography>

        {mensaje && (
          <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>{mensaje.texto}</Alert>
        )}

        <Autocomplete
          options={productos}
          value={producto}
          onChange={(e, newValue) => setProducto(newValue || '')}
          renderInput={(params) => (
            <TextField {...params} label="Producto" fullWidth margin="normal" />
          )}
        />

        <TextField
          label="Precio Unitario"
          value={precio !== null ? `$${precio.toFixed(2)}` : ''}
          margin="normal"
          fullWidth
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Cantidad"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />

        <Button
          variant="outlined"
          fullWidth
          onClick={agregarAlCarrito}
          sx={{ mt: 1 }}
          disabled={!producto || !precio || cantidad <= 0}
        >
          Agregar al Carrito
        </Button>

        <TextField
          label="Correo del cliente"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Box mt={2}>
          <Typography variant="h6">Carrito</Typography>
          {carrito.length === 0 ? (
            <Typography>No hay productos agregados</Typography>
          ) : (
            <ul>
              {carrito.map((p, i) => (
                <li key={i}>{p.producto} - {p.cantidad} x ${p.precio_unitario.toFixed(2)}</li>
              ))}
            </ul>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={enviarCarrito}
          sx={{ mt: 2 }}
          disabled={carrito.length === 0}
        >
          Registrar Venta
        </Button>

      </Paper>
         


      
      </Grid>


      <Grid item xs={12} md={3}>
      <Box sx={{ p: 2, height: '100%', overflow: 'hidden' }} ref={Container}>
          <FormControlLabel
            control={<Switch checked={checked} onChange={() => setChecked(!checked)} />}
            label="CHIPS"
          />

        <Slide in={checked} container={Container.current}>
          <Paper sx={{ borderRadius: 2, boxShadow: 3, p: 3, backgroundColor: '#fdfdfd' }}>
            {mensaje && (
              <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>
                {mensaje.texto}
              </Alert>
            )}

            <TextField
              select
              label="Chip"
              value={tipoChip}
              onChange={(e) => setTipoChip(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Chip Azul">Chip Azul</MenuItem>
              <MenuItem value="Chip Telcel">Chip Telcel</MenuItem>
              <MenuItem value="Portabilidad">Portabilidad</MenuItem>
              <MenuItem value="Chip Cero">Chip Cero (Cadenas)</MenuItem>
              <MenuItem value="Chip">Chip  (Cadenas)</MenuItem>
              <MenuItem value="Activacion Tel.">Activacion Tel. (Cadenas)</MenuItem>
            </TextField>

            <TextField
              label="Número"
              type="tel"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Recarga"
              type="number"
              value={recarga}
              onChange={(e) => setRecarga(e.target.value)}
              fullWidth
              margin="normal"
            />

            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={handleSubmit}
              disabled={!tipoChip || !numero || !recarga}
              sx={{ mt: 2 }}
            >
              Registrar Venta de Chip
            </Button>
          </Paper>
        </Slide>
        
      </Box>
    </Grid>
    
   <Grid item xs={12} md={3}>
      <Box sx={{ p: 2, height: '100%', overflow: 'hidden' }} ref={Container}>
                <FormControlLabel
            control={<Switch checked={telefonoChecked} onChange={() => setTelefonoChecked(!telefonoChecked)} />}
            label="TELÉFONOS"
          />

          <Slide in={telefonoChecked} container={Container.current}>
  <Paper sx={{ borderRadius: 2, boxShadow: 3, p: 3, mt: 2, backgroundColor: '#fdfdfd' }}>
    <Typography variant="h6" gutterBottom>Venta de Teléfono</Typography>

    <TextField
      label="Marca"
      value={telefonoMarca}
      onChange={(e) => setTelefonoMarca(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Modelo"
      value={telefonoModelo}
      onChange={(e) => setTelefonoModelo(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
              select
              label="Tipo"
              value={telefonoTipo}
              onChange={(e) => setTelefonoTipo(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Chip Azul">Contado</MenuItem>
              <MenuItem value="Chip Telcel">Pajoy</MenuItem>
              <MenuItem value="Portabilidad">Paguitos</MenuItem>
            </TextField>
    <TextField
      label="Precio"
      type="number"
      value={telefonoPrecio}
      onChange={(e) => setTelefonoPrecio(e.target.value)}
      fullWidth
      margin="normal"
    />

    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={registrarVentaTelefono}
      disabled={!telefonoMarca || !telefonoModelo || !telefonoTipo || !telefonoPrecio}
      sx={{ mt: 2 }}
    >
      Registrar Venta Teléfono
    </Button>
  </Paper>
</Slide>

        </Box>
        
    </Grid>
          
          <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Realizadas</Typography>
          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Producto</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Cantidad</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Precio</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Comisión</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Fecha</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Estado</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.producto}</td>
                    <td style={{ padding: 8 }}>{v.cantidad}</td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.precio_unitario === "number" ? v.precio_unitario.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.total === "number" ? v.total.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.comision === "number" ? v.comision.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleString()}</td>
                    <td style={{ padding: 8 }}>{v.cancelada ? 'Cancelada' : 'Activa'}</td>
                    <td style={{ padding: 8 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={v.cancelada}
                        onClick={() => cancelarVenta(v.id)}
                      >
                        Cancelar
                      </Button>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 8, textAlign: 'center' }}>No hay ventas registradas</td>
                  </tr>
                )}
                </tbody>
                </Box>
          </Paper>
        </Box>

      </TableContainer>

       <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Telefonos</Typography>
          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Producto</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Cantidad</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Precio</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Comisión</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Fecha</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Estado</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasTelefonos.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.producto}</td>
                    <td style={{ padding: 8 }}>{v.cantidad}</td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.precio_unitario === "number" ? v.precio_unitario.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.total === "number" ? v.total.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.comision === "number" ? v.comision.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleString()}</td>
                    <td style={{ padding: 8 }}>{v.cancelada ? 'Cancelada' : 'Activa'}</td>
                    <td style={{ padding: 8 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={v.cancelada}
                        onClick={() => cancelarVenta(v.id)}
                      >
                        Cancelar
                      </Button>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 8, textAlign: 'center' }}>No hay ventas registradas</td>
                  </tr>
                )}
                </tbody>
                </Box>
          </Paper>
        </Box>

      </TableContainer>
    
      <Button
      variant="contained"
       onClick={() => navigate("/corte")}>
        Corte
      </Button>
    </Grid>
    
  );
};

export default FormularioVentaMultiple;


