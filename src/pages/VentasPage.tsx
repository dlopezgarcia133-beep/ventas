import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography, Autocomplete, Alert, Paper,
  TableContainer, MenuItem, FormControlLabel, FormControl, FormLabel,
  RadioGroup, Radio, TablePagination, Table, TableHead, TableRow,
  TableCell, TableBody, Divider, Chip, IconButton, Tabs, Tab, useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { InventarioGeneral, ProductoEnVenta, Usuario, Venta, VentaChip } from '../Types';
import { useNavigate } from 'react-router-dom';

// ─── helpers ────────────────────────────────────────────────────────────────
const HOY = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" local time

const thStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #e2e8f0',
  color: '#f97316',
  fontWeight: 700,
  background: '#f8fafc',
  textAlign: 'left',
};
const tdStyle: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #e2e8f0' };

// ─── Mapas de comisiones ─────────────────────────────────────────────────────

// Accesorios: orden de más específico a más general dentro de cada familia
const ACC_KEYWORDS: [string, number][] = [
  ['BOCINA', 20], ['CARGADOR', 20],
  ['EX. SMART WATCH', 20], ['SMART WATCH', 20],
  ['FUNDA DE BRAZO', 20], ['FUNDA DE IPAD', 20],
  ['TABLET $2499', 200], ['TABLET', 100],
  ['MANOS LIBRES $749', 20], ['MANOS LIBRES $799', 20], ['MANOS LIBRES $849', 20],
  ['MANOS LIBRES $899', 20], ['MANOS LIBRES $949', 20], ['MANOS LIBRES $999', 20],
  ['MANOS LIBRES $1099', 20], ['MANOS LIBRES $1199', 20], ['MANOS LIBRES $1249', 20],
  ['MANOS LIBRES $1299', 20], ['MANOS LIBRES $1399', 20], ['MANOS LIBRES $1449', 20],
  ['MANOS LIBRES $1499', 20], ['MANOS LIBRES', 10],
  ['FUNDA $160', 10], ['FUNDA', 20],
  ['MICA DE HIDROGEL $399', 20], ['MICA DE HIDROGEL', 10],
  ['MICA $40', 5], ['MICA $99', 5], ['MICA $120', 5], ['MICA', 10],
  ['PROTECTOR $79', 5], ['PROTECTOR $99', 5], ['PROTECTOR $120', 5],
  ['PROTECTOR $130', 5], ['PROTECTOR $149', 5], ['PROTECTOR $169', 5],
  ['PROTECTOR $180', 5], ['PROTECTOR $199', 5],
  ['PROTECTOR $249', 10], ['PROTECTOR $299', 10], ['PROTECTOR $349', 10],
  ['PROTECTOR $399', 15], ['PROTECTOR', 20],
  ['BASE PARA COCHE', 10], ['CABLE USB', 10],
  ['CÁMARA', 10], ['CAMARA', 10],
  ['GAMEBOY', 10], ['GAME BOY', 10],
  ['POWER BANK', 10], ['WEBCAM', 10],
];

// Teléfonos: nombre exacto (uppercase) → comisión base
const TEL_EXACT_MAP: Record<string, number> = {
  'TELEFONO LIBRE HONOR 200 LITE 256GB': 250,
  'TELEFONO LIBRE HONOR MAGIC 5 LITE 128GB': 200,
  'TELEFONO LIBRE HONOR MAGIC 5 LITE 256GB': 200,
  'TELEFONO LIBRE HONOR X5': 200,
  'TELEFONO LIBRE HONOR X6A 128GB': 200,
  'TELEFONO LIBRE HONOR X6B PLUS 256GB': 200,
  'TELEFONO LIBRE HONOR X7A': 250,
  'TELEFONO LIBRE HONOR X7B 128GB': 100,
  'TELEFONO LIBRE HONOR X7B 256GB': 100,
  'TELEFONO LIBRE HONOR X7C 256GB': 100,
  'TELEFONO LIBRE HONOR X8A 128GB': 200,
  'TELEFONO LIBRE HONOR X9C 256GB': 200,
  'TELEFONO LIBRE IPHONE 12 128GB': 100,
  'TELEFONO LIBRE IPHONE 13 128GB': 100,
  'TELEFONO LIBRE IPHONE 14 128GB': 100,
  'TELEFONO LIBRE IPHONE 15 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 PLUS 128GB': 100,
  'TELEFONO LIBRE IPHONE 16 PRO 128GB': 100,
  'TELEFONO LIBRE IPHONE 16E 128GB': 100,
  'TELEFONO LIBRE KODAK KD50': 100,
  'TELEFONO LIBRE MOTOROLA G31 128GB': 100,
  'TELEFONO LIBRE MOTOROLA G85 256GB': 100,
  'TELEFONO LIBRE OPPO A18 128GB': 100,
  'TELEFONO LIBRE OPPO A40 128GB': 100,
  'TELEFONO LIBRE OPPO A78 128GB': 100,
  'TELEFONO LIBRE REALME C11': 200,
  'TELEFONO LIBRE REALME C51': 200,
  'TELEFONO LIBRE RF IPHONE 11 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 11 64GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 12 PRO MAX 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 PRO MAX 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 13 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 PRO 128GB': 100,
  'TELEFONO LIBRE RF IPHONE 14 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 15 PRO MAX 256GB': 100,
  'TELEFONO LIBRE RF IPHONE 15 PROMAX 256GB': 100,
  'TELEFONO LIBRE SAMSUNG A05S 128GB': 100,
  'TELEFONO LIBRE SAMSUNG A06 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A06 64GB': 50,
  'TELEFONO LIBRE SAMSUNG A16 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A16 256GB': 50,
  'TELEFONO LIBRE SAMSUNG A23 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A25 5G 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A25 5G 256GB': 200,
  'TELEFONO LIBRE SAMSUNG A26 128GB': 50,
  'TELEFONO LIBRE SAMSUNG A35 128GB': 200,
  'TELEFONO LIBRE SAMSUNG A35 256GB': 200,
  'TELEFONO LIBRE SAMSUNG A55 256GB': 200,
  'TELEFONO LIBRE VIVO Y01': 200,
  'TELEFONO LIBRE WIKO T10': 200,
  'TELEFONO LIBRE XIAOMI REDMI 10A 64GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI 13 128GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI 13C 128GB': 100,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 10 PRO 128GB': 200,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 12 PRO 128GB': 200,
  'TELEFONO LIBRE XIAOMI REDMI NOTE 13 128GB': 100,
  'TELEFONO LIBRE ZTE A31': 200,
  'TELEFONO LIBRE ZTE A55': 100,
  'TELEFONO LIBRE ZTE V60 SMART': 100,
  'TELEFONO TELCEL ACER A62 ULTRA': 200,
  'TELEFONO TELCEL HONOR X8A': 100,
  'TELEFONO TELCEL IPHONE 11 64GB': 100,
  'TELEFONO TELCEL IPHONE 12 128GB': 100,
  'TELEFONO TELCEL IPHONE 13 128GB': 100,
  'TELEFONO TELCEL IPHONE 14 128GB': 100,
  'TELEFONO TELCEL IPHONE 15 128GB': 100,
  'TELEFONO TELCEL MOTOROLA EDGE 30 128GB': 100,
  'TELEFONO TELCEL MOTOROLA G24 256GB': 50,
  'TELEFONO TELCEL MOTOROLA G32 128GB': 200,
  'TELEFONO TELCEL MOTOROLA G53': 100,
  'TELEFONO TELCEL NUBIA Z353': 100,
  'TELEFONO TELCEL OPPO A5 256GB': 100,
  'TELEFONO TELCEL OPPO A79 256GB': 100,
  'TELEFONO TELCEL REALME NOTE 60 128GB': 200,
  'TELEFONO TELCEL SAMSUNG A05S 64GB': 100,
  'TELEFONO TELCEL SAMSUNG A06 64GB': 50,
  'TELEFONO TELCEL SAMSUNG A16 128GB': 50,
  'TELEFONO TELCEL SAMSUNG A25': 200,
  'TELEFONO TELCEL SAMSUNG A25 128GB': 50,
  'TELEFONO TELCEL SAMSUNG A35': 100,
  'TELEFONO TELCEL SAMSUNG A35 128GB': 200,
  'TELEFONO TELCEL ZTE A51': 200,
  'TELEFONO TELCEL ZTE A55': 100,
  'TELEFONO TELCEL ZTE V40 PRO': 100,
  'TELEFONO TELCEL ZTE V40 VITA': 100,
  'TELEFONO TELCEL ZTE V60 SMART': 100,
};

