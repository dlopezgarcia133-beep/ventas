import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,Button,Container,Divider,IconButton,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Delete, Edit, Save } from "@mui/icons-material";
import dayjs, { Dayjs } from 'dayjs';
import { ComisionData, Usuario } from "../Types";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";



type Comision = {
  producto: string;
  cantidad: number;
  numero_telefono?: string;
};

const TablaComisiones = () => {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [data, setData] = useState<ComisionData | null>(null);
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [modo, setModo] = useState<'actual' | 'personalizado'>('actual');
  const [inicio, setInicio] = useState<Dayjs | null>(null);
  const [fin, setFin] = useState<Dayjs | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null)
  const token = localStorage.getItem("token");

  const cargarComisiones = async () => {
    const token = localStorage.getItem('token');
    const config = {
    headers: {Authorization: `Bearer ${token}`,},
};
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/comisiones/comisiones`, config);
    setComisiones(res.data);
  };

  const crearComision = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.post(`${process.env.REACT_APP_API_URL}/comisiones/comisiones`, { producto, cantidad: parseFloat(cantidad) }, config);
    setProducto("");
    setCantidad("");
    cargarComisiones();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al crear comisión");
  }
};

const guardarEdicion = async (producto: string) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.put(`${process.env.REACT_APP_API_URL}/comisiones/comisiones/${producto}`, { cantidad: parseFloat(nuevaCantidad) }, config);
    setEditando(null);
    setNuevaCantidad("");
    cargarComisiones();
  } catch (err) {
    alert("Error al actualizar comisión");
  }
};

const eliminarComision = async (producto: string) => {
  if (!window.confirm(`¿Seguro que deseas eliminar la comisión de "${producto}"?`)) return;
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.delete(`${process.env.REACT_APP_API_URL}/comisiones/comisiones/${producto}`, config);
    cargarComisiones();
  } catch (err) {
    alert("Error al eliminar comisión");
  }
};

const fetchCicloActual = async () => {
  try {
    const endpoint = empleadoSeleccionado
      ? `${process.env.REACT_APP_API_URL}/ventas/comisiones/ciclo/${empleadoSeleccionado}`
      : `${process.env.REACT_APP_API_URL}/ventas/comisiones/ciclo`;

    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Empleado seleccionado:", empleadoSeleccionado);
    console.log("Datos recibidos ciclo actual:", res.data);
    setData(res.data);
  } catch (err: any) {
  console.error("Error al obtener comisiones actuales", err);
  alert(err.response?.data?.detail || "Error al obtener datos del ciclo");
  setData(null);
}
};

const fetchCicloPorFechas = async () => {
  if (!inicio || !fin) return;

  const params: any = {
    inicio: dayjs(inicio).format("YYYY-MM-DD"),
    fin: dayjs(fin).format("YYYY-MM-DD"),
  };
  if (empleadoSeleccionado) {
    params.empleado_id = empleadoSeleccionado;
  }

  console.log("Consultando:", `${process.env.REACT_APP_API_URL}/comisiones/ciclo_por_fechas`, params);
  
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/comisiones/ciclo_por_fechas`,
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setData(res.data);

  } catch (err: any) {
    if (err.response?.status === 404) {
      // No hay comisiones, mostramos datos vacíos
      setData({
        inicio_ciclo: params.inicio,
        fin_ciclo: params.fin,
        fecha_pago: "-",
        total_accesorios: 0,
        total_telefonos: 0,
        total_chips: 0,
        total_general: 0,
        ventas_accesorios: [],
        ventas_telefonos: [],
        ventas_chips: [],
      });
    } else {
      console.error("Error al obtener comisiones por fechas:", err);
      setData(null);
    }
  }
};

