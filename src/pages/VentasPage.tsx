import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography, Autocomplete, Alert, Paper
} from '@mui/material';
import axios from 'axios';

const FormularioVenta = () => {
  const [productos, setProductos] = useState<string[]>([]);
  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Obtener nombres de productos
    const fetchProductos = async () => {
        const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8000/inventario/inventario/general/productos-nombres', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(res.data);
        console.log("Productos cargados:", res.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };

    fetchProductos();
  }, []);

  // Cargar precio al seleccionar producto
   useEffect(() => {
     const fetchPrecio = async () => {
         const token = localStorage.getItem('token');
       if (producto) {
         try {
           const res = await axios.get(`http://localhost:8000/inventario/inventario/general/${encodeURIComponent(producto)}`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           setPrecio(res.data.precio);
           console.log("Buscando precio para:", producto);

         } catch (err) {
           setPrecio(null);
           setMensaje({ tipo: 'error', texto: 'Producto no encontrado en inventario.' });
           console.error("Error al obtener precio:", err);
         }
       }
     };

     fetchPrecio();
   }, [producto]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:8000/ventas/ventas', {
        producto,
        cantidad,
        precio: precio,
        correo_cliente: correo,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje({ tipo: 'success', texto: 'Venta registrada con éxito.' });
      setProducto('');
      setCantidad(1);
      setCorreo('');
      setPrecio(null);
    } catch (err: any) {
      const detalle = err?.response?.data?.detail || 'Error al registrar venta.';
      setMensaje(err.response.data.detail);
      console.error("Error al registrar venta:", err);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
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
        label="Correo del cliente"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        sx={{ mt: 2 }}
        disabled={!producto || !precio || cantidad <= 0}
      >
        Registrar Venta
      </Button>
    </Paper>
  );
};

export default FormularioVenta;

