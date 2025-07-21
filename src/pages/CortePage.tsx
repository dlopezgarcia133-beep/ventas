import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Divider, Alert
} from '@mui/material';
import axios from 'axios';

const CortePage = () => {
  const [resumen, setResumen] = useState<any>(null);
  const [recargas, setRecargas] = useState('');
  const [transporte, setTransporte] = useState('');
  const [otros, setOtros] = useState('');

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const res = await axios.get('${process.env.REACT_APP_API_URL}/ventas/corte-general', config);
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

  const totalFinal = (resumen?.total_general || 0) + totalAdicional;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Corte del Día
      </Typography>

      <Grid container spacing={3}>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>🛍️ Ventas de Productos</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>💵 Efectivo: ${resumen?.ventas_productos?.efectivo.toFixed(2) || '0.00'}</Typography>
            <Typography>💳 Tarjeta: ${resumen?.ventas_productos?.tarjeta.toFixed(2) || '0.00'}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📱 Ventas de Teléfonos</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>💵 Efectivo: ${resumen?.ventas_telefonos?.efectivo.toFixed(2) || '0.00'}</Typography>
            <Typography>💳 Tarjeta: ${resumen?.ventas_telefonos?.tarjeta.toFixed(2) || '0.00'}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📝 Montos Adicionales</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              label="Recargas de Celular"
              type="number"
              value={recargas}
              onChange={(e) => setRecargas(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Tarjetas de Transporte"
              type="number"
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Otros Ingresos"
              type="number"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📊 Totales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Total del Sistema: ${resumen?.total_general?.toFixed(2) || '0.00'}</Typography>
            <Typography>Total Adicional Manual: ${totalAdicional.toFixed(2)}</Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Total General del Día:</strong> ${totalFinal.toFixed(2)}
            </Alert>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default CortePage;
