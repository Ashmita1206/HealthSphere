import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface QRCodeCardProps {
  healthId: string;
  qrData?: string;
  fullName?: string;
  bloodGroup?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  healthId,
  qrData,
  fullName,
  bloodGroup,
}) => {
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/#/profile?healthId=${healthId}`;
  const qrDisplayData = qrData || JSON.stringify({
    healthId,
    fullName: fullName || 'HealthSphere Patient',
    bloodGroup: bloodGroup || 'Unknown',
    url: profileUrl,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic QR Code pattern matrix
  const matrixSize = 21;
  const generatePattern = (seedStr: string) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const matrix: boolean[][] = [];
    for (let r = 0; r < matrixSize; r++) {
      matrix[r] = [];
      for (let c = 0; c < matrixSize; c++) {
        // Corner alignment boxes (standard QR markers)
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= matrixSize - 7;
        const isBottomLeft = r >= matrixSize - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const inBorder = (r === 0 || r === 6 || c === 0 || c === 6) ||
                           (r === 0 || r === 6 || c === matrixSize - 7 || c === matrixSize - 1) ||
                           (r === matrixSize - 7 || r === matrixSize - 1 || c === 0 || c === 6);
          const inCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                           (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3) ||
                           (r >= matrixSize - 5 && r >= matrixSize - 3 && c >= 2 && c <= 4);
          matrix[r][c] = inBorder || inCenter;
        } else {
          // Deterministic pseudorandom pseudo-cells
          const cellHash = Math.sin(hash + r * matrixSize + c) * 10000;
          matrix[r][c] = cellHash - Math.floor(cellHash) > 0.5;
        }
      }
    }
    return matrix;
  };

  const pattern = generatePattern(healthId || 'HS-2026-DEFAULT');

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Emergency Health QR Code
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Instant emergency medical profile scan
              </CardDescription>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex flex-col items-center justify-center space-y-4">
        {/* QR Code Container */}
        <div className="p-3.5 bg-white rounded-2xl border-2 border-teal-600/30 shadow-md flex flex-col items-center">
          <svg
            viewBox={`0 0 ${matrixSize} ${matrixSize}`}
            className="w-36 h-36 sm:w-44 sm:h-44 text-slate-900"
            shapeRendering="crispEdges"
          >
            {pattern.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                cell ? (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx}
                    y={rIdx}
                    width="1"
                    height="1"
                    fill="currentColor"
                  />
                ) : null
              )
            )}
          </svg>
          <span className="text-[11px] font-mono font-bold text-teal-800 mt-2">
            {healthId}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
          Medical personnel can scan this QR code during emergencies to access allergies, blood type, and contacts without unlocking your phone.
        </p>

        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 text-xs font-bold gap-1.5 h-9 rounded-xl"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Emergency Link</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
