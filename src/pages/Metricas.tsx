import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  TextField,
  MenuItem,
  Button
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
  LineChart,
  Line,
  Cell
} from "recharts";

interface MetricaEmpleado {
  empleado_id: number;
  username: string;
  total_accesorios: number;
  total_telefonos: number;
  contado: number;
  paguitos: number;
  pajoy: number;
}

const COLORS = ["#1976d2", "#ed6c02", "#2e7d32"];

const Metricas = () => {
  const [data, setData] = useState<MetricaEmpleado[]>([]);
  const [ventasDia, setVentasDia] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());

  const [ventasModulo, setVentasModulo] = useState<any[]>([]);

  const API = process.env.REACT_APP_API_URL;

  const fetchDataWithDates = async (inicio?: string, fin?: string) => {
  setLoading(true);

  try {
    let url = `${process.env.REACT_APP_API_URL}/dashboard/metricas/empleados?`;

    if (inicio && fin) {
      url += `fecha_inicio=${inicio}&fecha_fin=${fin}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    const res2 = await fetch(
      `${process.env.REACT_APP_API_URL}/dashboard/ventas-por-dia?fecha_inicio=${inicio}&fecha_fin=${fin}`
    );
    const json2 = await res2.json();

    const res3 = await fetch(
      `${process.env.REACT_APP_API_URL}/dashboard/top-productos?fecha_inicio=${inicio}&fecha_fin=${fin}`
    );
    const json3 = await res3.json();
    const res4 = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/ventas-por-modulo?fecha_inicio=${inicio}&fecha_fin=${fin}`
    );
      const json4 = await res4.json();

      setVentasModulo(Array.isArray(json4) ? json4 : []);

      setData(Array.isArray(json.data) ? json.data : []);
    setVentasDia(Array.isArray(json2) ? json2 : []);
    setTopProductos(Array.isArray(json3) ? json3 : []);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const format = (d: Date) => d.toISOString().split("T")[0];

        setFechaInicio(format(inicioMes));
        setFechaFin(format(hoy));

        // 👇 importante: manda fechas desde el inicio
        setTimeout(() => {
            fetchDataWithDates(format(inicioMes), format(hoy));
        }, 0);

    }, []);

  // 🔥 KPIs
  const totalAccesorios = data.reduce((a, i) => a + (i.total_accesorios || 0), 0);
  const totalTelefonos = data.reduce((a, i) => a + (i.total_telefonos || 0), 0);
  const totalGeneral = totalAccesorios + totalTelefonos;

  const ventasCount = data.reduce(
    (a, i) => a + (i.contado || 0) + (i.paguitos || 0) + (i.pajoy || 0),
    0
  );

  const ticketPromedio = ventasCount ? totalGeneral / ventasCount : 0;

  // 🔥 Gráfica empleados
  const dataGrafica = data.map((i) => ({
    empleado: i.username,
    total: (i.total_accesorios || 0) + (i.total_telefonos || 0)
  }));

  // 🔥 Pie
  const dataPie = [
    { name: "Contado", value: data.reduce((a, i) => a + (i.contado || 0), 0) },
    { name: "Paguitos", value: data.reduce((a, i) => a + (i.paguitos || 0), 0) },
    { name: "Pajoy", value: data.reduce((a, i) => a + (i.pajoy || 0), 0) }
  ];

  // 🔥 Top empleados
  const top = [...data]
    .sort(
      (a, b) =>
        (b.total_telefonos + b.total_accesorios) -
        (a.total_telefonos + a.total_accesorios)
    )
    .slice(0, 5);

  // 🔥 Formatear fechas
  const ventasDiaFormateado = ventasDia.map((v) => ({
    ...v,
    fecha: new Date(v.fecha).toLocaleDateString()
  }));

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom>
        Metricas de Ventas
      </Typography>

      {/* FILTROS */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          type="date"
          label="Fecha inicio"
          InputLabelProps={{ shrink: true }}
          value={fechaInicio}
          onChange={(e) => {
            setFechaInicio(e.target.value);
            setMes("");
          }}
        />

        <TextField
          type="date"
          label="Fecha fin"
          InputLabelProps={{ shrink: true }}
          value={fechaFin}
          onChange={(e) => {
            setFechaFin(e.target.value);
            setMes("");
          }}
        />

        <TextField
          select
          label="Mes"
          value={mes}
          onChange={(e) => {
            setMes(e.target.value);
            setFechaInicio("");
            setFechaFin("");
          }}
          sx={{ minWidth: 150 }}
        >
          {[...Array(12)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {`Mes ${i + 1}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number"
          label="Año"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
        />

        <Button variant="contained" onClick={() => fetchDataWithDates(fechaInicio, fechaFin)}>
          Filtrar
        </Button>
      </Box>

      {/* KPIs */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px,1fr))" gap={2} mb={3}>
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

      {/* GRÁFICAS */}
      <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={2} mb={3}>
        

        <Paper sx={{ p: 2, gridColumn: "span 6" }}>
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
         

         <Paper sx={{ p: 2, gridColumn: "span 3" }}>
          <Typography>Tipo de venta</Typography>
                  {dataPie.some(d => d.value > 0) && (
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
                  )}
        </Paper>

        <Paper sx={{ p: 2, gridColumn: "span 3" }}>
          <Typography>Top Productos</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="producto" type="category" />
              <Tooltip />
              <Bar dataKey="total_vendidos" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

      </Box>

        <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={2}>
      {/* LINEA */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>Ventas por día</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ventasDiaFormateado}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 2, gridColumn: "span 4" }}>
  <Typography>Ventas por módulo</Typography>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={ventasModulo}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="modulo" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total" />
    </BarChart>
  </ResponsiveContainer>
</Paper>

 </Box>
      {/* TOP EMPLEADOS */}
      <Paper sx={{ p: 2, gridColumn: "span 6" }}>
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
    </Container>
  );
};

export default Metricas;