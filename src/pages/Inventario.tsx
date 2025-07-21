import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, IconButton, Box, TableContainer, Select, MenuItem
} from '@mui/material';
import { Edit, Delete, Save } from '@mui/icons-material';
import axios from 'axios';
import { InventarioGeneral, InventarioTelefono } from '../Types';
import { useNavigate } from "react-router-dom";

const InventarioAdmin = () => {
  const [productos, setProductos] = useState<InventarioGeneral[]>([]);
  const [telefonos, setTelefonos] = useState<InventarioTelefono[]>([]);
  const [filtro, setFiltro] = useState('');
  const [tipo, setTipo] = useState<'producto' | 'telefono'>('producto');
  const [nuevo, setNuevo] = useState({
    producto: '', clave: '', precio: '', cantidad: '', marca: '', modelo: ''
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [editarData, setEditarData] = useState({ precio: '', cantidad: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarInventario = async () => {
    const resProd = await axios.get('http://localhost:8000/inventario/inventario/general', config);
    setProductos(resProd.data);
    const resTel = await axios.get('http://localhost:8000/inventario_telefonos/inventario_telefonos/general', config);
    setTelefonos(resTel.data);
  };

  const agregar = async () => {
    try {
      if (tipo === 'producto') {
        await axios.post('http://localhost:8000/inventario/inventario/general', {
          producto: nuevo.producto,
          clave: nuevo.clave,
          precio: parseFloat(nuevo.precio),
          cantidad: parseInt(nuevo.cantidad)
        }, config);
      } else {
        await axios.post('http://localhost:8000/inventario_telefonos/inventario_telefonos/general', {
          marca: nuevo.marca,
          modelo: nuevo.modelo,
          precio: parseFloat(nuevo.precio),
          cantidad: parseInt(nuevo.cantidad)
        }, config);
      }
      setNuevo({ producto: '', clave: '', precio: '', cantidad: '', marca: '', modelo: '' });
      cargarInventario();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al agregar");
    }
  };

  const comenzarEdicion = (item: any) => {
  setEditando(`${item.tipo}-${item.id}`);
  setEditarData({
    precio: item.precio.toString(),
    cantidad: item.cantidad.toString()
  });
};

const guardarCambios = async (item: any) => {
  try {
    if (item.tipo === 'producto') {
      await axios.put(`http://localhost:8000/inventario/inventario/general/${item.id}`, {
        precio: parseFloat(editarData.precio),
        cantidad: parseInt(editarData.cantidad)
      }, config);
    } else {
      await axios.put(`http://localhost:8000/inventario_telefonos/inventario_telefonos/general/${item.id}`, {
        precio: parseFloat(editarData.precio),
        cantidad: parseInt(editarData.cantidad)
      }, config);
    }

    setEditando(null);
    setEditarData({ precio: '', cantidad: '' });
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al guardar cambios");
  }
};


const eliminarItem = async (item: any) => {
  const confirmar = window.confirm(`¿Eliminar "${item.nombre}" del inventario?`);
  if (!confirmar) return;

  try {
    if (item.tipo === 'producto') {
      await axios.delete(`http://localhost:8000/inventario/inventario/general/${item.id}`, config);
    } else {
      await axios.delete(`http://localhost:8000/inventario_telefonos/inventario_telefonos/general/${item.id}`, config);
    }

    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al eliminar");
  }
};


  const productosFiltrados = [...productos.map(p => ({
    id: p.id,
    nombre: p.producto,
    clave: p.clave,
    precio: p.precio,
    cantidad: p.cantidad,
    tipo: 'producto'
  })),
  ...telefonos.map(t => ({
    id: t.id,
    nombre: `${t.marca} ${t.modelo}`,
    clave: '',
    precio: t.precio,
    cantidad: t.cantidad,
    tipo: 'telefono'
  }))].filter((item) =>
    item.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    cargarInventario();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Inventario General</Typography>

      <TextField
        label="Buscar producto o teléfono"
        variant="outlined"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

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
            <TextField label="Marca" value={nuevo.marca} onChange={(e) => setNuevo({ ...nuevo, marca: e.target.value })} />
            <TextField label="Modelo" value={nuevo.modelo} onChange={(e) => setNuevo({ ...nuevo, modelo: e.target.value })} />
          </>
        )}
        <TextField label="Precio" type="number" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} />
        <TextField label="Cantidad" type="number" value={nuevo.cantidad} onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })} />
        <Button variant="contained" onClick={agregar}>Agregar</Button>
      </Box>

      <Button 
        variant="outlined" 
        color="secondary" 
        sx={{ mt: 2, ml: 1 }}
        onClick={() => navigate("/inventario/modulo")}
      >
        Inventario por Módulo
      </Button>

      {filtro && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Clave</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosFiltrados.map((item) => (
                <TableRow key={`${item.tipo}-${item.id}`}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.clave}</TableCell>
                  <TableCell>
                    {editando === `${item.tipo}-${item.id}` ? (
                      <TextField
                        type="number"
                        value={editarData.precio}
                        size="small"
                        onChange={(e) => setEditarData({ ...editarData, precio: e.target.value })}
                      />
                    ) : (
                      `$${item.precio}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editando === `${item.tipo}-${item.id}` ? (
                      <TextField
                        type="number"
                        value={editarData.cantidad}
                        size="small"
                        onChange={(e) => setEditarData({ ...editarData, cantidad: e.target.value })}
                      />
                    ) : (
                      item.cantidad
                    )}
                  </TableCell>
                  <TableCell>
                    {editando === `${item.tipo}-${item.id}` ? (
                      <IconButton onClick={() => guardarCambios(item)}>
                        <Save />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => comenzarEdicion(item)}>
                        <Edit />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={() => eliminarItem(item)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {productosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No se encontraron coincidencias</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default InventarioAdmin;