const calcComision = (v: Venta): number => {
  const nombre = (v.producto || '').toUpperCase();
  if (v.tipo_producto === 'telefono') {
    const tipo = (v.tipo_venta || '').toLowerCase();
    const base = TEL_EXACT_MAP[nombre];
    const inMap = base !== undefined;
    if (tipo === 'contado')  return inMap ? base : 10;
    if (tipo === 'pajoy')    return inMap ? 100 + base : 100;
    if (tipo === 'paguitos') return inMap ? 110 + base : 110;
    return 0;
  }
  if (v.tipo_producto === 'accesorios') {
    for (const [keyword, comision] of ACC_KEYWORDS) {
      if (nombre.includes(keyword)) return comision;
    }
    return 0;
  }
  return 0;
};

// ────────────────────────────────────────────────────────────────────────────

const CHIP_OPCIONES_TODAS = [
  { value: 'Chip Equipo',         label: 'Chip Equipo / Promo / ATO' },
  { value: 'Chip Express',        label: 'Chip Express / ATO' },
  { value: 'Portabilidad',        label: 'Portabilidad / ATO' },
  { value: 'Chip Cero/Libre',     label: 'Chip Cero / Libre / EKT' },
  { value: 'Chip Preactivado',    label: 'Chip Preactivado / Otras Cadenas' },
  { value: 'Chip Coppel',         label: 'Chip Express Coppel' },
  { value: 'Portabilidad Coppel', label: 'Portabilidad Coppel' },
  { value: 'Porta Otras cadenas', label: 'Portabilidad / EKT / Otras Cadenas' },
  { value: 'Activacion',          label: 'Telefono Activado de Cadenas' },
];

const CHIP_OPCIONES_EKT = [
  { value: 'Activacion',          label: 'Telefono Activado de Cadenas' },
  { value: 'Chip Cero/Libre',     label: 'Chip Cero / Libre / EKT' },
  { value: 'Chip Preactivado',    label: 'Chip Preactivado / Otras Cadenas' },
  { value: 'Porta Otras cadenas', label: 'Portabilidad / EKT / Otras Cadenas' },
];

const CHIP_OPCIONES_COPPEL = [
  { value: 'Activacion',          label: 'Telefono Activado de Cadenas' },
  { value: 'Chip Coppel',         label: 'Chip Express Coppel' },
  { value: 'Portabilidad Coppel', label: 'Portabilidad Coppel' },
];

const CHIP_OPCIONES_OTRAS_CADENAS = [
  { value: 'Activacion',          label: 'Telefono Activado de Cadenas' },
  { value: 'Chip Preactivado',    label: 'Chip Preactivado / Otras Cadenas' },
  { value: 'Porta Otras cadenas', label: 'Portabilidad / EKT / Otras Cadenas' },
];

const CHIP_OPCIONES_POR_CADENA: Record<string, typeof CHIP_OPCIONES_TODAS> = {
  EKT:      CHIP_OPCIONES_EKT,
  COPPEL:   CHIP_OPCIONES_COPPEL,
  CHEDRAUI: CHIP_OPCIONES_OTRAS_CADENAS,
  SUBURBIA: CHIP_OPCIONES_OTRAS_CADENAS,
  AURRERA:  CHIP_OPCIONES_OTRAS_CADENAS,
  SAMS:     CHIP_OPCIONES_OTRAS_CADENAS,
  WALMART:  CHIP_OPCIONES_OTRAS_CADENAS,
};

interface ComisionChip { tipo: string; comision: string; nota?: string; }

const COMISIONES_EKT: ComisionChip[] = [
  { tipo: 'Teléfono Activado de Cadenas',       comision: '$40' },
  { tipo: 'Chip Cero / Libre / EKT',            comision: '$25' },
  { tipo: 'Chip Preactivado / Otras Cadenas',   comision: '$35' },
  { tipo: 'Portabilidad / EKT / Otras Cadenas', comision: '$50' },
];

const COMISIONES_COPPEL: ComisionChip[] = [
  { tipo: 'Teléfono Activado de Cadenas', comision: 'Depende del valor del equipo' },
  { tipo: 'Chip Express Coppel',          comision: '$15' },
  { tipo: 'Portabilidad Coppel',          comision: '$25' },
];

const COMISIONES_OTRAS_CADENAS: ComisionChip[] = [
  { tipo: 'Teléfono Activado de Cadenas',       comision: '$45' },
  { tipo: 'Chip Preactivado / Otras Cadenas',   comision: '$35' },
  { tipo: 'Portabilidad / EKT / Otras Cadenas', comision: '$50' },
];

const COMISIONES_POR_CADENA: Record<string, ComisionChip[]> = {
  EKT:      COMISIONES_EKT,
  COPPEL:   COMISIONES_COPPEL,
  CHEDRAUI: COMISIONES_OTRAS_CADENAS,
  SUBURBIA: COMISIONES_OTRAS_CADENAS,
  AURRERA:  COMISIONES_OTRAS_CADENAS,
  SAMS:     COMISIONES_OTRAS_CADENAS,
  WALMART:  COMISIONES_OTRAS_CADENAS,
};

// ─── Helpers de ciclos de nómina ─────────────────────────────────────────────

const NOMINA_SYSTEM_START = new Date(2026, 3, 11); // 11 Abr 2026 (sábado)
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

interface Ciclo { inicio: Date; fin: Date; pago: Date; }

