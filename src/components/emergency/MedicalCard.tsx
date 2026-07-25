import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Droplet, Phone, Download, Printer, QrCode } from 'lucide-react';

interface MedicalCardProps {
  profile: {
    name?: string;
    bloodGroup?: string;
    age?: number;
    allergies?: string[];
    chronicDiseases?: string[];
    surgeries?: string[];
    emergencyContact?: string;
    healthId?: string;
  };
  onDownload: () => void;
  onPrint: () => void;
}

export const MedicalCard = memo(function MedicalCard({
  profile,
  onDownload,
  onPrint,
}: MedicalCardProps) {
  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-50 text-red-700 border-red-200',
    'A-': 'bg-orange-50 text-orange-700 border-orange-200',
    'B+': 'bg-blue-50 text-blue-700 border-blue-200',
    'B-': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'AB+': 'bg-purple-50 text-purple-700 border-purple-200',
    'AB-': 'bg-pink-50 text-pink-700 border-pink-200',
    'O+': 'bg-teal-50 text-teal-700 border-teal-200',
    'O-': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-lg bg-gradient-to-br from-white to-slate-50 overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Medical ID Card
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.name || 'Not Set'}
              </p>
            </div>
          </div>
          {profile.healthId && (
            <Badge className="text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-200">
              ID: {profile.healthId}
            </Badge>
          )}
        </div>

        {/* Medical Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Blood Group
            </p>
            {profile.bloodGroup ? (
              <Badge
                className={`text-sm font-bold ${bloodGroupColors[profile.bloodGroup] || bloodGroupColors['O+']}`}
              >
                {profile.bloodGroup}
              </Badge>
            ) : (
              <p className="text-xs text-slate-400">Not Set</p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Age
            </p>
            <p className="text-sm font-bold text-slate-900">
              {profile.age || 'Not Set'}
            </p>
          </div>
        </div>

        {/* Allergies */}
        {profile.allergies && profile.allergies.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Allergies
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <Badge
                  key={index}
                  className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200"
                >
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Chronic Diseases */}
        {profile.chronicDiseases && profile.chronicDiseases.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Medical Conditions
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.chronicDiseases.map((disease, index) => (
                <Badge
                  key={index}
                  className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200"
                >
                  {disease}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {profile.emergencyContact && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-rose-700" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Emergency Contact
                </p>
                <p className="text-sm font-bold text-slate-900">{profile.emergencyContact}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Placeholder */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-slate-300 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400">QR Code Placeholder</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex-1 h-9 text-xs font-bold rounded-lg"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex-1 h-9 text-xs font-bold rounded-lg"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
