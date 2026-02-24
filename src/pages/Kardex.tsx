import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  TextField, Button, Box, MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

interface Kardex {
  id: number;
  producto: string;
  tipo_producto: string;
  cantidad: number;
  tipo_movimiento: string;
  origen?: string;
  destino?: string;
  fecha: string;
}

const Kardex = () => {

  const [data, setData] = useState<Kardex[]>([]);
  const token = localStorage.getItem('token');


  // filtros
  const [producto, setProducto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modulos, setModulos] = useState<any[]>([]);
  const [moduloId, setModuloId] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const cargarKardex = async () => {

    let params: any = {};

    if (producto) params.producto = producto;
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    if (moduloId) params.modulo_id = moduloId;

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/kardex/kardex`,
      { ...config, params }
    );

    setData(res.data);
  };

  const cargarModulos = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/registro/modulos`,
    config
  );
  setModulos(res.data);
};

  useEffect(() => {
    cargarKardex();
    cargarModulos();
  }, []);

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>

        <Box display="flex" gap={2} mt={2} flexWrap="wrap">

          <TextField
            select
            label="Módulo"
            value={moduloId}
            onChange={(e) => setModuloId(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>

            {modulos.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Producto"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            size="small"
          />

          <TextField
            label="Fecha inicio"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            size="small"
          />

          <TextField
            label="Fecha fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            size="small"
          />

          <Button
            variant="contained"
            onClick={cargarKardex}
          >
            Buscar
          </Button>

        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Historial Kardex
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Movimiento</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {new Date(row.fecha).toLocaleString()}
                </TableCell>

                <TableCell>{row.producto}</TableCell>
                <TableCell>{row.tipo_producto}</TableCell>
                <TableCell>{row.tipo_movimiento}</TableCell>
                <TableCell>{row.cantidad}</TableCell>
                <TableCell>{row.origen ?? "-"}</TableCell>
                <TableCell>{row.destino ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </TableContainer>
    </>
  );
};

export default Kardex;