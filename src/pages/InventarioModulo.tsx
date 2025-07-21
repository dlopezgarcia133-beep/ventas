import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, MenuItem, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, IconButton, Box, TableContainer,
  Select
} from '@mui/material';
import { Edit, Delete, Save } from '@mui/icons-material';
import axios from 'axios';
import { InventarioModulo, Modulo } from '../Types';

const InventarioPorModulo = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [filtro, setFiltro] = useState('');
  const [inventario, setInventario] = useState<InventarioModulo[]>([]);
  const [nuevo, setNuevo] = useState({ producto: '', clave: '', cantidad: '', precio: '' });
  const [tipo, setTipo] = useState<'producto' | 'telefono'>('producto');
  const [nuevoTelefono, setNuevoTelefono] = useState({ producto: '', clave: '', cantidad: '', precio: '', marca: '', modelo: '' });

  const [editando, setEditando] = useState<string | null>(null);
  const [editarData, setEditarData] = useState({ cantidad: '', precio: '' });

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarModulos = async () => {
    const res = await axios.get("http://localhost:8000/registro/modulos", config);
    setModulos(res.data);
  };

  const cargarInventario = async () => {
    if (!moduloSeleccionado) return;
    const res = await axios.get(`http://localhost:8000/inventario/inventario/modulo?modulo=${moduloSeleccionado}`, config);
     console.log("Inventario recibido:", res.data);
    setInventario(res.data);
  };

  const agregarProducto = async () => {
  try {
    if (tipo === 'producto') {
      console.log({
  producto: nuevo.producto,
  clave: nuevo.clave,
  cantidad: parseInt(nuevo.cantidad),
  precio: parseFloat(nuevo.precio),
  modulo: moduloSeleccionado
});
      await axios.post("http://localhost:8000/inventario/inventario/modulo", {
        producto: nuevo.producto,
        clave: nuevo.clave,
        cantidad: parseInt(nuevo.cantidad),
        precio: parseFloat(nuevo.precio),
        modulo: moduloSeleccionado,
      }, config);
    } else {
      await axios.post("http://localhost:8000/inventario_telefonos/inventario_telefonos/modulo", {
        marca: nuevoTelefono.marca,
        modelo: nuevoTelefono.modelo,
        cantidad: parseInt(nuevo.cantidad),
        precio: parseFloat(nuevo.precio),
        modulo: moduloSeleccionado,
      }, config);
    }

    setNuevoTelefono({ producto: '', clave: '', cantidad: '', precio: '', marca: '', modelo: '' });
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al agregar");
  }
};


  const guardarEdicion = async (producto: string) => {
    try {
      await axios.put(`http://localhost:8000/inventario/inventario/modulo/${producto}`, {
        cantidad: parseInt(editarData.cantidad),
        precio: parseFloat(editarData.precio),
        modulo: moduloSeleccionado
      }, config);
      setEditando(null);
      cargarInventario();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al editar");
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto del módulo?")) return;
    try {
      await axios.delete(`http://localhost:8000/inventario/inventario/modulo/${id}?modulo=${moduloSeleccionado}`, config);
      cargarInventario();
    } catch {
      alert("Error al eliminar");
    }
  };

  const productosFiltrados = inventario.filter((p) =>
    p.producto.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    cargarModulos();
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [moduloSeleccionado]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Inventario por Módulo</Typography>

      <TextField
        select
        label="Selecciona Módulo"
        value={moduloSeleccionado}
        onChange={(e) => setModuloSeleccionado(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        {modulos.map((m) => (
          <MenuItem key={m.id} value={m.nombre}>{m.nombre}</MenuItem>
        ))}
      </TextField>
      

       <TextField
              label="Buscar producto"
              variant="outlined"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />

      {moduloSeleccionado && (
        <>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Select value={tipo} onChange={(e) => setTipo(e.target.value as 'producto' | 'telefono')}>
          <MenuItem value="producto">Producto</MenuItem>
          <MenuItem value="telefono">Teléfono</MenuItem>
        </Select>
            {tipo === 'producto' ? (
              <>
                <TextField label="Producto" value={nuevo.producto} onChange={(e) => setNuevo({ ...nuevo, producto: e.target.value })} />
                <TextField label="Clave" value={nuevo.clave} onChange={(e) => setNuevo({ ...nuevo, clave: e.target.value })} />
              </>
            ) : (
              <>
                <TextField label="Marca" value={nuevoTelefono.marca} onChange={(e) => setNuevoTelefono({ ...nuevoTelefono, marca: e.target.value })} />
                <TextField label="Modelo" value={nuevoTelefono.modelo} onChange={(e) => setNuevoTelefono({ ...nuevoTelefono, modelo: e.target.value })} />
              </>
            )}
            <TextField label="Cantidad" type="number" value={nuevo.cantidad} onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })} />
            <TextField label="Precio" type="number" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} />
            <Button variant="contained" onClick={agregarProducto}>Agregar</Button>
      </Box>


          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Producto</strong></TableCell>
                  <TableCell><strong>Clave</strong></TableCell>
                  <TableCell><strong>Precio</strong></TableCell>
                  <TableCell><strong>Cantidad</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosFiltrados.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.producto}</TableCell>
                    <TableCell>{item.clave}</TableCell>
                    <TableCell>
                      {editando === item.producto ? (
                        <TextField
                          value={editarData.precio}
                          onChange={(e) => setEditarData({ ...editarData, precio: e.target.value })}
                          size="small"
                          type="number"
                        />
                      ) : `$${item.precio}`}
                    </TableCell>
                    <TableCell>
                      {editando === item.producto ? (
                        <TextField
                          value={editarData.cantidad}
                          onChange={(e) => setEditarData({ ...editarData, cantidad: e.target.value })}
                          size="small"
                          type="number"
                        />
                      ) : item.cantidad}
                    </TableCell>
                    <TableCell>
                      {editando === item.producto ? (
                        <IconButton color="primary" onClick={() => guardarEdicion(item.producto)}>
                          <Save />
                        </IconButton>
                      ) : (
                        <IconButton color="info" onClick={() => {
                          setEditando(item.producto);
                          setEditarData({ cantidad: item.cantidad.toString(), precio: item.precio.toString() });
                        }}>
                          <Edit />
                        </IconButton>
                      )}
                      <IconButton color="error" onClick={() => eliminarProducto(item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default InventarioPorModulo;
