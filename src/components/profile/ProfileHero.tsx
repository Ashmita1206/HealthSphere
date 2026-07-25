import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  QrCode,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';
import { useToast } from '@/hooks/use-toast';

interface ProfileHeroProps {
  profile: Profile;
  completionScore: number;
  onExportJson: () => void;
  onPrintCard: () => void;
  onOpenAvatarModal?: () => void;
}

export const ProfileHero = memo(function ProfileHero({
  profile,
  completionScore,
  onExportJson,
  onPrintCard,
}: ProfileHeroProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
      toast({ title: 'Avatar Updated', description: 'Profile picture updated successfully.' });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-md bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 text-white overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Personal Meta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <Avatar className="h-24 w-24 rounded-3xl border-4 border-teal-500/40 shadow-xl ring-4 ring-teal-900/50">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={profile.full_name} className="object-cover" />}
                <AvatarFallback className="bg-teal-700 text-white font-extrabold text-3xl font-heading rounded-3xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  {profile.full_name || 'Patient Name'}
                </h2>
                {profile.blood_type && (
                  <Badge className="bg-rose-600 text-white border-rose-500 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {profile.blood_type}
                  </Badge>
                )}
                {profile.organ_donor && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    Organ Donor
                  </Badge>
                )}
              </div>

              <p className="text-xs text-teal-200/80 flex items-center gap-1.5 flex-wrap">
                <span>{profile.gender || 'Not specified'}</span>
                <span>•</span>
                <span>{profile.date_of_birth ? `DOB: ${profile.date_of_birth}` : 'DOB Not set'}</span>
                <span>•</span>
                <span className="font-mono text-teal-300 font-bold">
                  ID: {profile.phone ? `HS-${profile.phone.slice(-4)}` : 'HS-2026-PATIENT'}
                </span>
              </p>

              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span className="text-[11px] font-semibold text-teal-200">
                  {profile.insurance_provider || 'CareHealth Premier'} ({profile.insurance_policy_number || 'CH-98745210'})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Completion Bar */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 border-t lg:border-t-0 lg:border-l border-teal-800/80 pt-4 lg:pt-0 lg:pl-6">
            {/* Completion indicator */}
            <div className="w-full sm:w-56 space-y-1.5 bg-white/10 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-teal-200 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" /> Profile Strength
                </span>
                <span className="text-white font-extrabold">{completionScore}%</span>
              </div>
              <Progress value={completionScore} className="h-2 bg-teal-950" />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExportJson}
                className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-bold gap-1.5"
                title="Download Profile JSON"
              >
                <FileJson className="h-3.5 w-3.5 text-teal-300" />
                <span>Export JSON</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={onPrintCard}
                className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                title="Print Medical ID Card"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Card</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
