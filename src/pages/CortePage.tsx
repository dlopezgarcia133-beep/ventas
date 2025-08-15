import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Divider, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/corte-general`, config);
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

  const guardarCorte = async () => {
  try {
    const payload = {
      fecha: new Date().toISOString().split('T')[0],
      total_efectivo: (resumen?.ventas_productos?.efectivo || 0) + (resumen?.ventas_telefonos?.efectivo || 0),
      total_tarjeta: (resumen?.ventas_productos?.tarjeta || 0) + (resumen?.ventas_telefonos?.tarjeta || 0),
      adicional_recargas: parseFloat(recargas || '0'),
      adicional_transporte: parseFloat(transporte || '0'),
      adicional_otros: parseFloat(otros || '0'),
      total_sistema: resumen?.total_general || 0,
      total_general: totalFinal
    };

    await axios.post(`${process.env.REACT_APP_API_URL}/cortes`, payload, config);

    alert("✅ Corte del día guardado correctamente");
  } catch (error) {
    console.error("Error al guardar el corte:", error);
    alert("❌ Hubo un error al guardar el corte");
  }
};


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
            <Typography>
              💵 Efectivo: ${(resumen?.ventas_productos?.efectivo ?? 0).toFixed(2)}
            </Typography>
            <Typography>
              💳 Tarjeta: ${(resumen?.ventas_productos?.tarjeta ?? 0).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

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
            <Typography>
              Total del Sistema: ${(resumen?.total_general ?? 0).toFixed(2)}
            </Typography>
            <Typography>Total Adicional Manual: ${totalAdicional.toFixed(2)}</Typography>
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
    
  );
};

export default CortePage;
