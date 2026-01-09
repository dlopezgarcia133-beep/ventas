

export interface LoginResponse {
    access_token: string;
    token_type: string;
  }



export interface Venta {
  id: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  comision: number;
  tipo_venta: string;
  fecha: string;
  hora: string;
  cancelada: boolean;
  tipo_producto:"accesorio" | "telefono";
  empleado?: {
    username: string;
  };
}

export interface VentaTelefono {
  id: number;
  marca: string;
  modelo: string;
  tipo?: string;
  precio_venta: number;
  total: number;
  comision: number;
  metodo_pago: string;
  fecha: string;
  hora: string;
  cancelada?: boolean;
}
  
export interface ProductoEnVenta {
    id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
}
  

export interface Traspaso {
  id: number;
  producto: string;
  cantidad: number;
  modulo_origen: string;
  modulo_destino: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  fecha: string;
}


export interface Modulo {
  id: number;
  nombre: string;
}



export interface Usuario {
  id: number;
  username: string;
  rol: "admin" | "encargado" | "asesor";
  modulo: {
    id: number;
    nombre: string;
  } | null;
  is_admin: boolean;
}


export interface InventarioGeneral {
  id: number;
  producto: string;
  clave: string
  precio: number;
  cantidad: number;
}

export interface InventarioTelefono {
  id: number;
  marca: string;
  modelo: string;
  clave: string;  
  precio: number;
  cantidad: number;
}

export interface InventarioModulo {
  id: number;
  producto: string;
  clave: string;
  precio: number;
  cantidad: number;
  modulo: string;
}

export interface InventarioTelefonoModulo {
  id: number;
  marca: string;
  modelo: string;
  clave: string;  
  precio: number;
  cantidad: number;
}



export interface ProductoEnVenta {
  producto: string;
  cantidad: number;
  precio_unitario: number;
  tipo_producto: "accesorio" | "telefono";
}

export interface VentaChip {
  id: number;
  tipo_chip: string;
  numero_telefono: string;
  monto_recarga: number;
  fecha: string;
  hora: string;
  validado: boolean;
  comision: number;
  comision_manual: number;
  clave_b63: string;
  descripcion_rechazo: string;
  empleado?: {
    username: string;
  };
}



export interface ComisionData {
  inicio_ciclo: string;
  fin_ciclo: string;
  fecha_pago: string;
  total_accesorios: number;
  total_telefonos: number;
  total_chips: number;
  total_general: number;
  
  ventas_accesorios: {
    producto: string;
    cantidad: number;
    comision: number;
    tipo_venta: string;
    comision_total: number;
    fecha: string;
    hora: string;
  }[];
  ventas_telefonos: {
    producto: string;
    cantidad: number;
    comision: number;
    tipo_venta: string;
    comision_total: number;
    fecha: string;
    hora: string;
  }[];
  ventas_chips: {
    tipo_chip: string;
    numero_telefono: string;
    comision: number;
    comision_manual: number;
    fecha: string;
    hora: string;
  }[];
}


export interface Diferencia {
  marca?: string;
  modelo?: string;
  producto?: string;
  tipo?: string;
  clave: string;
  sistema: number;
  fisico: number;
  diferencia: number;
}

type EntradaItem = {
  producto_id: number;
  clave: string;
  producto?: string;
  cantidad: number; // cantidad RECIBIDA
};


// types/nomina.ts
export interface NominaPeriodo {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  estado: string;
}

export interface NominaEmpleado {
  usuario_id: number;
  username: string;

  rol: "asesor" | "encargado";
  comisiones: number;
  sueldo_base: number;
  horas_extra: number;
  pago_horas_extra: number;
  total_pagar: number;
}
