import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import axios from "axios";
import logo from '../ATO.jpeg';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navegacion = useNavigate();

  const handleLogin = async () => {
    const formData = new URLSearchParams();
    formData.append('username', nombre);
    formData.append('password', password);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("usuario", response.data.usuario || "");
      localStorage.setItem("modulo", response.data.modulo || "");
      localStorage.setItem("rol", response.data.rol || "");

      window.dispatchEvent(new Event("storage"));
      navegacion('/ventas');
    } catch (err) {
      setError('Credenciales inválidas. Intenta nuevamente.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 59px)',
        bgcolor: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          px: 3,
          py: 1.5,
          mb: 3,
          display: 'inline-flex',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <img src={logo} alt="ATO" style={{ height: 52, display: 'block' }} />
      </Box>

      <Typography
        variant="body2"
        sx={{ color: '#94a3b8', mb: 3, letterSpacing: 1 }}
      >
        Sistema de Gestión
      </Typography>

      <Paper
        elevation={12}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          bgcolor: '#0d1e3a',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: '#f1f5f9', mb: 2, fontWeight: 600 }}
        >
          Iniciar Sesión
        </Typography>

        {error && (
          <Typography
            sx={{
              color: '#ef4444',
              mb: 1.5,
              fontSize: 14,
              bgcolor: 'rgba(239,68,68,0.1)',
              p: 1,
              borderRadius: 1,
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Usuario"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={handleKeyDown}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2.5,
            py: 1.4,
            bgcolor: '#1e3a5f',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 0.5,
            '&:hover': {
              bgcolor: '#f97316',
              boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={handleLogin}
        >
          Iniciar sesión
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
