

export interface LoginResponse {
    access_token: string;
    token_type: string;
  }



export  interface Venta {
    id: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    comision: number;
    fecha: string;
    hora: string;
    total: number;
    usuario_nombre: string;
    cancelada: boolean;
}
  
export interface ProductoEnVenta {
    id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
}
  