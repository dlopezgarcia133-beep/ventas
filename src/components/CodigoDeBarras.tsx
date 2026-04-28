// src/components/BarcodeScanner.tsx
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

type Props = {
  onScanSuccess: (decodedText: string) => void;
};

const BarcodeScanner: React.FC<Props> = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, (error) => {
      // puedes ignorar errores frecuentes
      console.warn("Scanning error:", error);
    });

    return () => {
      scanner.clear().catch((error) => {
        console.error("Error al limpiar el escáner", error);
      });
    };
  }, [onScanSuccess]);

  return <div id="barcode-reader" />;
};

export default BarcodeScanner;
