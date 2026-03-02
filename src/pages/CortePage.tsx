import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Divider, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Grid } from '@mui/material';
import axios from 'axios';
import { obtenerRolDesdeToken } from '../components/Token';

const CorteVisual = ({ corte, ventas }: { corte: any, ventas: any[] }) => {
  const totalAdicional =
    parseFloat(corte.adicional_recargas || '0') +
    parseFloat(corte.adicional_transporte || '0') +
    parseFloat(corte.adicional_otros || '0');

  const totalFinal = (corte.total_sistema || 0) + totalAdicional;

  const totalEfectivo =
  (corte.accesorios_efectivo || 0) +
  (corte.telefonos_efectivo || 0) +
  (parseFloat(corte.adicional_recargas || '0') +
   parseFloat(corte.adicional_transporte || '0') +
   parseFloat(corte.adicional_otros || '0'));

const totalTarjeta =
  (corte.accesorios_tarjeta || 0) +
  (corte.telefonos_tarjeta || 0);

  // Calcular el total de ventas de accesorios
  const totalAccesorios = ventas
    .filter((v) => v.tipo_producto === "accesorio")
    .reduce((acc, v) => acc + (v.total || 0), 0);

  return (
  <Box sx={{ mb: 6 }}>
    <Typography variant="h5" gutterBottom>
      Corte del Día ({corte.fecha})
    </Typography>

    {/* Totales */}
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">🛍️ Ventas de Accesorios</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>💵 Efectivo: ${(corte.accesorios_efectivo || 0).toFixed(2)}</Typography>
          <Typography>💳 Tarjeta: ${(corte.accesorios_tarjeta || 0).toFixed(2)}</Typography>
          <Typography><strong>Total:</strong> ${(corte.accesorios_total || 0).toFixed(2)}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">📱 Ventas de Teléfonos</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>💵 Efectivo: ${(corte.telefonos_efectivo || 0).toFixed(2)}</Typography>
          <Typography>💳 Tarjeta: ${(corte.telefonos_tarjeta || 0).toFixed(2)}</Typography>
          <Typography><strong>Total:</strong> ${(corte.telefonos_total || 0).toFixed(2)}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">📝 Montos Adicionales</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>Recargas Telcel: ${corte.adicional_recargas}</Typography>
          <Typography>Recargas YOVOY: ${corte.adicional_transporte}</Typography>
          <Typography>Centro de Pagos: ${corte.adicional_otros}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">📊 Totales</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>Total del Sistema: ${corte.total_sistema}</Typography>
          <Typography>Total Adicional: ${totalAdicional.toFixed(2)}</Typography>

          <Typography sx={{ mt: 2 }}>
                    💵 Total Efectivo: ${totalEfectivo.toFixed(2)}
                  </Typography>
                  <Typography>
                    💳 Total Tarjeta: ${totalTarjeta.toFixed(2)}
                  </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Total General:</strong> ${totalFinal.toFixed(2)}
          </Alert>
        </Paper>
      </Grid>
    </Grid>

    {/* TABLA DE ACCESORIOS */}
    <Box mt={5}>
  <Typography variant="h6" gutterBottom>
    🛍️ Detalle de Ventas Accesorios
  </Typography>

  <Paper sx={{ overflowX: "auto" }}>
    <Box
      component="table"
      sx={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 900
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <th style={thStyle}>Empleado</th>
          <th style={thStyleProducto}>Producto</th>
          <th style={thStyleCenter}>Cantidad</th>
          <th style={thStyleRight}>Precio</th>
          <th style={thStyleRight}>Total</th>
          <th style={thStyleCenter}>Fecha</th>
        </tr>
      </thead>

      <tbody>
        {ventas
          .filter((v) => v.tipo_producto === "accesorio")
          .map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>{v.empleado?.username}</td>

              <td style={tdProducto}>
                {v.producto}
              </td>

              <td style={tdCenter}>{v.cantidad}</td>

              <td style={tdRight}>
                ${(v.precio_unitario ?? 0).toFixed(2)}
              </td>

              <td style={tdRight}>
                ${(v.total ?? 0).toFixed(2)}
              </td>

              <td style={tdCenter}>
                {new Date(v.fecha).toLocaleString()}
              </td>
            </tr>
          ))}

        {ventas.filter((v) => v.tipo_producto === "accesorio").length === 0 && (
          <tr>
            <td colSpan={6} style={{ padding: 12, textAlign: "center" }}>
              No hay ventas de accesorios
            </td>
          </tr>
        )}
      </tbody>
    </Box>
  </Paper>
</Box>

    {/* TABLA DE TELÉFONOS */}
    <Box mt={5}>
      <Typography variant="h6" gutterBottom>📱 Detalle de Ventas Teléfonos</Typography>
      <Paper>
        <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Nombre</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Producto</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Tipo</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Precio</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ccc" }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.filter((v) => v.tipo_producto === "telefono").map((v) => (
              <tr key={v.id}>
                <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                <td style={{ padding: 8 }}>{v.producto}</td>
                <td style={{ padding: 8 }}>{v.tipo_venta}</td>
                <td style={{ padding: 8 }}>${v.precio_unitario?.toFixed(2)}</td>
                <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleDateString()}</td>

              </tr>
            ))}
            {ventas.filter((v) => v.tipo_producto === "telefono").length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 8, textAlign: "center" }}>No hay ventas de teléfonos</td>
              </tr>
            )}
          </tbody>
        </Box>
      </Paper>

        <Box mt={2} textAlign="right">
          <Typography variant="subtitle1" fontWeight="bold">
            Total Ventas Teléfonos: ${ventas.filter((v) => v.tipo_producto === "telefono").reduce((acc, v) => acc + (v.precio_unitario || 0), 0).toFixed(2)}
          </Typography>
        </Box>
    </Box>
  </Box>
);}

