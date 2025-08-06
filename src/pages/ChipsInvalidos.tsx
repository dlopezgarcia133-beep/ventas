import React, { useEffect, useState } from "react";
import axios from "axios";
import { VentaChip } from "../Types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const ChipsRechazados = () => {
  const [rechazados, setRechazados] = useState<VentaChip[]>([]);
  const token = localStorage.getItem("token");

  const fetchRechazados = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/chips_rechazados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRechazados(res.data);
    } catch (err) {
      console.error("Error al obtener chips rechazados:", err);
    }
  };

  useEffect(() => {
    fetchRechazados();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Chips Rechazados</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Motivo de Rechazo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rechazados.map((chip) => (
            <TableRow key={chip.id}>
              <TableCell>{chip.empleado?.username ?? "Empleado eliminado"}</TableCell>
              <TableCell>{chip.numero_telefono}</TableCell>
              <TableCell>{chip.fecha}</TableCell>
              <TableCell>{chip.descripcion_rechazo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChipsRechazados;
