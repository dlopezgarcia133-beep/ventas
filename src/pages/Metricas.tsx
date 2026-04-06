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
    Legend,
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
  const [mes, setMes] = useState<string>("");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

 const [moduloSeleccionado, setModuloSeleccionado] = useState("");
 const [resumenModulo, setResumenModulo] = useState<any[]>([]);

  const [ventasModulo, setVentasModulo] = useState<any[]>([]);

  const API = process.env.REACT_APP_API_URL;

const fetchDataWithDates = async (inicio?: string, fin?: string) => {
  setLoading(true);

  try {
    let params = new URLSearchParams();

    if (inicio && fin) {
      params.append("fecha_inicio", inicio);
      params.append("fecha_fin", fin);
    }

    if (moduloSeleccionado) {
      params.append("modulo_id", moduloSeleccionado);
    }

    const baseUrl = process.env.REACT_APP_API_URL;

    const [res1, res2, res3, res4, res5] = await Promise.all([
      fetch(`${baseUrl}/dashboard/metricas/empleados?${params}`),
      fetch(`${baseUrl}/dashboard/ventas-por-dia?${params}`),
      fetch(`${baseUrl}/dashboard/top-productos?${params}`),
      fetch(`${baseUrl}/dashboard/ventas-por-modulo?${params}`),
      fetch(`${baseUrl}/dashboard/resumen-por-modulo?${params}`)
    ]);

    const json1 = await res1.json();
    const json2 = await res2.json();
    const json3 = await res3.json();
    const json4 = await res4.json();
    const json5 = await res5.json();

    setResumenModulo(Array.isArray(json5) ? json5 : []);
    setData(Array.isArray(json1.data) ? json1.data : []);
    setVentasDia(Array.isArray(json2) ? json2 : []);
    setTopProductos(Array.isArray(json3) ? json3 : []);
    setVentasModulo(Array.isArray(json4) ? json4 : []);

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
                  label="Módulo"
                  value={moduloSeleccionado}
                  onChange={(e) => setModuloSeleccionado(e.target.value)}
                  sx={{ minWidth: 150 }}
              >
                  <MenuItem value="">Todos</MenuItem>

                  {ventasModulo.map((m) => (
                      <MenuItem key={m.modulo_id} value={m.modulo_id}>
                          {m.modulo}
                      </MenuItem>
                  ))}
              </TextField>
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
        <Paper sx={{ p: 2, mt: 3 }}>
  <Typography variant="h6" mb={2}>
    Resumen por Módulo
  </Typography>

  <Box overflow="auto">
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f5f5f5" }}>
          <th>Módulo</th>
          <th>Accesorios</th>
          <th>Teléfonos</th>
          <th>Contado</th>
          <th>Paguitos</th>
          <th>Pajoy</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {resumenModulo.map((m, i) => (
          <tr key={i} style={{ textAlign: "center", borderBottom: "1px solid #eee" }}>
            <td>{m.modulo}</td>

            <td>${(m.total_accesorios || 0).toLocaleString()}</td>
            <td>${(m.total_telefonos || 0).toLocaleString()}</td>

            <td>{m.contado || 0}</td>
            <td>{m.paguitos || 0}</td>
            <td>{m.pajoy || 0}</td>

            <td>
              <strong>
                ${(m.total_general || 0).toLocaleString()}
              </strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
</Paper>
      <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={2} mb={3}>
        

        <Paper sx={{ p: 2, gridColumn: "span 3" }}>
        <Typography variant="h6">Top Empleados</Typography>

        {loading ? (
          <CircularProgress />
        ) : (
                      top.map((e, i) => (
                          <Box
                              key={i}
                              sx={{
                                  py: 1,
                                  borderBottom: "1px solid #eee"
                              }}
                          >
                              {/* Nombre + total */}
                              <Box display="flex" justifyContent="space-between">
                                  <Typography fontWeight={600}>{e.username}</Typography>
                                  <Typography>
                                      ${(e.total_accesorios + e.total_telefonos).toLocaleString()}
                                  </Typography>
                              </Box>

                              {/* 🔥 DESGLOSE */}
                              <Box display="flex" gap={2} mt={0.5}>
                                  <Typography variant="caption">
                                      💵 Contado: {e.contado || 0}
                                  </Typography>

                                  <Typography variant="caption">
                                      📱 Paguitos: {e.paguitos || 0}
                                  </Typography>

                                  <Typography variant="caption">
                                      🧾 Pajoy: {e.pajoy || 0}
                                  </Typography>
                              </Box>
                          </Box>
                      ))
                  )}
              </Paper>
         

         <Paper sx={{ p: 2, gridColumn: "span 4" }}>
          <Typography>Tipo de venta</Typography>
                  {dataPie.some(d => d.value > 0) && (
                      <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                          <Pie
                              data={dataPie}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={100}
                              label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                          >
                              {dataPie.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                          </Pie>

                          <Tooltip
                              formatter={(value: any, name: any) => [
                                  `${value} ventas`,
                                  name
                              ]}
                          />

                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
                  )}

                  <Box mt={2}>
                      {dataPie.map((item, i) => (
                          <Box key={i} display="flex" justifyContent="space-between">
                              <Typography>{item.name}</Typography>
                              <Typography>{item.value} ventas</Typography>
                          </Box>
                      ))}
                  </Box>
        </Paper>

        <Paper sx={{ p: 2, gridColumn: "span 5" }}>
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

        <Box display="grid" gridTemplateColumns="repeat(12,1fr)" gap={3} mb={3}>
      {/* LINEA */}
      <Paper sx={{  p: 2, gridColumn: "span 6" }}>
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

      <Paper sx={{ p: 2, gridColumn: "span 6" }}>
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