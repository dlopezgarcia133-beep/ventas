import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Divider, Button,
  Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import { ComisionData } from "../Types";
import { useNavigate } from "react-router-dom";

const ComisionesUsuario = () => {
  const [data, setData] = useState<ComisionData | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:8000/ventas/comisiones/ciclo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <Typography>Cargando...</Typography>;

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Ciclo de comisión: {data.inicio_ciclo} al {data.fin_ciclo}
      </Typography>
      <Typography variant="subtitle1">
        Pago programado para el: <strong>{data.fecha_pago}</strong>
      </Typography>
      <Divider sx={{ my: 2 }} />

      {/* ACCESORIOS */}
      <Typography variant="subtitle1">🧩 Accesorios: ${data.total_accesorios.toFixed(2)}</Typography>
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Comisión</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.ventas_accesorios.map((v, i) => (
            <TableRow key={i}>
              <TableCell>{v.producto}</TableCell>
              <TableCell>{v.cantidad}</TableCell>
              <TableCell>${v.comision.toFixed(2)}</TableCell>
              <TableCell>{v.fecha}</TableCell>
              <TableCell>{v.hora}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* TELÉFONOS */}
      <Typography variant="subtitle1">📱 Teléfonos: ${data.total_telefonos.toFixed(2)}</Typography>
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Marca</TableCell>
            <TableCell>Modelo</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Comisión</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.ventas_telefonos.map((v, i) => (
            <TableRow key={i}>
              <TableCell>{v.marca}</TableCell>
              <TableCell>{v.modelo}</TableCell>
              <TableCell>{v.tipo}</TableCell>
              <TableCell>${v.comision.toFixed(2)}</TableCell>
              <TableCell>{v.fecha}</TableCell>
              <TableCell>{v.hora}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="subtitle1">🔌 Chips: ${data.total_chips.toFixed(2)}</Typography>


      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">💵 Total: ${data.total_general.toFixed(2)}</Typography>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => navigate("/comisiones")}
      >
        Lista de comisiones
      </Button>
    </Paper>
  );
};

export default ComisionesUsuario;