useEffect(() => {
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.warn("No se pudo cargar usuarios (probablemente no eres admin)");
    }
  };

  cargarUsuarios();
}, []);

  useEffect(() => {
    if (modo === "actual") fetchCicloActual();
  }, [modo]);

  useEffect(() => {
  if (modo === "actual") fetchCicloActual();
}, [modo, empleadoSeleccionado]);

  const handleBuscar = () => {
    if (modo === "personalizado") fetchCicloPorFechas();
  };

  useEffect(() => {
    cargarComisiones();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>

      <ToggleButtonGroup
        value={modo}
        exclusive
        onChange={(_, v) => v && setModo(v)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="actual">Ciclo Actual</ToggleButton>
        <ToggleButton value="personalizado">Buscar por Fechas</ToggleButton>
      </ToggleButtonGroup>

      
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            label="Seleccionar Empleado"
            value={empleadoSeleccionado ?? ""}
            onChange={(e) => setEmpleadoSeleccionado(Number(e.target.value))}
            SelectProps={{ native: true }}
            fullWidth
          >
            <option value="">(Tú mismo)</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option> 
            ))}
          </TextField>
        </Box>

      {modo === "personalizado" && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Inicio del ciclo" value={inicio} onChange={setInicio} />
            <DatePicker label="Fin del ciclo" value={fin} onChange={setFin} />
          </LocalizationProvider>
          <Button variant="contained" onClick={handleBuscar}>Buscar</Button>
        </Box>
      )}

      {!data ? <Typography>Cargando...</Typography> : (
        <>
          <Typography variant="h6" gutterBottom>
            Ciclo de comisión: {data.inicio_ciclo} al {data.fin_ciclo}
          </Typography>
          <Typography variant="subtitle1">
            Pago programado para el: <strong>{data.fecha_pago}</strong>
          </Typography>
          <Divider sx={{ my: 2 }} />

        {/* ACCESORIOS */}
<Typography variant="subtitle1">🧩 Accesorios: ${data.total_accesorios.toFixed(2)}</Typography>
<Table size="small" sx={{ mb: 2 }}>
  <TableHead>
    <TableRow>
      <TableCell>Producto</TableCell>
      <TableCell>Cantidad</TableCell>
      <TableCell>Comisión</TableCell>
      <TableCell>Fecha</TableCell>
      <TableCell>Hora</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.ventas_accesorios.map((v, i) => (
      <TableRow key={i}>
        <TableCell>{v.producto}</TableCell>
        <TableCell>{v.cantidad}</TableCell>
        <TableCell>${v.comision.toFixed(2)}</TableCell>
        <TableCell>{v.fecha}</TableCell>
        <TableCell>{v.hora}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

{/* TELÉFONOS */}
<Typography variant="subtitle1">📱 Teléfonos: ${data.total_telefonos.toFixed(2)}</Typography>
<Table size="small" sx={{ mb: 2 }}>
  <TableHead>
    <TableRow>
      <TableCell>Marca</TableCell>
      <TableCell>Modelo</TableCell>
      <TableCell>Tipo</TableCell>
      <TableCell>Comisión</TableCell>
      <TableCell>Fecha</TableCell>
      <TableCell>Hora</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.ventas_telefonos.map((v, i) => (
      <TableRow key={i}>
        <TableCell>{v.marca}</TableCell>
        <TableCell>{v.modelo}</TableCell>
        <TableCell>{v.tipo}</TableCell>
        <TableCell>${v.comision.toFixed(2)}</TableCell>
        <TableCell>{v.fecha}</TableCell>
        <TableCell>{v.hora}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

{/* CHIPS */}
<Typography variant="subtitle1">🔌 Chips: ${data.total_chips.toFixed(2)}</Typography>
<Table size="small" sx={{ mb: 2 }}>
  <TableHead>
    <TableRow>
      <TableCell>Tipo</TableCell>
      <TableCell>Número</TableCell>
      <TableCell>Comisión</TableCell>
      <TableCell>Fecha</TableCell>
      <TableCell>Hora</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.ventas_chips && data.ventas_chips.map((v, i) => (
      <TableRow key={i}>
        <TableCell>{v.tipo_chip}</TableCell>
        <TableCell>{v.numero_telefono}</TableCell>
        <TableCell>${v.comision.toFixed(2)}</TableCell>
        <TableCell>{v.fecha}</TableCell>
        <TableCell>{v.hora}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

<Divider sx={{ my: 2 }} />
<Typography variant="h6">💵 Total: ${data.total_general.toFixed(2)}</Typography>

      <Typography variant="h5" gutterBottom>
        Gestión de Comisiones
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Producto"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
        />
        <TextField
          label="Comisión (MXN)"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={crearComision}>
          Agregar
        </Button>
       
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Producto</strong></TableCell>
              <TableCell><strong>Comisión</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comisiones.map((com) => (
              <TableRow key={com.producto}>
                <TableCell>{com.producto}</TableCell>
                <TableCell>
                  {editando === com.producto ? (
                    <TextField
                      type="number"
                      value={nuevaCantidad}
                      onChange={(e) => setNuevaCantidad(e.target.value)}
                      size="small"
                    />
                  ) : (
                    `$${com.cantidad}`
                  )}
                </TableCell>
                <TableCell>
                  {editando === com.producto ? (
                    <IconButton
                      color="primary"
                      onClick={() => guardarEdicion(com.producto)}
                    >
                      <Save />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="info"
                      onClick={() => {
                        setEditando(com.producto);
                        setNuevaCantidad(com.cantidad.toString());
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => eliminarComision(com.producto)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {comisiones.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay comisiones registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
        </>
      )}
    </Container>
  );
};

export default TablaComisiones;
