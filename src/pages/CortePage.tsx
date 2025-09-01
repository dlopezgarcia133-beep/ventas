import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Divider, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { obtenerRolDesdeToken } from '../components/Token';

const CorteVisual = ({ corte }: { corte: any }) => {
  const totalAdicional =
    parseFloat(corte.adicional_recargas || '0') +
    parseFloat(corte.adicional_transporte || '0') +
    parseFloat(corte.adicional_otros || '0');

  const totalFinal = (corte.total_sistema || 0) + totalAdicional;

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" gutterBottom>
        Corte del Día ({corte.fecha})
      </Typography>

      

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">🛍️ Ventas de Accesorios</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>💵 Efectivo: ${(corte.total_efectivo || 0).toFixed(2)}</Typography>
            <Typography>💳 Tarjeta: ${(corte.total_tarjeta || 0).toFixed(2)}</Typography>
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
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Total General:</strong> ${totalFinal.toFixed(2)}
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

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
      if (filtroModulo) params.modulo_id = filtroModulo;
      if (filtroFecha) params.fecha = filtroFecha;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/cortes`, {
        ...config,
        params,
      });

      setCortesGuardados(res.data);
    } catch (err) {
      console.error("Error al obtener cortes filtrados", err);
    }
  };

  useEffect(() => {
    if (rolToken === 'contador') {
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
      cargarCortesFiltrados();
    }
  }, [filtroModulo, filtroFecha]);

  return (
    <>
      {rolToken === 'contador' || 'admin' ? (
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
              <CorteVisual key={index} corte={corte} />
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
      )}
    </>
  );
};

export default CortePage;
