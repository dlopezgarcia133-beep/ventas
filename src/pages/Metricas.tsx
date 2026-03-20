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
  CircularProgress
} from "@mui/material";

interface MetricaEmpleado {
  empleado_id: number;
  username: string;
  total_accesorios: number;
  total_telefonos: number;
  contado: number;
  paguitos: number;
  pajoy: number;
}

const Metricas = () => {
  const [data, setData] = useState<MetricaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [rango, setRango] = useState("");

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

      setData(json.data || []);
      setRango(`${json.inicio} - ${json.fin}`);

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
  const totalAccesorios = data.reduce(
    (acc, item) => acc + (item.total_accesorios || 0),
    0
  );

  const totalTelefonos = data.reduce(
    (acc, item) => acc + (item.total_telefonos || 0),
    0
  );

  return (
    <Container sx={{ mt: 4 }}>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">
          Métricas de Empleados
        </Typography>

        <Button
          variant="contained"
          onClick={fetchMetricas}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </Box>

      {/* RANGO */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Periodo: {rango || "Cargando..."}
      </Typography>

      {/* CARDS */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2">Total Accesorios</Typography>
          <Typography variant="h6">
            ${totalAccesorios.toLocaleString()}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2">Total Teléfonos</Typography>
          <Typography variant="h6">
            ${totalTelefonos.toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* TABLA */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Empleado</strong></TableCell>
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
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Sin datos
                </TableCell>
              </TableRow>
            ) : (
              [...data] // 🔥 evita mutar el state
                .sort(
                  (a, b) =>
                    (b.total_telefonos || 0) -
                    (a.total_telefonos || 0)
                )
                .map((row) => (
                  <TableRow key={row.empleado_id}>
                    <TableCell>{row.username}</TableCell>

                    <TableCell align="right">
                      ${(row.total_accesorios || 0).toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      ${(row.total_telefonos || 0).toLocaleString()}
                    </TableCell>

                    <TableCell align="center">
                      {row.contado || 0}
                    </TableCell>

                    <TableCell align="center">
                      {row.paguitos || 0}
                    </TableCell>

                    <TableCell align="center">
                      {row.pajoy || 0}
                    </TableCell>
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