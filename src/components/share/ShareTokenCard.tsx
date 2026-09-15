import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Clock,
  ExternalLink,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import type { SharePermissions } from '@/services/shareService';

interface ShareTokenCardProps {
  shareToken: string;
  shareLink: string;
  doctorName?: string;
  hospital?: string;
  expiresAt: string;
  permissions?: SharePermissions;
  onRevoke?: () => void;
  revoking?: boolean;
}

export const ShareTokenCard: React.FC<ShareTokenCardProps> = ({
  shareToken,
  shareLink,
  doctorName,
  hospital,
  expiresAt,
  permissions,
  onRevoke,
  revoking = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code generator matrix
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
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= matrixSize - 7;
        const isBottomLeft = r >= matrixSize - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const inBorder =
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            r === matrixSize - 7 ||
            r === matrixSize - 1 ||
            c === matrixSize - 7 ||
            c === matrixSize - 1;
          const inCenter =
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3) ||
            (r >= matrixSize - 5 && r >= matrixSize - 3 && c >= 2 && c <= 4);
          matrix[r][c] = inBorder || inCenter;
        } else {
          const cellHash = Math.sin(hash + r * matrixSize + c) * 10000;
          matrix[r][c] = cellHash - Math.floor(cellHash) > 0.5;
        }
      }
    }
    return matrix;
  };

  const pattern = generatePattern(shareToken);
  const formattedExpiry = new Date(expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Card className="rounded-2xl border-2 border-teal-600/30 shadow-md bg-white overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Active Share Session</h4>
            <p className="text-[10px] text-teal-300/90 font-mono">{shareToken}</p>
          </div>
        </div>
        <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30 text-[10px]">
          Expiring Access
        </Badge>
      </div>

      <CardContent className="p-5 space-y-4">
        {doctorName && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Granted To</span>
              <p className="font-bold text-slate-800">{doctorName}</p>
              {hospital && <p className="text-[11px] text-slate-500">{hospital}</p>}
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Expires</span>
              <p className="font-semibold text-teal-800 text-[11px] flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                <span>{formattedExpiry}</span>
              </p>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <svg
              viewBox={`0 0 ${matrixSize} ${matrixSize}`}
              className="w-32 h-32 text-slate-900"
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
          </div>
          <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
            The doctor can scan this QR code directly or use the link below to access your permitted records.
          </p>
        </div>

        {/* Share Link with Copy action */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400">Share Link URL</label>
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              readOnly
              value={shareLink}
              className="bg-transparent border-none text-xs text-slate-700 font-mono w-full focus:outline-none truncate"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Revoke Action */}
        {onRevoke && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>You can revoke this access at any time.</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRevoke}
              disabled={revoking}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 rounded-lg"
            >
              {revoking ? 'Revoking...' : 'Revoke Access'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
