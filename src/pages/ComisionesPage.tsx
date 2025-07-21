import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,Button,Container,IconButton,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Edit, Save } from "@mui/icons-material";



type Comision = {
  producto: string;
  cantidad: number;
};

const TablaComisiones = () => {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState("");

  const cargarComisiones = async () => {
    const token = localStorage.getItem('token');
    const config = {
    headers: {Authorization: `Bearer ${token}`,},
};
    const res = await axios.get("http://localhost:8000/comisiones/comisiones", config);
    setComisiones(res.data);
  };

  const crearComision = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.post("http://localhost:8000/comisiones/comisiones", { producto, cantidad: parseFloat(cantidad) }, config);
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
    await axios.put(`http://localhost:8000/comisiones/comisiones/${producto}`, { cantidad: parseFloat(nuevaCantidad) }, config);
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
    await axios.delete(`http://localhost:8000/comisiones/comisiones/${producto}`, config);
    cargarComisiones();
  } catch (err) {
    alert("Error al eliminar comisión");
  }
};

  useEffect(() => {
    cargarComisiones();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
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
    </Container>
  );
};

export default TablaComisiones;
