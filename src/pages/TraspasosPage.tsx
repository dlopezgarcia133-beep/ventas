import React, { useEffect, useState } from "react";
import {
  Container, TextField, Button, Typography, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Box,
  Chip
} from "@mui/material";
import axios from "axios";
import { Traspaso } from "../Types";

const TraspasosEncargado = () => {
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [destino, setDestino] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);
  const [traspasos, setTraspasos] = useState<Traspaso[]>([]);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const cargarModulos = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/modulos`, config);
    setModulos(res.data.map((mod: any) => mod.nombre));
  };

  const cargarTraspasos = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/traspasos/traspasos`, config);
    setTraspasos(res.data);
  };

  const solicitarTraspaso = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/traspasos/traspasos`, {
        producto,
        cantidad: parseInt(cantidad),
        modulo_destino: destino,
      }, config);
      
      alert("Traspaso solicitado");
      setProducto(""); setCantidad(""); setDestino("");
      cargarTraspasos();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al solicitar traspaso");
    }
  };

  useEffect(() => {
    cargarModulos();
    cargarTraspasos();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Solicitar Traspaso</Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Producto"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
        />
        <TextField
          label="Cantidad"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <TextField
          select
          label="Módulo Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        >
          {modulos.map((mod) => (
            <MenuItem key={mod} value={mod}>{mod}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={solicitarTraspaso}>Enviar</Button>
      </Box>

      <Typography variant="h6" gutterBottom>Mis Solicitudes</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {traspasos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.producto}</TableCell>
                <TableCell>{t.cantidad}</TableCell>
                <TableCell>{t.modulo_destino}</TableCell>
                <TableCell>{t.estado}</TableCell>
                <TableCell>
                  <Chip
                    label={t.estado}
                    color={
                    t.estado === "aprobado"
                    ? "success"
                    : t.estado === "rechazado"
                    ? "error"
                    : "warning"
                    }
                    size="small"
                    />
                    </TableCell>
                <TableCell>{new Date(t.fecha_solicitud).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {traspasos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay solicitudes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TraspasosEncargado;