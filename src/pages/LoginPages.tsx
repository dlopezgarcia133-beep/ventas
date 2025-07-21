import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import axios from "axios";
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    
      localStorage.setItem('token', response.data.access_token);

      navegacion('/ventas')

    } catch (err) {
      setError('Credenciales inválidas. Intenta nuevamente.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>

        {error && <Typography color="error">{error}</Typography>}

        <Box mt={2}>
          <TextField
            fullWidth
            label="Usuario"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
            Iniciar sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;

