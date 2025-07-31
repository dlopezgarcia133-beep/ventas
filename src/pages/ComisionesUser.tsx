import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Divider, Button,
  Table, TableBody, TableCell, TableHead, TableRow, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ComisionData } from "../Types";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const ComisionesUsuario = () => {
  const [data, setData] = useState<ComisionData | null>(null);
  const [modo, setModo] = useState<"actual" | "personalizado">("actual");
  const [inicio, setInicio] = useState<any>(null);
  const [fin, setFin] = useState<any>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchCicloActual = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/comisiones/ciclo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(res.data);
  };

  const fetchCicloPorFechas = async () => {
    if (!inicio || !fin) return;
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/comisiones/comisiones/ciclo_por_fechas`, {
      params: {
        inicio: dayjs(inicio).format("YYYY-MM-DD"),
        fin: dayjs(fin).format("YYYY-MM-DD")
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(res.data);
  };

  useEffect(() => {
    if (modo === "actual") fetchCicloActual();
  }, [modo]);

  const handleBuscar = () => {
    if (modo === "personalizado") fetchCicloPorFechas();
  };

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <ToggleButtonGroup
        value={modo}
        exclusive
        onChange={(_, v) => v && setModo(v)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="actual">Ciclo Actual</ToggleButton>
        <ToggleButton value="personalizado">Buscar por Fechas</ToggleButton>
      </ToggleButtonGroup>

      {modo === "personalizado" && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Inicio del ciclo" value={inicio} onChange={setInicio} />
          <DatePicker label="Fin del ciclo" value={fin} onChange={setFin} />
          </LocalizationProvider>
          <Button variant="contained" onClick={handleBuscar}>Buscar</Button>
        </Box>
      )}

      {!data ? <Typography>Cargando...</Typography> : (
        <>
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

          {/* CHIPS */}
          <Typography variant="subtitle1">🔌 Chips: ${data.total_chips.toFixed(2)}</Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Comisión</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.ventas_chips && data.ventas_chips.map((v, i) => (
                <TableRow key={i}>
                  <TableCell>{v.tipo_chip}</TableCell>
                  <TableCell>${v.comision.toFixed(2)}</TableCell>
                  <TableCell>{v.fecha}</TableCell>
                  <TableCell>{v.hora}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
        </>
      )}
    </Paper>
  );
};

export default ComisionesUsuario;
