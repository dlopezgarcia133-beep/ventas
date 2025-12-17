// ARCHIVO ACTUALIZADO
// Se agregó: ENTRADA DE MERCANCÍA por lote (array + guardar al final)
// No se rompe conteo físico ni lógica existente

import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, MenuItem, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, IconButton, Box, TableContainer,
  Select, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete, Save } from '@mui/icons-material';
import axios from 'axios';
import { InventarioModulo, Modulo } from '../Types';

interface ConteoItem {
  producto_id: number;
  producto: string;
  clave: string;
  cantidad: number;
}

type ModoOperacion = 'normal' | 'conteo' | 'entrada';

const InventarioPorModulo = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<number | ''>('');
  const [inventario, setInventario] = useState<InventarioModulo[]>([]);
  const [filtro, setFiltro] = useState('');

  // === MODO ===
  const [modo, setModo] = useState<ModoOperacion>('normal');

  // === CONTEO / ENTRADA ===
  const [busquedaClave, setBusquedaClave] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState<any | null>(null);
  const [cantidadConteo, setCantidadConteo] = useState('');
  const [conteoLista, setConteoLista] = useState<ConteoItem[]>([]);
  const [entradaLista, setEntradaLista] = useState<ConteoItem[]>([]);
  const [editarIndex, setEditarIndex] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarModulos = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/modulos`, config);
    setModulos(res.data);
  };

  const cargarInventario = async () => {
    if (!moduloSeleccionado) return;
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/inventario/modulo?modulo_id=${moduloSeleccionado}`,
      config
    );
    setInventario(res.data);
  };

  // === CONGELAR ===
  const congelarInventario = async () => {
    if (!moduloSeleccionado) return alert('Selecciona un módulo');

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/inventario/congelar/${moduloSeleccionado}`,
      { ...config, responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_modulo_${moduloSeleccionado}.xlsx`;
    link.click();

    setModo('conteo');
    cargarInventario();
  };

  // === BUSCAR PRODUCTO ===
  const buscarProducto = async () => {
    if (!busquedaClave || !moduloSeleccionado) return;

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/inventario/buscar?modulo_id=${moduloSeleccionado}&clave=${busquedaClave}`,
      config
    );

    if (!res.data.ok) return alert('Producto no encontrado');

    setProductoEncontrado(res.data.producto);
    setCantidadConteo('');
  };

  // === AGREGAR A CONTEO ===
  const agregarAConteo = () => {
    if (!productoEncontrado?.id) return alert('Producto inválido');

    const cantidad = parseInt(cantidadConteo, 10);
    if (isNaN(cantidad) || cantidad < 0) return alert('Cantidad inválida');

    const fila: ConteoItem = {
      producto_id: productoEncontrado.id,
      producto: productoEncontrado.producto,
      clave: productoEncontrado.clave,
      cantidad
    };

    setConteoLista(prev => {
      const idx = prev.findIndex(p => p.producto_id === fila.producto_id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = fila;
        return copy;
      }
      return [...prev, fila];
    });

    limpiarBusqueda();
  };

  // === AGREGAR A ENTRADA ===
  const agregarAEntrada = () => {
    if (!productoEncontrado?.id) return alert('Producto inválido');

    const cantidad = parseInt(cantidadConteo, 10);
    if (isNaN(cantidad) || cantidad <= 0) return alert('Cantidad inválida');

    const fila: ConteoItem = {
      producto_id: productoEncontrado.id,
      producto: productoEncontrado.producto,
      clave: productoEncontrado.clave,
      cantidad
    };

    setEntradaLista(prev => {
      const idx = prev.findIndex(p => p.producto_id === fila.producto_id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].cantidad += cantidad; // SUMA
        return copy;
      }
      return [...prev, fila];
    });

    limpiarBusqueda();
  };

  const limpiarBusqueda = () => {
    setProductoEncontrado(null);
    setBusquedaClave('');
    setCantidadConteo('');
    setEditarIndex(null);
  };

  // === GUARDAR ===
  const guardarOperacion = async () => {
    const lista = modo === 'conteo' ? conteoLista : entradaLista;
    if (lista.length === 0) return alert('No hay productos');
    setConfirmOpen(true);
  };

  const confirmarGuardar = async () => {
    setConfirmOpen(false);
    setGuardando(true);

    const endpoint = modo === 'conteo'
      ? '/inventario/guardar_conteo'
      : '/inventario/entrada_mercancia';

    const lista = modo === 'conteo' ? conteoLista : entradaLista;

    await axios.post(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      { modulo_id: moduloSeleccionado, productos: lista },
      config
    );

    alert('Operación guardada correctamente');
    setConteoLista([]);
    setEntradaLista([]);
    setModo('normal');
    cargarInventario();
    setGuardando(false);
  };

  useEffect(() => { cargarModulos(); }, []);
  useEffect(() => { cargarInventario(); }, [moduloSeleccionado]);

  const listaActual = modo === 'conteo' ? conteoLista : entradaLista;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5">Inventario por módulo</Typography>

      <TextField
        select
        label="Módulo"
        value={moduloSeleccionado}
        onChange={e => setModuloSeleccionado(Number(e.target.value))}
        fullWidth
        sx={{ my: 2 }}
      >
        {modulos.map(m => (
          <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
        ))}
      </TextField>

      <Box display="flex" gap={2} mb={3}>
        <Button variant="contained" color="warning" onClick={congelarInventario}>
          Congelar Inventario
        </Button>
        <Button variant="contained" color="info" onClick={() => setModo('entrada')}>
          Entrada de mercancía
        </Button>
      </Box>

      {modo !== 'normal' && (
        <Box border="1px solid #ccc" p={2} borderRadius={2}>
          <Typography variant="h6">
            {modo === 'conteo' ? 'Conteo físico' : 'Entrada de mercancía'}
          </Typography>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Buscar clave"
              value={busquedaClave}
              onChange={e => setBusquedaClave(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarProducto()}
            />
            <Button onClick={buscarProducto}>Buscar</Button>
          </Box>

          {productoEncontrado && (
            <Box mt={2}>
              <Typography>
                {productoEncontrado.clave} ({productoEncontrado.producto})
              </Typography>
              <TextField
                label="Cantidad"
                type="number"
                value={cantidadConteo}
                onChange={e => setCantidadConteo(e.target.value)}
              />
              <Button
                sx={{ ml: 2 }}
                onClick={modo === 'conteo' ? agregarAConteo : agregarAEntrada}
              >
                Agregar
              </Button>
            </Box>
          )}

          {listaActual.length > 0 && (
            <>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Clave</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaActual.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.clave}</TableCell>
                      <TableCell>{p.producto}</TableCell>
                      <TableCell>{p.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={guardarOperacion}
              >
                Guardar
              </Button>
            </>
          )}
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas guardar los cambios?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarGuardar} disabled={guardando} variant="contained">
            {guardando ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventarioPorModulo;
