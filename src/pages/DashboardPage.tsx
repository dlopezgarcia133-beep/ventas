import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper,  Divider } from '@mui/material';
import Grid from '@mui/material/Grid'; // ✅ correcto
import axios from 'axios';
import { Venta } from '../Types';

const DashboardPage = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [totalVentas, setTotalVentas] = useState(0);
    const [totalComisiones, setTotalComisiones] = useState(0);
  
    const token = localStorage.getItem('token');
  
    useEffect(() => {
      const fetchVentas = async () => {
        try {
          const [ventasRes, resumenRes] = await Promise.all([
            axios.get('http://localhost:8000/ventas/', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get('http://localhost:8000/ventas/resumen', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
  
          const ventas = ventasRes.data.slice(0, 5);
          setVentas(ventas);
          setTotalVentas(resumenRes.data.total_ventas);
          setTotalComisiones(resumenRes.data.total_comisiones);
        } catch (err) {
          console.error('Error al cargar datos del dashboard:', err);
        }
      };
  
      fetchVentas();
    }, []);
  
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Bienvenido al panel principal
        </Typography>
  
        <Grid container spacing={2}>
          <Grid item={true as any} xs={12 as any} md={6 as any}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Resumen general</Typography>
              <Typography>
                💵 Total en ventas: <strong>${totalVentas.toFixed(2)}</strong>
              </Typography>
              <Typography>
                🧾 Total en comisiones: <strong>${totalComisiones.toFixed(2)}</strong>
              </Typography>
            </Paper>
          </Grid>
  
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Últimas ventas</Typography>
              {ventas.length === 0 ? (
                <Typography color="text.secondary">No hay ventas aún.</Typography>
              ) : (
                ventas.map((venta) => (
                  <Box key={venta.id} sx={{ mb: 1 }}>
                    <Typography>
                      <strong>{venta.producto}</strong> – {venta.cantidad} x ${venta.precio_unitario}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {venta.fecha} · Vendedor: {venta.usuario_nombre} · Total: ${venta.total.toFixed(2)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  export default DashboardPage;