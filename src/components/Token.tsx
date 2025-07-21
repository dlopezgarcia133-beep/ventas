import { jwtDecode } from "jwt-decode";
import React from "react";

interface TokenData {
  sub: string;
  rol?: string;
  exp: number;
}

export const obtenerRolDesdeToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenData>(token);
    if (decoded && typeof decoded.rol === "string") {
      return decoded.rol;
    }
    return null;
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};