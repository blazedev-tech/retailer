'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const qrCodeRegionId = "qr-reader";
    
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrCodeRegionId);
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Silent error - continuous scanning
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        setError('Failed to start camera. Please ensure camera permissions are granted.');
        console.error('QR Scanner error:', err);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          setIsScanning(false);
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full max-w-md mx-auto rounded-lg overflow-hidden"></div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {isScanning && (
        <div className="text-center text-sm text-gray-600">
          <p>Point your camera at the QR code</p>
          <p className="text-xs text-gray-500 mt-1">Make sure the QR code is well-lit and in focus</p>
        </div>
      )}
    </div>
  );
}
