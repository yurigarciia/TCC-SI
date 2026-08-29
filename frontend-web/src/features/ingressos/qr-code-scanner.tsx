"use client";

import { CameraIcon, CameraOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";

interface QrCodeScannerProps {
  onScan: (codigo: string) => void;
  /** Evita reagir de novo ao mesmo código enquanto ele continua no quadro da câmera. */
  cooldownMs?: number;
}

// Leitor de QR via câmera (emissao-ingresso.json: "QR code no app para quem tem, busca manual por
// nome no painel para quem não tem — os dois formatos coexistem"). A câmera só liga quando a
// diretoria clica em "Ativar câmera" — nunca pede permissão sozinho ao abrir a tela. O campo de
// texto (colar/digitar o código) continua funcionando em paralelo, como fallback sempre disponível
// se o dispositivo não tiver câmera ou a permissão for negada.
export function QrCodeScanner({ onScan, cooldownMs = 2000 }: QrCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const ultimoCodigoRef = useRef<{ codigo: string; em: number } | null>(null);

  const [ativo, setAtivo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (resultado) => {
        const codigo = resultado.data.trim();
        if (!codigo) return;
        const anterior = ultimoCodigoRef.current;
        const agora = Date.now();
        if (anterior && anterior.codigo === codigo && agora - anterior.em < cooldownMs) {
          return;
        }
        ultimoCodigoRef.current = { codigo, em: agora };
        onScan(codigo);
      },
      { preferredCamera: "environment", highlightScanRegion: true, highlightCodeOutline: true },
    );
    scannerRef.current = scanner;

    scanner
      .start()
      .then(() => setErro(null))
      .catch(() => {
        setErro("Não foi possível acessar a câmera — verifique a permissão do navegador.");
        setAtivo(false);
      });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo]);

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setAtivo((a) => !a)}>
        {ativo ? (
          <>
            <CameraOffIcon /> Desligar câmera
          </>
        ) : (
          <>
            <CameraIcon /> Ativar câmera para ler QR
          </>
        )}
      </Button>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {ativo && (
        <video
          ref={videoRef}
          className="aspect-square w-full max-w-xs rounded-lg border bg-black object-cover"
          muted
          playsInline
        />
      )}
    </div>
  );
}
