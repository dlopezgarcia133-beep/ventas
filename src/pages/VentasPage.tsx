import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import {
  Box, TextField, Button, Typography, Autocomplete, Alert, Paper,
  TableContainer, Container, Table, TableHead, TableRow, TableCell, TableBody,Grid,MenuItem,
  FormControlLabel,Switch,Slide
} from '@mui/material';
import axios from 'axios';
import { Modulo, ProductoEnVenta, Usuario, Venta, VentaTelefono } from '../Types';
import { useNavigate } from 'react-router-dom';
import UsuariosAdmin from './Usuarios';

const FormularioVentaMultiple = () => {
  const [productos, setProductos] = useState<string[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const ventasAccesorios = ventas.filter((v) => v.tipo_producto === "accesorio");
  const ventasTelefonos = ventas.filter((v) => v.tipo_producto === "telefono");
  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState('');
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
  const [telefonoTipo_venta, setTelefonoTipo_venta] = useState('');
  const [telefonoPrecio, setTelefonoPrecio] = useState('');
  const [fecha, setFecha] = useState("");
  const [opcionesTelefonos, setOpcionesTelefonos] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [rol, setRol] = useState<Usuario["rol"] | null>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const Container = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [totalAccesorios, setTotalAccesorios] = useState(0);
  const [totalTelefonos, setTotalTelefonos] = useState(0);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

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


useEffect(() => {
  if (ventas.length > 0) {
    // Filtrar y sumar accesorios
    const accesorios = ventas.filter(v => v.tipo_producto === "accesorio");
    const totalAcc = accesorios.reduce(
      (acc, v) => acc + v.precio_unitario * v.cantidad,
      0
    );
    setTotalAccesorios(totalAcc);

    // Filtrar y sumar teléfonos
    const telefonos = ventas.filter(v => v.tipo_producto === "telefono");
    const totalTel = telefonos.reduce(
      (acc, v) => acc + v.precio_unitario * v.cantidad,
      0
    );
    setTotalTelefonos(totalTel);
  }
}, [ventas]);

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
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/ventas/ventas`,
      config
    );

    const todas = res.data;
    console.log("Ventas cargadas:", todas);

    // Aquí sí filtras de la respuesta, no del state
    const ventasAccesorios = todas.filter((v: any) => v.tipo === "accesorio");
    const ventasTelefonos = todas.filter((v: any) => v.tipo === "telefono");

    // Guardas todas las ventas en el state principal
    setVentas(todas);


  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.detail || "Error al cargar las ventas";
    setMensaje({ tipo: "error", texto: msg });
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
        correo_cliente: correo,
        metodo_pago: metodoPago,
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

  


const registrarVentaTelefono = async () => {
  if (!telefonoMarca || !telefonoModelo || !telefonoPrecio || !telefonoTipo_venta) {
    setMensaje({ tipo: "error", texto: "Faltan datos del teléfono." });
    return;
  }

  const precio = Number(telefonoPrecio);
  if (isNaN(precio) || precio <= 0) {
    setMensaje({ tipo: "error", texto: "Precio inválido." });
    return;
  }

  try {
    const ventaPayload = {
  productos: [
    {
      producto: `${telefonoMarca} ${telefonoModelo}`,
      cantidad: 1,
      precio_unitario: Number(telefonoPrecio),
      tipo_producto: "telefono", 
      tipo_venta: telefonoTipo_venta,
    },
  ],
  metodo_pago: metodoPago,
  correo_cliente: correo?.trim() || "",
};

await axios.post(`${process.env.REACT_APP_API_URL}/ventas/ventas`, ventaPayload, config);

    setMensaje({ tipo: "success", texto: "Venta de teléfono registrada correctamente" });

    // limpiar
    setTelefonoMarca("");
    setTelefonoModelo("");
    setTelefonoTipo_venta("");
    setMetodoPago("");
    setTelefonoPrecio("");
    setCorreo("");
  } catch (err: any) {
    console.error("Error en registrarVentaTelefono:", err);

    let msg = "Error al registrar la venta de teléfono";
    if (Array.isArray(err?.response?.data?.detail)) {
      console.table(err.response.data.detail);
      msg = err.response.data.detail.map((e: any) => e.msg).join(" | ");
    } else if (typeof err?.response?.data?.detail === "string") {
      msg = err.response.data.detail;
    } else if (err.message) {
      msg = err.message;
    }

    setMensaje({ tipo: "error", texto: msg });
  }
};



const buscarTelefonos = async (texto: string) => {
  if (!texto || texto.length < 2) { // solo busca si tiene 2+ caracteres
    setOpcionesTelefonos([]);
    return;
  }

  setBuscando(true);
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/buscar?query=${encodeURIComponent(texto)}`,
      config
    );
    setOpcionesTelefonos(res.data);
  } catch (err) {
    console.error("Error buscando teléfonos", err);
    setOpcionesTelefonos([]);
  } finally {
    setBuscando(false);
  }
};


