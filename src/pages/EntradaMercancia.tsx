import React, { useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { CircularProgress } from "@mui/material";
import axios from "axios";

interface Props {
  moduloSeleccionado: number;
  config: any;
  cargarInventario: () => void;
  setModo: (modo: any) => void;
}

const EntradaMercancia = ({ moduloSeleccionado, config, cargarInventario, setModo }: Props) => {

  const [busquedaEntrada, setBusquedaEntrada] = useState("");
  const [productoEntrada, setProductoEntrada] = useState<any | null>(null);
  const [cantidadEntrada, setCantidadEntrada] = useState("");
  const [entradaLista, setEntradaLista] = useState<any[]>([]);
  const [guardandoEntrada, setGuardandoEntrada] = useState(false);
  const [opcionesProductos, setOpcionesProductos] = useState<any[]>([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [existenciaActual, setExistenciaActual] = useState(0);

  const inputBusquedaRef = useRef<HTMLInputElement>(null);
  const inputCantidadRef = useRef<HTMLInputElement>(null);

  const buscarProductosEntrada = async (texto: string) => {
    if (!texto || texto.length < 2) return;

    try {
      setLoadingBusqueda(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventario/inventario/buscar-autocomplete`,
        {
          params: { modulo_id: moduloSeleccionado, q: texto },
          ...config
        }
      );
      setOpcionesProductos(res.data);
    } finally {
      setLoadingBusqueda(false);
    }
  };

  const obtenerExistenciaModulo = async (clave: string) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventario/inventario/modulo/${moduloSeleccionado}/existencia`,
        { params: { clave }, ...config }
      );
      return res.data.existencia_actual;
    } catch {
      return 0;
    }
  };

  const agregarEntrada = () => {
    if (!productoEntrada) return alert("Selecciona un producto");

    const cantidad = parseInt(cantidadEntrada);
    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

    setEntradaLista(prev => {
      const index = prev.findIndex(p => p.clave === productoEntrada.clave);

      const nuevo = {
        producto_id: productoEntrada.id,
        producto: productoEntrada.producto,
        clave: productoEntrada.clave,
        cantidad,
        existencia_actual: existenciaActual
      };

      if (index !== -1) {
        const copy = [...prev];
        copy[index].cantidad += cantidad;
        return copy;
      }

      return [...prev, nuevo];
    });

    setProductoEntrada(null);
    setCantidadEntrada("");
  };

  const guardarEntradaMercancia = async () => {
    if (entradaLista.length === 0) return alert("Lista vacía");

    setGuardandoEntrada(true);

    try {
      const payload = {
        modulo_id: moduloSeleccionado,
        productos: entradaLista.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad
        }))
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/inventario/inventario/entrada_mercancia`,
        payload,
        config
      );

      if (res.data.ok) {
        alert("Entrada guardada");
        setEntradaLista([]);
        cargarInventario();
        setModo("normal");
      }
    } finally {
      setGuardandoEntrada(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Entrada de mercancía</Typography>

      <Autocomplete
        options={opcionesProductos}
        loading={loadingBusqueda}
        value={productoEntrada}
        inputValue={busquedaEntrada}
        onChange={async (e, value) => {
          setProductoEntrada(value);
          if (!value) return;
          const existencia = await obtenerExistenciaModulo(value.clave);
          setExistenciaActual(existencia);
        }}
        onInputChange={(e, value) => {
          setBusquedaEntrada(value);
          buscarProductosEntrada(value);
        }}
        getOptionLabel={(o) => `${o.clave} - ${o.producto}`}
        renderInput={(params) => (
          <TextField {...params} label="Buscar producto" />
        )}
      />

      {productoEntrada && (
        <>
          <TextField
            label="Cantidad"
            type="number"
            value={cantidadEntrada}
            onChange={(e) => setCantidadEntrada(e.target.value)}
          />
          <Button onClick={agregarEntrada}>Agregar</Button>
        </>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Clave</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entradaLista.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.clave}</TableCell>
              <TableCell>{p.producto}</TableCell>
              <TableCell>{p.cantidad}</TableCell>
              <TableCell>
                <IconButton onClick={() => setEntradaLista(prev => prev.filter((_, idx) => idx !== i))}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button onClick={guardarEntradaMercancia} disabled={guardandoEntrada}>
        Guardar entrada
      </Button>
    </Box>
  );
};

export default EntradaMercancia;