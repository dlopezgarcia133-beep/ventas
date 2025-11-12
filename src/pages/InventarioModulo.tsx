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
  const [moduloSeleccionado, setModuloSeleccionado] = useState<number | ''>('');
  const [filtro, setFiltro] = useState('');
  const [inventario, setInventario] = useState<InventarioModulo[]>([]);
  const [nuevo, setNuevo] = useState({ producto: '', clave: '', cantidad: '', precio: '' });
  const [tipo, setTipo] = useState<'producto' | 'telefono'>('producto');
  const [nuevoTelefono, setNuevoTelefono] = useState({ producto: '', clave: '', cantidad: '', precio: '', marca: '', modelo: '' });
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [nuevaCantidad, setNuevaCantidad] = useState<string>("");
  const [editando, setEditando] = useState<string | null>(null);
  const [editarData, setEditarData] = useState({ cantidad: '', precio: '' });
  const [modificaciones, setModificaciones] = useState<{ id: number; producto: string; cantidad: number }[]>([]);
  const [busquedaClave, setBusquedaClave] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState<any | null>(null);
  const [cantidadConteo, setCantidadConteo] = useState("");
  const [conteoLista, setConteoLista] = useState<{ producto_id: number; producto: string; clave: string; cantidad: number }[]>([]);


  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarModulos = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/modulos`, config);
    setModulos(res.data);
  };

  const cargarInventario = async () => {
    if (!moduloSeleccionado) return;
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/inventario/inventario/modulo?modulo_id=${moduloSeleccionado}`, config);
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
  modulo_id: moduloSeleccionado
});
      await axios.post(`${process.env.REACT_APP_API_URL}/inventario/inventario/modulo`, {
        producto: nuevo.producto,
        clave: nuevo.clave,
        cantidad: parseInt(nuevo.cantidad),
        precio: parseFloat(nuevo.precio),
        modulo_id: moduloSeleccionado,
      }, config);
    } else {
      await axios.post(`${process.env.REACT_APP_API_URL}/inventario_telefonos/inventario_telefonos/modulo`, {
        marca: nuevoTelefono.marca,
        modelo: nuevoTelefono.modelo,
        cantidad: parseInt(nuevo.cantidad),
        precio: parseFloat(nuevo.precio),
        modulo_id: moduloSeleccionado,
      }, config);
    }

    setNuevoTelefono({ producto: '', clave: '', cantidad: '', precio: '', marca: '', modelo: '' });
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al agregar");
  }
};




const congelarInventario = async () => {
  if (!moduloSeleccionado) {
    alert("Selecciona un módulo primero");
    return;
  }

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/inventario/congelar/${moduloSeleccionado}`,
      {
        ...config,
        responseType: 'blob'  // Para descargar archivo
      }
    );

    // Crear descarga del archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', `inventario_modulo_${moduloSeleccionado}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    alert("Inventario congelado correctamente. Todo se ha puesto en 0.");
    cargarInventario();
  } catch (err) {
    alert("Error al congelar inventario");
  }
};




const buscarProducto = async () => {
  if (!busquedaClave || !moduloSeleccionado) return;

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/inventario/buscar?modulo_id=${moduloSeleccionado}&clave=${busquedaClave}`,
      config
    );

    if (!res.data.ok) {
      alert("Producto no encontrado");
      return;
    }

    setProductoEncontrado(res.data.producto);
  } catch {
    alert("Error en la búsqueda");
  }
};




const agregarAConteo = () => {
  if (!productoEncontrado) {
    alert("Primero busca un producto");
    return;
  }

  if (!cantidadConteo || parseInt(cantidadConteo) < 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  setConteoLista(prev => [
    ...prev,
    {
      producto_id: productoEncontrado.id,
      producto: productoEncontrado.clave,
      clave: productoEncontrado.clave,
      cantidad: parseInt(cantidadConteo)
    }
  ]);

  setProductoEncontrado(null);
  setCantidadConteo("");
  setBusquedaClave("");
};




const guardarConteo = async () => {
  if (conteoLista.length === 0) {
    alert("No has agregado productos al conteo");
    return;
  }

  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/inventario/guardar_conteo`,
      {
        modulo_id: moduloSeleccionado,
        productos: conteoLista.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad
        }))
      },
      config
    );

    alert("Inventario actualizado con éxito");
    setConteoLista([]);
    cargarInventario();
  } catch (err) {
    alert("Error al guardar conteo");
  }
};



const manejarArchivoExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!moduloSeleccionado) {
    alert("Primero selecciona un módulo.");
    return;
  }

  const archivo = e.target.files?.[0];
  if (!archivo) return;

  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("modulo_id", moduloSeleccionado.toString());

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/inventario/actualizar_inventario_excel`,
      formData,
      {
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    alert(res.data.message);
    cargarInventario(); // recargar datos actualizados
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al procesar el archivo Excel");
  }

  // Limpiar input
  e.target.value = "";
};






const actualizarCantidad = async () => {
  if (!selectedItem) {
    alert("Selecciona un producto de la tabla primero");
    return;
  }

  try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/inventario/inventario/modulo/${encodeURIComponent(selectedItem.producto)}`,
        { cantidad: parseInt(nuevaCantidad), modulo_id: moduloSeleccionado },
        config
      );
    console.log("Voy a actualizar:", selectedItem.producto, "con cantidad:", nuevaCantidad, "modulo:", moduloSeleccionado);


    setNuevaCantidad("");
    setSelectedItem(null);
    cargarInventario();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al actualizar cantidad");
  }
};


  const guardarEdicion = async (producto: string) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/inventario/inventario/modulo/${encodeURIComponent(producto)}`, {
        cantidad: parseInt(editarData.cantidad),
        precio: parseFloat(editarData.precio),
        modulo_id: moduloSeleccionado
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
      await axios.delete(`${process.env.REACT_APP_API_URL}/inventario/inventario/modulo/${id}?modulo=${moduloSeleccionado}`, config);
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
        onChange={(e) => setModuloSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
        fullWidth
        sx={{ mb: 3 }}
      >
        {modulos.map((m) => (
          <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
        ))}
      </TextField>
      

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

<Button variant="contained" color="warning" sx={{ mb: 3 }} onClick={congelarInventario}>
  Congelar Inventario (Descargar Excel)
</Button>



      <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 4 }}>
  <Typography variant="h6">Conteo físico</Typography>

  <Box display="flex" gap={2} mt={2}>
    <TextField
      label="Buscar clave"
      value={busquedaClave}
      onChange={(e) => setBusquedaClave(e.target.value)}
    />
    <Button variant="contained" onClick={buscarProducto}>Buscar</Button>
  </Box>

  {productoEncontrado && (
    <Box mt={2}>
      <Typography><strong>Producto:</strong> {productoEncontrado.clave}</Typography>

      <TextField
        label="Cantidad contada"
        type="number"
        value={cantidadConteo}
        onChange={(e) => setCantidadConteo(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Button variant="contained" sx={{ ml: 2, mt: 2 }} onClick={agregarAConteo}>
        Agregar a lista
      </Button>
    </Box>
  )}

  {conteoLista.length > 0 && (
    <Box mt={3}>
      <Typography><strong>Productos agregados:</strong></Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Clave</TableCell>
            <TableCell>Cantidad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {conteoLista.map((p, idx) => (
            <TableRow key={idx}>
              <TableCell>{p.clave}</TableCell>
              <TableCell>{p.cantidad}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={guardarConteo}>
        Guardar inventario contado
      </Button>
    </Box>
  )}
</Box>



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
                  <TableRow
                    key={item.id}
                    hover
                    selected={selectedItem?.id === item.id}
                    onClick={() => setSelectedItem(item)}
                    sx={{ cursor: "pointer" }}
                  >
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