function getCiclos(): Ciclo[] {
  const ciclos: Ciclo[] = [];
  const current = new Date(NOMINA_SYSTEM_START);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  while (true) {
    const inicio = new Date(current);
    const fin = new Date(current);
    fin.setDate(fin.getDate() + 6);
    const pago = new Date(fin);
    pago.setDate(pago.getDate() + 12);
    ciclos.push({ inicio, fin, pago }); // siempre incluir al menos el primer ciclo
    if (pago > hoy) break;              // cada miércoles de pago que pasa habilita el siguiente
    current.setDate(current.getDate() + 7);
  }
  return ciclos.reverse();
}

function fmtDiaMes(d: Date): string {
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

function labelCiclo(c: Ciclo): string {
  return `${fmtDiaMes(c.inicio)} - ${fmtDiaMes(c.fin)} ${c.fin.getFullYear()} · Pago: ${fmtDiaMes(c.pago)}`;
}

function getEstadoChip(c: VentaChip): { label: string; color: string } {
  if (c.es_incubadora)      return { label: 'En incubadora',        color: '#f97316' };
  if (c.descripcion_rechazo) return { label: 'Rechazado',            color: '#ef4444' };
  if (c.validado)            return { label: 'Validado',             color: '#16a34a' };
  return                            { label: 'Esperando validación', color: '#64748b' };
}

const FormularioVentaMultiple = () => {
  const moduloLocal = localStorage.getItem('modulo') || '';
  const esCadenas = moduloLocal.toLowerCase().includes('cadena');
  const isMobile = useMediaQuery('(max-width:767px)');

  // ── Estado general ───────────────────────────────────────────────────────
  const [productos, setProductos] = useState<InventarioGeneral[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const ventasTelefonos = ventas.filter((v) => v.tipo_producto === 'telefono');

  const [producto, setProducto] = useState('');
  const [precio, setPrecio] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState('');
  const [telefono, settelefono] = useState('');
  const [carrito, setCarrito] = useState<ProductoEnVenta[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const [tipoVenta, setTipoVenta] = useState<'accesorio' | 'chip' | 'telefono'>(esCadenas ? 'chip' : 'accesorio');
  const [tipoChip, setTipoChip] = useState('');
  const [numero, setNumero] = useState('');
  const [recarga, setRecarga] = useState('');

  const [telefonoMarca, setTelefonoMarca] = useState('');
  const [telefonoModelo, setTelefonoModelo] = useState('');
  const [telefonoTipo_venta, setTelefonoTipo_venta] = useState('');
  const [telefonoPrecio, setTelefonoPrecio] = useState('');
  const [Chip_casado, setChip_casado] = useState('');

  const [fecha, setFecha] = useState('');
  const [opcionesTelefonos, setOpcionesTelefonos] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [rol, setRol] = useState<Usuario['rol'] | null>(localStorage.getItem('rol') as Usuario['rol'] | null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [totalAccesorios, setTotalAccesorios] = useState(0);
  const [totalTelefonos, setTotalTelefonos] = useState(0);
  const [cvip, setcvip] = useState<boolean>(false);
  const [paginaAcc, setPaginaAcc] = useState(0);
  const [paginaTel, setPaginaTel] = useState(0);
  const filasPorPagina = 10;

  // ── Estado asesor ────────────────────────────────────────────────────────
  const [chipsDelDia, setChipsDelDia] = useState<VentaChip[]>([]);
  const [misActivacionesData, setMisActivacionesData] = useState<VentaChip[]>([]);
  const [comisionesHoy, setComisionesHoy] = useState<any>(null);
  const [sinCiclo, setSinCiclo] = useState(false);
  const [tabAsesor, setTabAsesor] = useState(0);
  const [misVentasFecha, setMisVentasFecha] = useState(HOY);
  const [misVentasData, setMisVentasData] = useState<Venta[]>([]);
  const [comisionesMisVentas, setComisionesMisVentas] = useState<any>(null);
  const [catalogoComisiones, setCatalogoComisiones] = useState<{ producto: string; cantidad: number }[]>([]);
  const [nominaCicloIdx, setNominaCicloIdx] = useState(0);
  const [nominaChips, setNominaChips] = useState<VentaChip[]>([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ── Fetches ──────────────────────────────────────────────────────────────
  const fetchVentas = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fecha: fecha || undefined,
          modulo_id: user?.is_admin ? moduloId || undefined : undefined,
        },
      });
      setVentas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCatalogoComisiones = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/comisiones/comisiones`, config);
      setCatalogoComisiones(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMisVentas = async (fecha: string) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fecha },
      });
      setMisVentasData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchComisionesPorFecha = async (fecha: string) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/comisiones/ciclo_por_fechas`,
        { ...config, params: { inicio: fecha, fin: fecha } },
      );
      setComisionesMisVentas(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setComisionesMisVentas({ total_accesorios: 0, total_telefonos: 0, ventas_accesorios: [], ventas_telefonos: [] });
      }
    }
  };

  const fetchChipsDelDia = async () => {
    try {
      const res = await axios.get<VentaChip[]>(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const usuario = localStorage.getItem('usuario') || '';
      const hoy = new Date().toLocaleDateString('en-CA');
      setChipsDelDia(
        res.data.filter((c) => c.fecha === hoy && c.empleado?.username === usuario),
      );
    } catch (err) {
      console.error('Error al cargar chips del día:', err);
    }
  };

  const fetchMisActivaciones = async (fecha: string) => {
    try {
      const res = await axios.get<VentaChip[]>(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const usuario = localStorage.getItem('usuario') || '';
      setMisActivacionesData(
        res.data.filter((c) => c.fecha === fecha && c.empleado?.username === usuario),
      );
    } catch (err) {
      console.error('Error al cargar mis activaciones:', err);
    }
  };

  const fetchNominaChips = async (inicio: string, fin: string) => {
    try {
      const res = await axios.get<VentaChip[]>(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const usr = localStorage.getItem('usuario') || '';
      setNominaChips(
        res.data.filter((c) => c.fecha >= inicio && c.fecha <= fin && c.empleado?.username === usr),
      );
    } catch (err) {
      console.error('Error al cargar chips de nómina:', err);
    }
  };

  const fetchComisionesHoy = async () => {
    const hoy = new Date().toLocaleDateString('en-CA');
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/comisiones/ciclo_por_fechas`,
        { ...config, params: { inicio: hoy, fin: hoy } },
      );
      setComisionesHoy(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSinCiclo(true);
        setComisionesHoy({ total_accesorios: 0, total_telefonos: 0, total_chips: 0, total_general: 0, ventas_chips: [], ventas_accesorios: [], ventas_telefonos: [] });
      } else {
        console.error('Error fetching comisiones del día:', err);
      }
    }
  };

  useEffect(() => {
    if (ventas.length > 0) {
      const acc = ventas.filter((v) => v.tipo_producto === 'accesorios' && !v.cancelada);
      setTotalAccesorios(acc.reduce((s, v) => s + v.precio_unitario * v.cantidad, 0));
      const tel = ventas.filter((v) => v.tipo_producto === 'telefono' && !v.cancelada);
      setTotalTelefonos(tel.reduce((s, v) => s + v.precio_unitario * v.cantidad, 0));
    }
  }, [ventas]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventario/inventario/general`,
          config,
        );
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchPrecio = async () => {
      if (producto) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/inventario/inventario/general/${encodeURIComponent(producto)}`,
            config,
          );
          setPrecio(res.data.precio);
        } catch {
          setPrecio(null);
          setMensaje({ tipo: 'error', texto: 'Producto no encontrado en inventario.' });
        }
      }
    };
    fetchPrecio();
  }, [producto]);

  useEffect(() => {
    const fetchUserAndModulos = async () => {
      try {
        if (token) {
          const resUser = await axios.get<Usuario>(
            `${process.env.REACT_APP_API_URL}/auth/usuarios/me`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUser(resUser.data);
          setRol(resUser.data.rol);
          const resModulos = await axios.get(
            `${process.env.REACT_APP_API_URL}/registro/modulos`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setModulos(resModulos.data);
        }
      } catch (err) {
        console.error('Error al cargar usuario/modulos:', err);
      }
    };
    fetchUserAndModulos();
  }, []);

  // Para asesor: auto-cargar fecha de hoy y comisiones
  useEffect(() => {
    if (rol === 'asesor') {
      setFecha(HOY);
      fetchComisionesHoy();
      fetchChipsDelDia();
    }
  }, [rol]);

  useEffect(() => {
    fetchVentas();
  }, [fecha, moduloId, user]);

  useEffect(() => {
    if (rol === 'asesor' && tabAsesor === 1) {
      if (esCadenas) {
        fetchMisActivaciones(misVentasFecha);
      } else {
        fetchMisVentas(misVentasFecha);
        fetchComisionesPorFecha(misVentasFecha);
      }
    }
  }, [tabAsesor, misVentasFecha, rol]);

  useEffect(() => {
    if (rol === 'asesor' && tabAsesor === 2) fetchCatalogoComisiones();
  }, [tabAsesor, rol]);

  useEffect(() => {
    if (rol === 'asesor' && esCadenas && tabAsesor === 3) {
      const ciclos = getCiclos();
      const c = ciclos[nominaCicloIdx] ?? ciclos[0];
      fetchNominaChips(
        c.inicio.toLocaleDateString('en-CA'),
        c.fin.toLocaleDateString('en-CA'),
      );
    }
  }, [tabAsesor, nominaCicloIdx, rol]);

  // ── Acciones ─────────────────────────────────────────────────────────────
  const agregarAlCarrito = () => {
    if (!producto || precio === null || cantidad <= 0) return;
    const nuevo: ProductoEnVenta = {
      producto, cantidad, precio_unitario: precio, id: 0, nombre: '', tipo_producto: 'accesorios',
    };
    setCarrito([...carrito, nuevo]);
    setProducto('');
    setCantidad(1);
    setPrecio(null);
  };

  const enviarCarrito = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/ventas/multiples`,
        { productos: carrito, telefono_cliente: telefono, metodo_pago: metodoPago },
        config,
      );
      setMensaje({ tipo: 'success', texto: 'Venta registrada con éxito.' });
      setCarrito([]);
      settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesHoy(); }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.detail || 'Error al registrar la venta' });
    }
  };

  const cancelarVenta = async (id: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta venta?')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/ventas/ventas/${id}/cancelar`, {}, config);
      alert('Venta cancelada');
      fetchVentas();
      if (rol === 'asesor') fetchComisionesHoy();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al cancelar la venta');
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips`,
        { tipo_chip: tipoChip, numero_telefono: numero, monto_recarga: parseFloat(recarga), telefono_cliente: telefono || null, cvip },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
      );
      setMensaje({ tipo: 'success', texto: 'Venta de chip registrada correctamente' });
      setTipoChip(''); setNumero(''); setRecarga(''); settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesHoy(); fetchChipsDelDia(); }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.detail || 'Error al registrar la venta' });
    }
  };

  const registrarVentaTelefono = async () => {
    if (!telefonoMarca || !telefonoModelo || !telefonoPrecio || !telefonoTipo_venta) {
      setMensaje({ tipo: 'error', texto: 'Faltan datos del teléfono.' });
      return;
    }
    const p = Number(telefonoPrecio);
    if (isNaN(p) || p <= 0) { setMensaje({ tipo: 'error', texto: 'Precio inválido.' }); return; }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ventas/ventas`,
        {
          productos: [{
            producto: `${telefonoMarca} ${telefonoModelo}`,
            cantidad: 1, precio_unitario: p,
            tipo_producto: 'telefono', tipo_venta: telefonoTipo_venta,
            chip_casado: Chip_casado || null,
          }],
          metodo_pago: metodoPago,
          telefono_cliente: telefono?.trim() || '',
        },
        config,
      );
      setMensaje({ tipo: 'success', texto: 'Venta de teléfono registrada correctamente' });
      setTelefonoMarca(''); setTelefonoModelo(''); setTelefonoTipo_venta('');
      setMetodoPago(''); setTelefonoPrecio(''); setChip_casado(''); settelefono('');
      if (rol === 'asesor') { fetchVentas(); fetchComisionesHoy(); }
    } catch (err: any) {
      let msg = 'Error al registrar la venta de teléfono';
      if (Array.isArray(err?.response?.data?.detail)) msg = err.response.data.detail.map((e: any) => e.msg).join(' | ');
      else if (typeof err?.response?.data?.detail === 'string') msg = err.response.data.detail;
      setMensaje({ tipo: 'error', texto: msg });
    }
  };

  const buscarTelefonos = async (texto: string) => {
    if (!texto || texto.length < 2) { setOpcionesTelefonos([]); return; }
    setBuscando(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventario/buscar?query=${encodeURIComponent(texto)}`,
        config,
      );
      setOpcionesTelefonos(res.data);
    } catch { setOpcionesTelefonos([]); }
    finally { setBuscando(false); }
  };

  // ── Cálculos asesor del día ──────────────────────────────────────────────
  const ventasHoyAcc = ventas.filter((v) => v.tipo_producto === 'accesorios' && v.fecha?.startsWith(HOY)).sort((a, b) => a.producto.localeCompare(b.producto, 'es'));
  const ventasHoyTel = ventas.filter((v) => v.tipo_producto === 'telefono' && v.fecha?.startsWith(HOY)).sort((a, b) => a.producto.localeCompare(b.producto, 'es'));
  const chipsHoy = chipsDelDia;

  const comisionAccHoy  = ventasHoyAcc.filter((v) => !v.cancelada).reduce((s, v) => s + calcComision(v), 0);
  const comisionTelHoy  = ventasHoyTel.filter((v) => !v.cancelada).reduce((s, v) => s + calcComision(v), 0);
  const totalComisionHoy = comisionAccHoy + comisionTelHoy;

  const totalPesosAcc = ventasHoyAcc.filter((v) => !v.cancelada).reduce((s, v) => s + v.precio_unitario * v.cantidad, 0);
  const totalPesosTel = ventasHoyTel.filter((v) => !v.cancelada).reduce((s, v) => s + v.precio_unitario * v.cantidad, 0);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Formulario (compartido) ───────────────────────────────────────────────
  const formulario = (
    <Paper sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2.5 } }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        {esCadenas ? 'Activaciones' : 'Registrar Venta'}
      </Typography>

      {mensaje && <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>{mensaje.texto}</Alert>}

      {!esCadenas && (
        <TextField
          select label="Tipo de venta" value={tipoVenta}
          onChange={(e) => { setTipoVenta(e.target.value as any); setMensaje(null); }}
          fullWidth margin="normal"
        >
          <MenuItem value="accesorio">Accesorio</MenuItem>
          <MenuItem value="chip">Chip</MenuItem>
          <MenuItem value="telefono">Teléfono</MenuItem>
        </TextField>
      )}

      {/* ── Accesorio ── */}
      {!esCadenas && tipoVenta === 'accesorio' && (
        <>
          <Autocomplete
            options={productos
              .filter((p) => !p.producto.toLowerCase().includes('telefono') && p.cantidad > 0)
              .sort((a, b) => a.producto.localeCompare(b.producto, 'es'))
              .map((p) => p.producto)}
            value={producto}
            onChange={(_, v) => setProducto(v || '')}
            renderInput={(params) => <TextField {...params} label="Producto" fullWidth margin="normal" />}
          />
          <TextField label="Precio Unitario" type="number" value={precio ?? ''} onChange={(e) => setPrecio(e.target.value === '' ? null : Number(e.target.value))} fullWidth margin="normal" />
          <TextField label="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} fullWidth margin="normal" />
          <TextField select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} fullWidth margin="normal" required error={!metodoPago} helperText={!metodoPago ? 'Este campo es obligatorio' : ''}>
            <MenuItem value="efectivo">Efectivo 💵</MenuItem>
            <MenuItem value="tarjeta">Tarjeta 💳</MenuItem>
          </TextField>
          <Button variant="outlined" fullWidth onClick={agregarAlCarrito} sx={{ mt: 1 }} disabled={!producto || cantidad <= 0}>Agregar al Carrito</Button>
          <TextField label="Teléfono del cliente" value={telefono} onChange={(e) => settelefono(e.target.value)} fullWidth margin="normal" />
          <Box mt={2}>
            <Typography variant="h6">Carrito</Typography>
            {carrito.length === 0
              ? <Typography color="text.secondary">No hay productos agregados</Typography>
              : <ul>{carrito.map((p, i) => <li key={i}>{p.producto} — {p.cantidad} × ${p.precio_unitario}</li>)}</ul>}
          </Box>
          <Typography variant="h6" mt={1}>Total: ${carrito.reduce((a, p) => a + p.precio_unitario * p.cantidad, 0).toFixed(2)}</Typography>
          <Button variant="contained" fullWidth onClick={enviarCarrito} sx={{ mt: 2 }} disabled={carrito.length === 0}>Registrar Venta</Button>
        </>
      )}

      {/* ── Chip ── */}
      {(esCadenas || tipoVenta === 'chip') && (
        <>
          <TextField select label="Chip" value={tipoChip} onChange={(e) => setTipoChip(e.target.value)} fullWidth margin="normal">
            {(esCadenas
              ? CHIP_OPCIONES_POR_CADENA[sessionStorage.getItem('cadena_seleccionada') || ''] ?? CHIP_OPCIONES_TODAS
              : CHIP_OPCIONES_TODAS
            ).map((op) => (
              <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Número" type="tel" value={numero} onChange={(e) => setNumero(e.target.value)} fullWidth margin="normal" />
          <TextField label="Recarga" type="number" value={recarga} onChange={(e) => setRecarga(e.target.value)} fullWidth margin="normal" />
          <FormControl sx={{ mt: 1 }}>
            <FormLabel>Cliente VIP</FormLabel>
            <RadioGroup row value={cvip} onChange={(e) => setcvip(e.target.value === 'true')}>
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!tipoChip || !numero || !recarga} sx={{ mt: 2 }}>Registrar Venta de Chip</Button>
        </>
      )}

      {/* ── Teléfono ── */}
      {!esCadenas && tipoVenta === 'telefono' && (
        <>
          <Autocomplete
            freeSolo loading={buscando} options={opcionesTelefonos}
            value={`${telefonoMarca} ${telefonoModelo}`.trim()}
            onInputChange={(_, v) => buscarTelefonos(v)}
            onChange={(_, v) => {
              if (typeof v === 'string') {
                const p = v.split(' ');
                setTelefonoMarca(p[0] || '');
                setTelefonoModelo(p.slice(1).join(' ') || '');
              }
            }}
            renderInput={(params) => <TextField {...params} label="Teléfono (marca + modelo)" fullWidth margin="normal" />}
          />
          <TextField select label="Tipo" value={telefonoTipo_venta} onChange={(e) => setTelefonoTipo_venta(e.target.value)} fullWidth margin="normal">
            <MenuItem value="Contado">Contado</MenuItem>
            <MenuItem value="Pajoy">Pajoy</MenuItem>
            <MenuItem value="Paguitos">Paguitos</MenuItem>
          </TextField>
          <TextField label="Precio" type="number" value={telefonoPrecio} onChange={(e) => setTelefonoPrecio(e.target.value)} fullWidth margin="normal" />
          <TextField select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} fullWidth margin="normal" required>
            <MenuItem value="efectivo">💵 Efectivo</MenuItem>
            <MenuItem value="tarjeta">💳 Tarjeta</MenuItem>
          </TextField>
          <TextField label="Chip casado" value={Chip_casado} onChange={(e) => setChip_casado(e.target.value)} fullWidth margin="normal" />
          <Button variant="contained" color="secondary" fullWidth onClick={registrarVentaTelefono}
            disabled={!telefonoMarca || !telefonoModelo || !telefonoTipo_venta || !telefonoPrecio} sx={{ mt: 2 }}>
            Registrar Venta Teléfono
          </Button>
        </>
      )}
    </Paper>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA ASESOR
  // ════════════════════════════════════════════════════════════════════════════
  if (rol === 'asesor') {
    const usuarioActual = localStorage.getItem('usuario') || '';
    const misVentasAcc = misVentasData.filter((v) => v.tipo_producto === 'accesorios' && v.empleado?.username === usuarioActual);
    const misVentasTel = misVentasData.filter((v) => v.tipo_producto === 'telefono'   && v.empleado?.username === usuarioActual);
    const totalMisVentasPesos = [...misVentasAcc, ...misVentasTel]
      .filter((v) => !v.cancelada)
      .reduce((s, v) => s + v.precio_unitario * v.cantidad, 0);
    const totalMisVentasComision =
      [...misVentasAcc, ...misVentasTel].filter((v) => !v.cancelada).reduce((s, v) => s + calcComision(v), 0);

    const tablaComisionesItems = [
      ...catalogoComisiones.map((c) => ({
        nombre: c.producto,
        comision: c.cantidad,
        esTelefono: c.producto.toUpperCase().startsWith('TELEFONO'),
      })),
      { nombre: 'Contado',  comision: 10,  esTelefono: true },
      { nombre: 'Paguitos', comision: 110, esTelefono: true },
      { nombre: 'Pajoy',    comision: 100, esTelefono: true },
    ].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    return (
      <Box sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
        <Tabs
          value={tabAsesor}
          onChange={(_, v) => setTabAsesor(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: '1px solid #e2e8f0', minHeight: 44 }}
          TabIndicatorProps={{ style: { backgroundColor: '#f97316' } }}
        >
          <Tab
            icon={<ConfirmationNumberIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
            iconPosition="start"
            label="TICKET"
            sx={{ fontWeight: 700, minHeight: 44, fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 }, '&.Mui-selected': { color: '#f97316' } }}
          />
          <Tab
            label={esCadenas ? 'MIS ACTIVACIONES' : 'MIS VENTAS'}
            sx={{ fontWeight: 700, minHeight: 44, fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 }, '&.Mui-selected': { color: '#f97316' } }}
          />
          <Tab
            icon={<MonetizationOnIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
            iconPosition="start"
            label={esCadenas ? 'LISTA DE COMISIONES' : 'COMISIONES'}
            sx={{ fontWeight: 700, minHeight: 44, fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 }, '&.Mui-selected': { color: '#f97316' } }}
          />
          {esCadenas && (
            <Tab
              icon={<AccountBalanceWalletIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
              iconPosition="start"
              label="MI SEMANA"
              sx={{ fontWeight: 700, minHeight: 44, fontSize: { xs: 11, sm: 13 }, px: { xs: 1, sm: 2 }, '&.Mui-selected': { color: '#f97316' } }}
            />
          )}
        </Tabs>

        {/* ── Tab TICKET ── */}
        {tabAsesor === 0 && (
          <Grid container spacing={2}>
            {/* Columna izquierda: formulario (oculto para admin) */}
            {rol !== 'admin' && (
              <Grid item xs={12} md={6}>
                {formulario}
              </Grid>
            )}

            {/* Columna derecha: tabla del día + comisiones */}
            <Grid item xs={12} md={rol === 'admin' ? 12 : 6}>

          {esCadenas ? (
            /* ── Activaciones del día (Cadenas C.) ── */
            <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Activaciones del día
              </Typography>
              {chipsHoy.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                  Sin activaciones registradas hoy
                </Typography>
              ) : isMobile ? (
                /* Cards on mobile */
                <Box>
                  {chipsHoy.map((c: any, i: number) => (
                    <Box key={i} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: '#1e293b', fontSize: 13 }}>
                        {c.tipo_chip}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                          {c.numero_telefono}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a', fontSize: 13 }}>
                          ${(c.monto_recarga ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                /* Table on desktop */
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Tipo de Chip</th>
                        <th style={thStyle}>Número</th>
                        <th style={thStyle}>Recarga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chipsHoy.map((c: any, i: number) => (
                        <tr key={i}>
                          <td style={tdStyle}>{c.tipo_chip}</td>
                          <td style={tdStyle}>{c.numero_telefono}</td>
                          <td style={tdStyle}>${(c.monto_recarga ?? 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
              {chipsHoy.length > 0 && (
                <Box mt={1.5} pt={1} sx={{ borderTop: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: <strong>{chipsHoy.length}</strong> activación{chipsHoy.length !== 1 ? 'es' : ''}
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : (
            <>
              {/* ── Ventas del día ── */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Ventas del día
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Descripción</th>
                        <th style={thStyle}>Precio</th>
                        <th style={thStyle}>Comisión</th>
                        <th style={thStyle}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasHoyAcc.map((v) => (
                        <tr key={`acc-${v.id}`}>
                          <td style={tdStyle}><Chip label="Acc" size="small" sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} /></td>
                          <td style={tdStyle}>{v.producto}</td>
                          <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                          <td style={tdStyle}>${fmt(calcComision(v))}</td>
                          <td style={tdStyle}>
                            <IconButton size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                      {ventasHoyTel.map((v) => (
                        <tr key={`tel-${v.id}`}>
                          <td style={tdStyle}><Chip label="Tel" size="small" sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} /></td>
                          <td style={tdStyle}>{v.producto}</td>
                          <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                          <td style={tdStyle}>${fmt(calcComision(v))}</td>
                          <td style={tdStyle}>
                            <IconButton size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                      {ventasHoyAcc.length === 0 && ventasHoyTel.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: 20 }}>
                            Sin ventas registradas hoy
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Box>
                <Box display="flex" justifyContent="flex-start" gap={3} mt={1.5} pt={1} sx={{ borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Accesorios: <strong>{ventasHoyAcc.length}</strong> | <strong>${fmt(totalPesosAcc)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teléfonos: <strong>{ventasHoyTel.length}</strong> | <strong>${fmt(totalPesosTel)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comisión total: <strong>${fmt(totalComisionHoy)}</strong>
                  </Typography>
                </Box>
              </Paper>

              {/* ── Comisiones del día ── */}
              <Paper sx={{ p: 2.5, bgcolor: '#f97316', color: 'white', border: 'none' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  Comisiones del día
                </Typography>
                {sinCiclo && (
                  <Alert severity="warning" sx={{ mb: 1.5, fontSize: 12 }}>
                    Sin ciclo de comisiones activo para hoy. Contacta al administrador.
                  </Alert>
                )}
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Accesorios</Typography>
                    <Typography variant="body2" fontWeight={600}>${comisionAccHoy.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Teléfonos</Typography>
                    <Typography variant="body2" fontWeight={600}>${comisionTelHoy.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.35)' }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={700}>Total comisionado</Typography>
                  <Typography variant="h5" fontWeight={800}>${totalComisionHoy.toFixed(2)}</Typography>
                </Box>
              </Paper>
            </>
          )}

          </Grid>
          </Grid>
        )}

        {/* ── Tab MIS VENTAS / MIS ACTIVACIONES ── */}
        {tabAsesor === 1 && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                type="date" size="small" label="Fecha"
                value={misVentasFecha}
                onChange={(e) => setMisVentasFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {esCadenas ? (
              /* ── Mis Activaciones (Cadenas C.) ── */
              <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
                {misActivacionesData.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                    Sin activaciones para esta fecha
                  </Typography>
                ) : isMobile ? (
                  /* Cards on mobile */
                  <Box>
                    {misActivacionesData.map((c) => (
                      <Box key={c.id} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: '#1e293b', fontSize: 13 }}>
                          {c.tipo_chip}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            {c.numero_telefono}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a', fontSize: 13 }}>
                            ${(c.monto_recarga ?? 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  /* Table on desktop */
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tipo de Chip</th>
                          <th style={thStyle}>Número</th>
                          <th style={thStyle}>Recarga</th>
                        </tr>
                      </thead>
                      <tbody>
                        {misActivacionesData.map((c) => (
                          <tr key={c.id}>
                            <td style={tdStyle}>{c.tipo_chip}</td>
                            <td style={tdStyle}>{c.numero_telefono}</td>
                            <td style={tdStyle}>${(c.monto_recarga ?? 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
                {misActivacionesData.length > 0 && (
                  <Box mt={1.5} pt={1} sx={{ borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total: <strong>{misActivacionesData.length}</strong> activación{misActivacionesData.length !== 1 ? 'es' : ''}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ) : (
              /* ── Mis Ventas (otros asesores) ── */
              <Paper sx={{ p: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Descripción</th>
                        <th style={thStyle}>Precio</th>
                        <th style={thStyle}>Comisión</th>
                        <th style={thStyle}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misVentasAcc.map((v) => (
                        <tr key={`mv-acc-${v.id}`}>
                          <td style={tdStyle}><Chip label="Acc" size="small" sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} /></td>
                          <td style={tdStyle}>{v.producto}</td>
                          <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                          <td style={tdStyle}>${fmt(calcComision(v))}</td>
                          <td style={tdStyle}>
                            <span style={{ color: v.cancelada ? '#ef4444' : '#22c55e', fontWeight: 600, fontSize: 12 }}>
                              {v.cancelada ? 'Cancelada' : 'Activa'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {misVentasTel.map((v) => (
                        <tr key={`mv-tel-${v.id}`}>
                          <td style={tdStyle}><Chip label="Tel" size="small" sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} /></td>
                          <td style={tdStyle}>{v.producto}</td>
                          <td style={tdStyle}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                          <td style={tdStyle}>${fmt(calcComision(v))}</td>
                          <td style={tdStyle}>
                            <span style={{ color: v.cancelada ? '#ef4444' : '#22c55e', fontWeight: 600, fontSize: 12 }}>
                              {v.cancelada ? 'Cancelada' : 'Activa'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {misVentasAcc.length === 0 && misVentasTel.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: 20 }}>
                            Sin ventas para esta fecha
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Box>
                <Box display="flex" justifyContent="flex-start" gap={3} mt={1.5} pt={1} sx={{ borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Accesorios: <strong>{misVentasAcc.filter((v) => !v.cancelada).length}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Teléfonos: <strong>{misVentasTel.filter((v) => !v.cancelada).length}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total vendido: <strong>${fmt(totalMisVentasPesos)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comisión: <strong>${fmt(totalMisVentasComision)}</strong>
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* ── Tab COMISIONES ── */}
        {tabAsesor === 2 && (
          <Box sx={{ maxWidth: { xs: '100%', sm: 680 } }}>
            {esCadenas ? (() => {
              const cadenaActual = sessionStorage.getItem('cadena_seleccionada') || '';
              const items = COMISIONES_POR_CADENA[cadenaActual];
              return (
                <Paper sx={{ overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Comisiones — {cadenaActual}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comisiones por tipo de activación registrada.
                    </Typography>
                  </Box>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: '70%' }}>Tipo de Chip</th>
                        <th style={{ ...thStyle, width: '30%' }}>Comisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!items ? (
                        <tr>
                          <td colSpan={2} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                            Sin comisiones configuradas para {cadenaActual}
                          </td>
                        </tr>
                      ) : items.map((item) => (
                        <tr key={item.tipo}>
                          <td style={tdStyle}>{item.tipo}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#16a34a' }}>
                            {item.comision}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                    <Typography variant="body2" color="text.secondary">
                      {items?.length ?? 0} tipos de activación
                    </Typography>
                  </Box>
                </Paper>
              );
            })() : (
              <Paper sx={{ overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" fontWeight={700}>Tasas de comisión configuradas</Typography>
                  <Typography variant="body2" color="text.secondary">Estas son las comisiones que se aplican a cada venta registrada.</Typography>
                </Box>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: '50%' }}>Producto / Tipo de venta</th>
                      <th style={{ ...thStyle, width: '25%' }}>Comisión</th>
                      <th style={{ ...thStyle, width: '25%' }}>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaComisionesItems.map((item) => (
                      <tr key={item.nombre}>
                        <td style={tdStyle}>{item.nombre}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#16a34a' }}>${fmt(item.comision)}</td>
                        <td style={tdStyle}>
                          {item.esTelefono
                            ? <Chip label="Teléfono" size="small" sx={{ bgcolor: '#eff6ff', color: '#0d1e3a', fontWeight: 700, fontSize: 11 }} />
                            : <Chip label="Accesorio" size="small" sx={{ bgcolor: '#fff7ed', color: '#f97316', fontWeight: 700, fontSize: 11 }} />
                          }
                        </td>
                      </tr>
                    ))}
                    {tablaComisionesItems.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                          Sin comisiones configuradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Typography variant="body2" color="text.secondary">
                    {tablaComisionesItems.filter((i) => !i.esTelefono).length} accesorios · {tablaComisionesItems.filter((i) => i.esTelefono).length} teléfonos
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* ── Tab NÓMINA (solo Cadenas C.) ── */}
        {tabAsesor === 3 && esCadenas && (() => {
          const ciclos = getCiclos();
          const cicloActual = ciclos[nominaCicloIdx] ?? ciclos[0];
          const incubadora = nominaChips.filter((c) => c.es_incubadora);
          const totalCobrar = nominaChips
            .filter((c) => c.validado && !c.es_incubadora)
            .reduce((s, c) => s + (c.comision ?? 0), 0);

          return (
            <Box>
              {/* Selector de ciclo */}
              <TextField
                select
                size="small"
                label="Ciclo"
                value={nominaCicloIdx}
                onChange={(e) => setNominaCicloIdx(Number(e.target.value))}
                sx={{ mb: 3, minWidth: { xs: '100%', sm: 360 } }}
              >
                {ciclos.map((c, i) => (
                  <MenuItem key={i} value={i}>{labelCiclo(c)}</MenuItem>
                ))}
              </TextField>

              {/* Cuadro 1: Activaciones del ciclo */}
              <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Activaciones del ciclo {fmtDiaMes(cicloActual.inicio)} al {fmtDiaMes(cicloActual.fin)} {cicloActual.fin.getFullYear()}
                  </Typography>
                </Box>

                {nominaChips.length === 0 ? (
                  <Box sx={{ px: 2.5, py: 2.5 }}>
                    <Typography color="text.secondary" variant="body2">Sin activaciones en este ciclo.</Typography>
                  </Box>
                ) : isMobile ? (
                  <Box sx={{ p: 1.5 }}>
                    {nominaChips.map((c) => {
                      const est = getEstadoChip(c);
                      return (
                        <Box key={c.id} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, color: '#1e293b' }}>
                              {c.tipo_chip}
                            </Typography>
                            <Typography variant="caption" sx={{ color: est.color, fontWeight: 700, fontSize: 11 }}>
                              {est.label}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                            {c.numero_telefono}
                          </Typography>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontSize: 12, color: '#475569' }}>
                              Recarga: ${(c.monto_recarga ?? 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12, color: '#16a34a' }}>
                              Comisión: ${(c.comision ?? 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tipo de Chip</th>
                          <th style={thStyle}>Número</th>
                          <th style={thStyle}>Recarga</th>
                          <th style={thStyle}>Comisión</th>
                          <th style={thStyle}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nominaChips.map((c) => {
                          const est = getEstadoChip(c);
                          return (
                            <tr key={c.id}>
                              <td style={tdStyle}>{c.tipo_chip}</td>
                              <td style={tdStyle}>{c.numero_telefono}</td>
                              <td style={tdStyle}>${(c.monto_recarga ?? 0).toFixed(2)}</td>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#16a34a' }}>${(c.comision ?? 0).toFixed(2)}</td>
                              <td style={{ ...tdStyle, color: est.color, fontWeight: 600 }}>{est.label}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                )}

                <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f0fdf4' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a' }}>
                    Total a cobrar el {fmtDiaMes(cicloActual.pago)}: ${totalCobrar.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>

              {/* Cuadro 2: Líneas en incubadora */}
              <Paper sx={{ overflow: 'hidden', mb: 2 }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" fontWeight={700}>Líneas en incubadora</Typography>
                </Box>

                {incubadora.length === 0 ? (
                  <Box sx={{ px: 2.5, py: 2.5 }}>
                    <Typography color="text.secondary" variant="body2">Sin líneas en incubadora este ciclo.</Typography>
                  </Box>
                ) : isMobile ? (
                  <Box sx={{ p: 1.5 }}>
                    {incubadora.map((c) => (
                      <Box key={c.id} sx={{ p: 1.5, mb: 1, border: '1px solid #fed7aa', borderRadius: 1.5, bgcolor: '#fff7ed' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, color: '#1e293b', mb: 0.5 }}>
                          {c.tipo_chip}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                          {c.numero_telefono}
                        </Typography>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontSize: 12, color: '#475569' }}>
                            Recarga: ${(c.monto_recarga ?? 0).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12, color: '#f97316' }}>
                            Comisión: ${(c.comision ?? 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tipo de Chip</th>
                          <th style={thStyle}>Número</th>
                          <th style={thStyle}>Recarga</th>
                          <th style={thStyle}>Comisión</th>
                          <th style={thStyle}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incubadora.map((c) => (
                          <tr key={c.id}>
                            <td style={tdStyle}>{c.tipo_chip}</td>
                            <td style={tdStyle}>{c.numero_telefono}</td>
                            <td style={tdStyle}>${(c.monto_recarga ?? 0).toFixed(2)}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: '#f97316' }}>${(c.comision ?? 0).toFixed(2)}</td>
                            <td style={{ ...tdStyle, color: '#f97316', fontWeight: 600 }}>En incubadora</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })()}
      </Box>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA ADMIN / ENCARGADO (sin cambios respecto al original)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {rol !== 'admin' && (
        <Grid item xs={12} md={6}>
          {formulario}
        </Grid>
      )}

      {/* ── Tablas grandes ── */}
      <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Realizadas</Typography>
          <div style={{ marginBottom: '1rem' }}>
            {user?.is_admin && modulos.length > 0 && (
              <>
                <label htmlFor="modulo">Selecciona Módulo</label>
                <select
                  id="modulo"
                  value={moduloId ?? ''}
                  onChange={(e) => setModuloId(e.target.value ? Number(e.target.value) : null)}
                  style={{ display: 'block', marginTop: 4, marginBottom: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }}
                >
                  <option value="">-- Selecciona un módulo --</option>
                  {modulos.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </>
            )}
            <TextField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} size="small" />
            <Button variant="contained" onClick={fetchVentas} style={{ marginLeft: '1rem' }}>Buscar</Button>
          </div>

          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nombre', 'Producto', 'Cantidad', 'Precio', 'Total', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', color: '#f97316', fontWeight: 700, background: '#f8fafc', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.filter((v) => v.tipo_producto === 'accesorios')
                  .slice(paginaAcc * filasPorPagina, (paginaAcc + 1) * filasPorPagina)
                  .map((v) => (
                    <tr key={v.id}>
                      <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                      <td style={{ padding: 8 }}>{v.producto}</td>
                      <td style={{ padding: 8 }}>{v.cantidad}</td>
                      <td style={{ padding: 8 }}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>${typeof v.total === 'number' ? v.total.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>{`${v.fecha} ${v.hora}`}</td>
                      <td style={{ padding: 8 }}>{v.cancelada ? 'Cancelada' : 'Activa'}</td>
                      <td style={{ padding: 8 }}>
                        <Button variant="outlined" size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>Cancelar</Button>
                      </td>
                    </tr>
                  ))}
                {ventas.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 8, textAlign: 'center' }}>No hay ventas registradas</td></tr>
                )}
              </tbody>
            </Box>
          </Paper>
          <TablePagination
            component="div"
            count={ventas.filter((v) => v.tipo_producto === 'accesorios').length}
            page={paginaAcc}
            onPageChange={(_, p) => setPaginaAcc(p)}
            rowsPerPage={filasPorPagina}
            rowsPerPageOptions={[filasPorPagina]}
          />
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">Total Ventas Accesorios: ${totalAccesorios.toFixed(2)}</Typography>
          </Box>
        </Box>
      </TableContainer>

      <TableContainer>
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>Ventas Teléfonos</Typography>
          <Paper>
            <Box p={2} component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nombre', 'Telefono', 'Chip casado', 'Tipo', 'Precio', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', color: '#f97316', fontWeight: 700, background: '#f8fafc', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventasTelefonos.filter((v) => v.tipo_producto === 'telefono')
                  .slice(paginaTel * filasPorPagina, (paginaTel + 1) * filasPorPagina)
                  .map((v) => (
                    <tr key={v.id}>
                      <td style={{ padding: 8 }}>{v.empleado?.username}</td>
                      <td style={{ padding: 8 }}>{v.producto}</td>
                      <td style={{ padding: 8 }}>{v.chip_casado}</td>
                      <td style={{ padding: 8 }}>{v.tipo_venta}</td>
                      <td style={{ padding: 8 }}>${typeof v.precio_unitario === 'number' ? v.precio_unitario.toFixed(2) : '0.00'}</td>
                      <td style={{ padding: 8 }}>{new Date(v.fecha).toLocaleDateString()}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ color: v.cancelada ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                          {v.cancelada ? 'Cancelada' : 'Activa'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Button variant="outlined" size="small" color="error" disabled={v.cancelada} onClick={() => cancelarVenta(v.id)}>Cancelar</Button>
                      </td>
                    </tr>
                  ))}
                {ventasTelefonos.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 8, textAlign: 'center' }}>No hay ventas de teléfonos</td></tr>
                )}
              </tbody>
            </Box>
          </Paper>
          <TablePagination
            component="div"
            count={ventasTelefonos.length}
            page={paginaTel}
            onPageChange={(_, p) => setPaginaTel(p)}
            rowsPerPage={filasPorPagina}
            rowsPerPageOptions={[filasPorPagina]}
          />
          <Box mt={2} textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">Total Ventas Teléfonos: ${totalTelefonos.toFixed(2)}</Typography>
          </Box>
        </Box>
      </TableContainer>

      <Button variant="contained" onClick={() => navigate('/corte')}>Corte</Button>
    </Grid>
  );
};

export default FormularioVentaMultiple;
