import React, { useEffect, useState } from "react";
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, Button
} from "@mui/material";
import axios from "axios";
import { Diferencia } from "../Types";



const DiferenciasInventario = () => {
  const [diferenciasProd, setDiferenciasProd] = useState<Diferencia[]>([]);
  const [diferenciasTel, setDiferenciasTel] = useState<Diferencia[]>([]);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarDiferencias = async () => {
    try {
      const resProd = await axios.get(
        `${process.env.REACT_APP_API_URL}/reportes/diferencias`,
        config
      );
      setDiferenciasProd(resProd.data);

      const resTel = await axios.get(
        `${process.env.REACT_APP_API_URL}/reportes/diferencias_telefonos`,
        config
      );
      setDiferenciasTel(resTel.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al cargar diferencias");
    }
  };

  useEffect(() => {
    cargarDiferencias();
  }, []);

  const renderTabla = (titulo: string, datos: Diferencia[]) => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        {titulo}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Clave</TableCell>
            <TableCell>En Sistema</TableCell>
            <TableCell>Físico</TableCell>
            <TableCell>Diferencia</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((item, i) => (
            <TableRow key={i}>
              <TableCell>
                {item.producto || `${item.marca} ${item.modelo}`}
              </TableCell>
              <TableCell>{item.clave}</TableCell>
              <TableCell>{item.sistema}</TableCell>
              <TableCell>{item.fisico}</TableCell>
              <TableCell
                style={{
                  color: item.diferencia === 0 ? "black" : item.diferencia > 0 ? "green" : "red",
                  fontWeight: "bold"
                }}
              >
                {item.diferencia}
              </TableCell>
            </TableRow>
          ))}
          {datos.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Sin diferencias
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reporte de Diferencias
      </Typography>

      <Button variant="contained" onClick={cargarDiferencias} sx={{ mb: 2 }}>
        Refrescar
      </Button>

      {renderTabla("Productos", diferenciasProd)}
      {renderTabla("Teléfonos", diferenciasTel)}
    </Container>
  );
};

export default DiferenciasInventario;
