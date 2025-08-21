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
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

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

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Subir archivo Excel
  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Selecciona un archivo Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/inventario/upload/`,
        formData,
        {
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadMessage("Archivo cargado exitosamente 🎉");
      cargarDiferencias(); // refresca las diferencias después de subir
    } catch (err: any) {
      setUploadMessage(err.response?.data?.detail || "Error al cargar archivo ❌");
    }
  };

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

      {/* Subida de inventario físico */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ marginRight: "10px" }}
        />
        <Button variant="outlined" onClick={handleUpload}>
          Subir Inventario Físico
        </Button>
        {uploadMessage && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {uploadMessage}
          </Typography>
        )}
      </div>

      {renderTabla("Productos", diferenciasProd)}
      {renderTabla("Teléfonos", diferenciasTel)}
    </Container>
  );
};

export default DiferenciasInventario;
