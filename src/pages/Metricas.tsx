import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02"];

const Metricas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/metricas/empleados`);
      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAccesorios = data.reduce((a, i) => a + (i.total_accesorios || 0), 0);
  const totalTelefonos = data.reduce((a, i) => a + (i.total_telefonos || 0), 0);
  const totalGeneral = totalAccesorios + totalTelefonos;

  const ventasCount = data.reduce(
    (a, i) => a + (i.contado || 0) + (i.paguitos || 0) + (i.pajoy || 0),
    0
  );

  const ticketPromedio = ventasCount ? totalGeneral / ventasCount : 0;

  const dataGrafica = data.map((i) => ({
    empleado: i.username,
    total: (i.total_accesorios || 0) + (i.total_telefonos || 0)
  }));

  const dataPie = [
    { name: "Contado", value: data.reduce((a, i) => a + i.contado, 0) },
    { name: "Paguitos", value: data.reduce((a, i) => a + i.paguitos, 0) },
    { name: "Pajoy", value: data.reduce((a, i) => a + i.pajoy, 0) }
  ];

  const top = [...data]
    .sort((a, b) => (b.total_telefonos + b.total_accesorios) - (a.total_telefonos + a.total_accesorios))
    .slice(0, 5);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Pro
      </Typography>

      <Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={2} mb={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">Ventas Totales</Typography>
          <Typography variant="h6">${totalGeneral.toLocaleString()}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">Accesorios</Typography>
          <Typography variant="h6">${totalAccesorios.toLocaleString()}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">Teléfonos</Typography>
          <Typography variant="h6">${totalTelefonos.toLocaleString()}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">Ticket Promedio</Typography>
          <Typography variant="h6">${ticketPromedio.toFixed(2)}</Typography>
        </Paper>
      </Box>

      <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2} mb={3}>
        <Paper sx={{ p: 2 }}>
          <Typography>Ventas por empleado</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataGrafica}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="empleado" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography>Tipo de venta</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataPie} dataKey="value" nameKey="name" outerRadius={100}>
                {dataPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Top Empleados</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          top.map((e, i) => (
            <Box key={i} display="flex" justifyContent="space-between" py={1}>
              <Typography>{e.username}</Typography>
              <Typography>
                ${(e.total_accesorios + e.total_telefonos).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default Metricas;
