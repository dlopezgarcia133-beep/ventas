

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
  fecha: string;
  cancelada: boolean;
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
  fecha_solicitud: string;
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
    fecha: string;
    hora: string;
  }[];
  ventas_telefonos: {
    marca: string;
    modelo: string;
    tipo: string;
    comision: number
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
