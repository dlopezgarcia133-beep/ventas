import React, { useEffect, useState } from "react";
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Button
} from "@mui/material";
import axios from "axios";
import { Traspaso } from "../Types";

const TraspasosAdmin = () => {
  const [traspasos, setTraspasos] = useState<Traspaso[]>([]);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const cargarTraspasos = async () => {
    const res = await axios.get("http://localhost:8000/traspasos/traspasos", config);
    setTraspasos(res.data);
  };

  const actualizarEstado = async (id: number, estado: "aprobado" | "rechazado") => {
    try {
      await axios.put(`http://localhost:8000/traspasos/traspasos/${id}`, { estado }, config);
      cargarTraspasos();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al actualizar traspaso");
    }
  };

  useEffect(() => {
    cargarTraspasos();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Solicitudes de Traspaso</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {traspasos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.producto}</TableCell>
                <TableCell>{t.cantidad}</TableCell>
                <TableCell>{t.modulo_origen}</TableCell>
                <TableCell>{t.modulo_destino}</TableCell>
                <TableCell>{t.estado}</TableCell>
                <TableCell>{new Date(t.fecha_solicitud).toLocaleString()}</TableCell>
                <TableCell>
                  {t.estado === "pendiente" ? (
                    <>
                      <Button color="success" onClick={() => actualizarEstado(t.id, "aprobado")}>Aprobar</Button>
                      <Button color="error" onClick={() => actualizarEstado(t.id, "rechazado")}>Rechazar</Button>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {traspasos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay solicitudes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TraspasosAdmin;
