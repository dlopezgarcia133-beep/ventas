import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Box,
  CircularProgress,
  Grid
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

interface MetricaEmpleado {
  empleado_id: number;
  empleado: string;
  total_ventas: number;
  total_accesorios: number;
  total_telefonos: number;
  contado: number;
  paguitos: number;
  pajoy: number;
}

const Metricas = () => {
  const [data, setData] = useState<MetricaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMetricas = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/metricas/empleados`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json();
      setData(json);

    } catch (error) {
      console.error("Error cargando métricas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
  }, []);

  // 🔥 Totales generales
  const totalVentas = data.reduce((acc, i) => acc + (i.total_ventas || 0), 0);
  const totalAccesorios = data.reduce((acc, i) => acc + (i.total_accesorios || 0), 0);
  const totalTelefonos = data.reduce((acc, i) => acc + (i.total_telefonos || 0), 0);

  return (
    <Container sx={{ mt: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Dashboard de Métricas</Typography>
        <Button variant="contained" onClick={fetchMetricas}>
          Actualizar
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Ventas Totales</Typography>
            <Typography variant="h5">${totalVentas.toLocaleString()}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Accesorios</Typography>
            <Typography variant="h5">${totalAccesorios.toLocaleString()}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Teléfonos</Typography>
            <Typography variant="h5">${totalTelefonos.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* GRÁFICA */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>Ventas por Empleado</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="empleado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_ventas" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* TABLA */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Empleado</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="right"><strong>Accesorios</strong></TableCell>
              <TableCell align="right"><strong>Teléfonos</strong></TableCell>
              <TableCell align="center"><strong>Contado</strong></TableCell>
              <TableCell align="center"><strong>Paguitos</strong></TableCell>
              <TableCell align="center"><strong>Pajoy</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Sin datos
                </TableCell>
              </TableRow>
            ) : (
              [...data]
                .sort((a, b) => (b.total_ventas || 0) - (a.total_ventas || 0))
                .map((row) => (
                  <TableRow key={row.empleado_id}>
                    <TableCell>{row.empleado}</TableCell>

                    <TableCell align="right">
                      ${(row.total_ventas || 0).toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      ${(row.total_accesorios || 0).toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      ${(row.total_telefonos || 0).toLocaleString()}
                    </TableCell>

                    <TableCell align="center">{row.contado || 0}</TableCell>
                    <TableCell align="center">{row.paguitos || 0}</TableCell>
                    <TableCell align="center">{row.pajoy || 0}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Metricas;
