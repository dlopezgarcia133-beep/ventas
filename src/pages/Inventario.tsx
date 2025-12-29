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
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState<string>("");

  const [previewValido, setPreviewValido] = useState<any[]>([]);
const [previewErrores, setPreviewErrores] = useState<any[]>([]);
const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
const [mostrandoPreview, setMostrandoPreview] = useState(false);




  const cargarInventario = async () => {
    const resProd = await axios.get(`${process.env.REACT_APP_API_URL}/inventario/inventario/general`, config);
    setProductos(resProd.data);
    const resTel = await axios.get(`${process.env.REACT_APP_API_URL}/inventario_telefonos/inventario_telefonos/general`, config);
    setTelefonos(resTel.data);
  };

  const agregar = async () => {
    try {
      if (tipo === 'producto') {
        await axios.post(`${process.env.REACT_APP_API_URL}/inventario/inventario/general`, {
          producto: nuevo.producto,
          clave: nuevo.clave,
          precio: parseFloat(nuevo.precio),
          cantidad: parseInt(nuevo.cantidad),
          tipo_producto: 'producto',
        }, config);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/inventario/inventario/general`, {
          producto: nuevo.producto,
          clave: nuevo.clave,
          precio: parseFloat(nuevo.precio),
          cantidad: parseInt(nuevo.cantidad),
          tipo_producto: 'telefono',
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
    
      await axios.put(`${process.env.REACT_APP_API_URL}/inventario/inventario/general/${item.id}`, {
        cantidad: parseInt(editarData.cantidad)
      }, config);

    setEditando(null);
    setEditarData({ precio: '', cantidad: '' });
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al guardar cambios");
  }
};




const actualizarCantidad = async () => {
  if (!selectedItem) {
    alert("Selecciona un producto de la tabla primero");
    return;
  }

  try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/inventario/inventario/general/${encodeURIComponent(selectedItem.nombre)}`,
        { cantidad: parseInt(nuevaCantidad) },
        config
      );
    

    setNuevaCantidad("");
    setSelectedItem(null);
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al actualizar cantidad");
  }
};


const eliminarItem = async (item: any) => {
  const confirmar = window.confirm(`¿Eliminar "${item.nombre}" del inventario?`);
  if (!confirmar) return;

  try {
    if (item.tipo === 'producto') {
      await axios.delete(`${process.env.REACT_APP_API_URL}/inventario/inventario/general/${item.id}`, config);
    } else {
      await axios.delete(`${process.env.REACT_APP_API_URL}/inventario_telefonos/inventario_telefonos/general/${item.id}`, config);
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



  const manejarPreviewExcel = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  setArchivoExcel(file);

  const formData = new FormData();
  formData.append("archivo", file);

  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/inventario/preview_excel_general`,
    formData
    config
  );

  setPreviewValido(res.data.validas);
  setPreviewErrores(res.data.errores);
  setMostrandoPreview(true);
};


const confirmarImportacion = async () => {
  if (!archivoExcel) {
    alert("Falta archivo");
    return;
  }

  const formData = new FormData();
  formData.append("archivo", archivoExcel);

  await axios.post(
    `${process.env.REACT_APP_API_URL}/inventario/actualizar_inventario_excel_general`,
    formData
    config
  );

  alert("Inventario general actualizado");
  cargarInventario();
  setMostrandoPreview(false);
};


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

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Nueva cantidad"
          type="number"
          value={nuevaCantidad}
          onChange={(e) => setNuevaCantidad(e.target.value)}
        />
        <Button variant="contained" onClick={actualizarCantidad}>
          Actualizar Cantidad
        </Button>
      </Box>


<TextField
        type="file"
        inputProps={{ accept: ".xlsx,.xls" }}
        onChange={manejarPreviewExcel}
        variant="outlined"
        sx={{ mb: 3 }}
      />

      {mostrandoPreview && previewValido.length > 0 && (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mt={3}
    p={2}
    bgcolor="#f5f5f5"
    borderRadius={2}
  >
    <Typography color="text.secondary">
      Se importarán {previewValido.length} productos
      {previewErrores.length > 0 && ` (${previewErrores.length} con errores)`}
    </Typography>

    <Button
      variant="contained"
      color="success"
      size="large"
      onClick={confirmarImportacion}
    >
      Confirmar importación
    </Button>
  </Box>
)}



      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Select value={tipo} onChange={(e) => setTipo(e.target.value as 'producto' | 'telefono')}>
          <MenuItem value="producto">Producto</MenuItem>
          <MenuItem value="telefono">Teléfono</MenuItem>
          </Select>
            <TextField label="Producto" value={nuevo.producto} onChange={(e) => setNuevo({ ...nuevo, producto: e.target.value })} />
            <TextField label="Clave" value={nuevo.clave} onChange={(e) => setNuevo({ ...nuevo, clave: e.target.value })} />
        
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
                <TableRow
                  key={`${item.tipo}-${item.id}`}
                  hover
                  selected={selectedItem?.id === item.id && selectedItem?.tipo === item.tipo}
                  onClick={() => setSelectedItem(item)}
                  sx={{ cursor: "pointer" }}
                >
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
      <button 
  onClick={() => navigate("/inventario/diferencias")}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Reporte de inventarios
</button>
    </Container>
  );
};

export default InventarioAdmin;