const CortePage = () => {
  const [resumen, setResumen] = useState<any>(null);
  const [recargas, setRecargas] = useState('');
  const [transporte, setTransporte] = useState('');
  const [otros, setOtros] = useState('');
  const rolToken = obtenerRolDesdeToken();
  const [cortesGuardados, setCortesGuardados] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/corte-general`, config);
        console.log('corte-general response:', res.data);
        setResumen(res.data);
      } catch (err) {
        console.error("Error al obtener datos del corte", err);
      }
    };

    cargarResumen();
  }, []);

  const totalAdicional =
    parseFloat(recargas || '0') +
    parseFloat(transporte || '0') +
    parseFloat(otros || '0');

  const totalSistema =
  (resumen?.ventas_productos?.efectivo || 0) +
  (resumen?.ventas_productos?.tarjeta || 0) +
  (resumen?.ventas_telefonos?.efectivo || 0) +
  (resumen?.ventas_telefonos?.tarjeta || 0);

  const totalFinal = (resumen?.total_sistema || 0) + totalAdicional;
  const totalEfectivo =
  (resumen?.ventas_productos?.efectivo ?? 0) +
  (resumen?.ventas_telefonos?.efectivo ?? 0) +
  totalAdicional; // incluye montos adicionales

const totalTarjeta =
  (resumen?.ventas_productos?.tarjeta ?? 0) +
  (resumen?.ventas_telefonos?.tarjeta ?? 0);

  const guardarCorte = async () => {
  try {
    const payload = {
      fecha: new Date().toISOString().split('T')[0],

      // 🔹 Accesorios
      accesorios_efectivo: resumen?.ventas_productos?.efectivo || 0,
      accesorios_tarjeta: resumen?.ventas_productos?.tarjeta || 0,
      accesorios_total: resumen?.ventas_productos?.total || 0,

      // 🔹 Teléfonos
      telefonos_efectivo: resumen?.ventas_telefonos?.efectivo || 0,
      telefonos_tarjeta: resumen?.ventas_telefonos?.tarjeta || 0,
      telefonos_total: resumen?.ventas_telefonos?.total || 0,

      // 🔹 Totales generales (suma de ambos)
      total_efectivo: (resumen?.ventas_productos?.efectivo || 0) + (resumen?.ventas_telefonos?.efectivo || 0),
      total_tarjeta: (resumen?.ventas_productos?.tarjeta || 0) + (resumen?.ventas_telefonos?.tarjeta || 0),
      total_sistema:
        (resumen?.ventas_productos?.efectivo || 0) +
        (resumen?.ventas_productos?.tarjeta || 0) +
        (resumen?.ventas_telefonos?.efectivo || 0) +
        (resumen?.ventas_telefonos?.tarjeta || 0),
      total_general: totalFinal,
      

      // 🔹 Adicionales
      adicional_recargas: parseFloat(recargas || '0'),
      adicional_transporte: parseFloat(transporte || '0'),
      adicional_otros: parseFloat(otros || '0'),
    };

    await axios.post(`${process.env.REACT_APP_API_URL}/ventas/cortes`, payload, config);
    alert("✅ Corte del día guardado correctamente");
  } catch (error) {
    console.error("Error al guardar el corte:", error);
    alert("❌ Hubo un error al guardar el corte");
  }
};


  const cargarCortesFiltrados = async () => {
    
    try {
      const params: any = {};
      if (filtroFecha) params.fecha = filtroFecha;
      if (filtroModulo) params.modulo_id = filtroModulo;
      

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas/cortes`, {
        ...config,
        params,
      });

      const dataOrdenada = res.data.sort(
      (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

      setCortesGuardados(res.data);
    } catch (err) {
      console.error("Error al obtener cortes filtrados", err);
    }
  };

  useEffect(() => {
    if (rolToken === 'contador' || rolToken === 'admin') {
      const cargarModulos = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/modulos`, config);
          setModulos(res.data);
        } catch (err) {
          console.error("Error al cargar módulos", err);
        }
      };

      cargarModulos();
    }
  }, []);

  useEffect(() => {
  if (rolToken === 'contador' || rolToken === 'admin') {
    // 👇 si hay un módulo seleccionado o una fecha, carga los cortes
    if (filtroModulo || filtroFecha) {
      cargarCortesFiltrados();
    } else {
      setCortesGuardados([]); // limpia la lista cuando no hay filtros
    }
  }
}, [filtroModulo, filtroFecha]);

  return (
    <>
      {rolToken === 'contador' || rolToken === 'admin' ? (
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>🧾 Cortes Registrados</Typography>

          {/* 🔽 Filtros para contador */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por módulo</InputLabel>
                <Select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  label="Filtrar por módulo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {modulos.map((modulo: any) => (
                    <MenuItem key={modulo.id} value={modulo.id}>
                      {modulo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Filtrar por fecha"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {cortesGuardados.length === 0 ? (
            <Typography>No hay cortes registrados aún.</Typography>
          ) : (
            cortesGuardados.map((corte, index) => (
              <CorteVisual key={index} corte={corte} ventas={corte.ventas || []} />
            ))
          )}
        </Box>
      ) : (
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Corte del Día
          </Typography>

          <Grid container spacing={3}>
            {/* Ventas de accesorios */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>🛍️ Ventas de Accesorios</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>
                  💵 Efectivo: ${(resumen?.ventas_productos?.efectivo ?? 0).toFixed(2)}
                </Typography>
                <Typography>
                  💳 Tarjeta: ${(resumen?.ventas_productos?.tarjeta ?? 0).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>

            {/* Ventas de teléfonos */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>📱 Ventas de Teléfonos</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>
                  💵 Efectivo: ${(resumen?.ventas_telefonos?.efectivo ?? 0).toFixed(2)}
                </Typography>
                <Typography>
                  💳 Tarjeta: ${(resumen?.ventas_telefonos?.tarjeta ?? 0).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>

            {/* Montos adicionales */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>📝 Montos Adicionales</Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Recargas de Telcel"
                  type="number"
                  value={recargas}
                  onChange={(e) => setRecargas(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Recargas YOVOY"
                  type="number"
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Centro de Pagos"
                  type="number"
                  value={otros}
                  onChange={(e) => setOtros(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Paper>
            </Grid>

              {/* Totales */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>📊 Totales</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>
                    Total del Sistema: ${(resumen?.total_sistema ?? 0).toFixed(2)}
                  </Typography>
                  <Typography>Total Adicional Manual: ${totalAdicional.toFixed(2)}</Typography>

                  {/* 👇 nuevos totales */}
                  <Typography sx={{ mt: 2 }}>
                    💵 Total Efectivo: ${totalEfectivo.toFixed(2)}
                  </Typography>
                  <Typography>
                    💳 Total Tarjeta: ${totalTarjeta.toFixed(2)}
                  </Typography>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <strong>Total General del Día:</strong> ${totalFinal.toFixed(2)}
                  </Alert>
                </Paper>
              </Grid>
          </Grid>


          <Box textAlign="right" mt={4}>
            <button
              onClick={guardarCorte}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Guardar Corte del Día
            </button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default CortePage;