useEffect(() => {
  const fetchUserAndModulos = async () => {
    try {
      if (token) {
        const resUser = await axios.get<Usuario>(
          `${process.env.REACT_APP_API_URL}/auth/usuarios/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(resUser.data);

        // Aquí guardamos el rol del usuario directamente
        setRol(resUser.data.rol);

        const resModulos = await axios.get(
          `${process.env.REACT_APP_API_URL}/registro/modulos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModulos(resModulos.data);
      }
    } catch (err) {
      console.error("Error al cargar usuario/modulos:", err);
    }
  };

  fetchUserAndModulos();
}, []);


useEffect(() => {
    fetchVentas();
  }, [fecha, moduloId, user]);



  const totalVentas = ventas
  .filter(v => !v.cancelada)
  .reduce((acc, v) => acc + (typeof v.total === 'number' ? v.total : 0), 0);

// Calcular total para ventasTelefonos (solo activas)
const totalVentasTelefonos = ventasTelefonos
  .filter(v => !v.cancelada)
  .reduce((acc, v) => acc + (typeof v.precio_unitario === 'number' ? v.precio_unitario : 0), 0);
 

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
          <TextField
            select
            label="Método de pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="efectivo">Efectivo</MenuItem>
            <MenuItem value="tarjeta">Tarjeta</MenuItem>
          </TextField>

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
        <Box mt={2}>
          <Typography variant="h6">Total: ${carrito.reduce((acc, p) => acc + p.precio_unitario * p.cantidad, 0).toFixed(2)}</Typography>
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
              <MenuItem value="Chip ATO">Chip ATO</MenuItem>
              <MenuItem value="Portabilidad">Portabilidad</MenuItem>
              <MenuItem value="Chip Cero/Libre">Chip Cero/Libre (Cadenas)</MenuItem>
              <MenuItem value="Chip Preactivado">Chip Preactivado (Cadenas)</MenuItem>
              <MenuItem value="Activacion">Activacion (Cadenas)</MenuItem>
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

              <Autocomplete
                freeSolo
                loading={buscando}
                options={opcionesTelefonos}
                value={`${telefonoMarca} ${telefonoModelo}`.trim()}
                onInputChange={(e, newValue) => {
                  buscarTelefonos(newValue);
                }}
                onChange={(e, newValue) => {
                  if (typeof newValue === "string") {
                    // separa en marca y modelo solo aquí
                    const partes = newValue.split(" ");
                    setTelefonoMarca(partes[0] || "");
                    setTelefonoModelo(partes.slice(1).join(" ") || "");
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Teléfono (marca + modelo)" fullWidth margin="normal" />
                )}
              />
    <TextField
              select
              label="Tipo"
              value={telefonoTipo_venta}
              onChange={(e) => setTelefonoTipo_venta(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Contado">Contado</MenuItem>
              <MenuItem value="Pajoy">Pajoy</MenuItem>
              <MenuItem value="Paguitos">Paguitos</MenuItem>
            </TextField>
    <TextField
      label="Precio"
      type="number"
      value={telefonoPrecio}
      onChange={(e) => setTelefonoPrecio(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
  select
  label="Método de pago"
  value={metodoPago}
  onChange={(e) => setMetodoPago(e.target.value)}
  fullWidth
  margin="normal"
  required
>
  <MenuItem value="efectivo">💵 Efectivo</MenuItem>
  <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
</TextField>

    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={registrarVentaTelefono}
      disabled={!telefonoMarca || !telefonoModelo || !telefonoTipo_venta || !telefonoPrecio}
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
           <div style={{ marginBottom: "1rem" }}>
        
{user?.is_admin && modulos.length > 0 && (
  <>
    <label htmlFor="modulo" className="block font-medium mb-1">
      Selecciona Módulo
    </label>
    <select
      id="modulo"
      value={moduloId ?? ""}
      onChange={(e) => setModuloId(e.target.value ? Number(e.target.value) : null)}
      className="border p-2 rounded w-full mb-4"
    >
      <option value="">-- Selecciona un módulo --</option>
      {modulos.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nombre}
        </option>
      ))}
    </select>
  </>
)}

<TextField
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

<Button
          variant="contained"
          onClick={fetchVentas}
          style={{ marginLeft: "1rem" }}
        >
          Buscar
        </Button>

      </div>
      
      
          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Nombre</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Producto</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Cantidad</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Precio</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Fecha</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Estado</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.filter((venta) => venta.tipo_producto === "accesorio").map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                    <td style={{ padding: 8 }}>{v.producto}</td>
                    <td style={{ padding: 8 }}>{v.cantidad}</td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.precio_unitario === "number" ? v.precio_unitario.toFixed(2) : "0.00"}
                    </td>
                    <td style={{ padding: 8 }}>
                      ${typeof v.total === "number" ? v.total.toFixed(2) : "0.00"}
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
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">
              Total Ventas Accesorios: ${totalAccesorios.toFixed(2)}
            </Typography>
          </Box>
        </Box>

      </TableContainer>

       <TableContainer>
  <Box mt={5}>
    <Typography variant="h6" gutterBottom>Ventas Teléfonos</Typography>
    <Paper>
      <Box p={2} component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Producto</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Tipo</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Precio</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Fecha</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Estado</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventasTelefonos.filter((venta) => venta.tipo_producto === "telefono").map((v) => (
            <tr key={v.id}>
              <td style={{ padding: 8 }}>{v.producto}</td>
              <td style={{ padding: 8 }}>{v.tipo_venta}</td>
              <td style={{ padding: 8 }}>
                ${typeof v.precio_unitario === "number" ? v.precio_unitario.toFixed(2) : "0.00"}
              </td>
              <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleDateString()}</td>
              <td style={{ padding: 8 }}>
                <span
                  style={{
                    color: v.cancelada ? "red" : "green",
                    fontWeight: "bold"
                  }}
                >
                  {v.cancelada ? "Cancelada" : "Activa"}
                </span>
              </td>
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
          {ventasTelefonos.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 8, textAlign: "center" }}>No hay ventas de teléfonos</td>
            </tr>
          )}
        </tbody>
      </Box>
    </Paper>
    <Box mt={2} textAlign="right">
  <Typography variant="subtitle1" fontWeight="bold">
    Total Ventas Teléfonos: ${totalTelefonos.toFixed(2)}
  </Typography>
</Box>
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


function jwt_decode(token: string): any {
  throw new Error('Function not implemented.');
}

