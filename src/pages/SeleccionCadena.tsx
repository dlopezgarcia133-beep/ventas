import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import logo from '../ATO.jpeg';

const CADENAS = [
  { nombre: 'CHEDRAUI', color: '#e31837' },
  { nombre: 'COPPEL',   color: '#0066cc' },
  { nombre: 'EKT',      color: '#f97316' },
  { nombre: 'SUBURBIA', color: '#7c3aed' },
  { nombre: 'AURRERA',  color: '#16a34a' },
  { nombre: 'SAMS',     color: '#cc0000' },
  { nombre: 'WALMART',  color: '#0071ce' },
];

const SeleccionCadena: React.FC = () => {
  const [seleccionada, setSeleccionada] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('cadena_seleccionada')) {
      navigate('/ventas', { replace: true });
      return;
    }
    const modulo = localStorage.getItem('modulo') || '';
    const rol = (localStorage.getItem('rol') || '').toLowerCase();
    if (modulo !== 'Cadenas C.' || rol !== 'asesor') {
      navigate('/ventas', { replace: true });
    }
  }, [navigate]);

  const handleContinuar = () => {
    if (!seleccionada) return;
    sessionStorage.setItem('cadena_seleccionada', seleccionada);
    navigate('/ventas', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          px: 3,
          py: 1.5,
          mb: 3,
          display: 'inline-flex',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}
      >
        <img src={logo} alt="ATO" style={{ height: 52, display: 'block' }} />
      </Box>

      <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>
        Elige tu cadena comercial
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
        Selecciona la cadena con la que trabajarás en esta sesión
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 700 }}>
        <Grid container spacing={2} justifyContent="center">
          {CADENAS.map((cadena) => {
            const activa = seleccionada === cadena.nombre;
            return (
              <Grid item xs={6} sm={4} key={cadena.nombre}>
                <Paper
                  onClick={() => setSeleccionada(cadena.nombre)}
                  elevation={0}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: activa ? `2px solid ${cadena.color}` : '2px solid #e2e8f0',
                    borderRadius: 2,
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    bgcolor: activa ? `${cadena.color}12` : '#ffffff',
                    userSelect: 'none',
                    '&:hover': {
                      borderColor: cadena.color,
                      bgcolor: `${cadena.color}0d`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${cadena.color}30`,
                    },
                  }}
                >
                  {activa && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: cadena.color,
                        fontSize: 20,
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 14,
                      letterSpacing: 1.2,
                      color: activa ? cadena.color : '#1e293b',
                    }}
                  >
                    {cadena.nombre}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Button
          variant="contained"
          fullWidth
          disabled={!seleccionada}
          onClick={handleContinuar}
          sx={{ mt: 4, py: 1.4, fontWeight: 700, fontSize: 15 }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
};

export default SeleccionCadena;
