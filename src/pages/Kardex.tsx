import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

interface Kardex {
  id: number;
  producto: string;
  tipo_producto: string;
  cantidad: number;
  tipo_movimiento: string;
  modulo_origen_id?: number;
  modulo_destino_id?: number;
  fecha: string;
}

const Kardex = () => {
    const [data, setData] = useState<Kardex[]>([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/kardex/kardex`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
      console.log(res.data);
  }, []);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Historial Kardex
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Movimiento</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Origen</TableCell>
            <TableCell>Destino</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {new Date(row.fecha).toLocaleString()}
              </TableCell>

              <TableCell>{row.producto}</TableCell>
              <TableCell>{row.tipo_producto}</TableCell>

              <TableCell>
                {row.tipo_movimiento}
              </TableCell>

              <TableCell>{row.cantidad}</TableCell>

              <TableCell>
                {row.modulo_origen_id ?? "-"}
              </TableCell>

              <TableCell>
                {row.modulo_destino_id ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


export default Kardex;