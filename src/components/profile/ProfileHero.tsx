import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Printer,
  ShieldCheck,
  Sparkles,
  FileJson,
  Droplet,
  User,
  Calendar,
  Edit3,
  HeartHandshake,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';
import { useToast } from '@/hooks/use-toast';

interface ProfileHeroProps {
  profile: Profile;
  completionScore: number;
  healthId?: string;
  onExportJson: () => void;
  onPrintCard: () => void;
  onOpenAvatarModal?: () => void;
  onEditProfile?: () => void;
}

export const ProfileHero = memo(function ProfileHero({
  profile,
  completionScore,
  healthId,
  onExportJson,
  onPrintCard,
  onEditProfile,
}: ProfileHeroProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
      toast({
        title: 'Avatar Updated',
        description: 'Profile picture updated successfully.',
      });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const age = (() => {
    if (!profile.date_of_birth) return null;
    const dob = new Date(profile.date_of_birth);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    const calculated = Math.abs(ageDt.getUTCFullYear() - 1970);
    return calculated > 0 && calculated < 130 ? calculated : null;
  })();

  const realHealthId = healthId || (profile as unknown as { healthId?: string }).healthId || null;

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs bg-white text-slate-900 overflow-hidden">
      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Avatar & Patient Demographics */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl border-2 border-teal-600/30 shadow-xs ring-4 ring-teal-50">
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl}
                    alt={profile.full_name || 'Patient'}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-teal-700 text-white font-extrabold text-2xl font-heading rounded-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <label
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl bg-teal-700 text-white shadow-md transition-transform hover:scale-110 active:scale-95 focus-within:ring-2 focus-within:ring-teal-600"
                title="Update profile photo"
                aria-label="Upload profile photo"
              >
                <Camera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              {/* Patient Name & Clinical Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                  {profile.full_name || 'Patient Name'}
                </h2>

                {realHealthId && (
                  <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/90 px-2 py-0.5 rounded-md">
                    ID: {realHealthId}
                  </span>
                )}

                {profile.blood_type && profile.blood_type !== 'Unknown' && (
                  <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-rose-600" />
                    <span>{profile.blood_type}</span>
                  </Badge>
                )}

                {profile.organ_donor && (
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3 text-emerald-600" />
                    <span>Organ Donor</span>
                  </Badge>
                )}
              </div>

              {/* Demographic Details */}
              <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="capitalize">{profile.gender || 'Gender unrecorded'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {profile.date_of_birth
                      ? `DOB: ${profile.date_of_birth}${age ? ` (${age} yrs)` : ''}`
                      : 'DOB not recorded'}
                  </span>
                </span>
              </div>

              {/* Insurance Summary */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span className="truncate">
                  {profile.insurance_provider
                    ? `${profile.insurance_provider}${
                        profile.insurance_policy_number
                          ? ` (Policy: ${profile.insurance_policy_number})`
                          : ''
                      }`
                    : 'No insurance policy recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Profile Completeness Score & Quick Actions */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            {/* Completion indicator */}
            <div className="w-full sm:w-56 space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Profile Completeness</span>
                </span>
                <span className="text-slate-900 font-extrabold">{completionScore}%</span>
              </div>
              <Progress value={completionScore} className="h-2 bg-slate-200" />
            </div>

            {/* Actions group */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {onEditProfile && (
                <Button
                  type="button"
                  onClick={onEditProfile}
                  className="flex-1 sm:flex-initial bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold h-9 px-3.5 gap-1.5 shadow-xs cursor-pointer transition-all"
                  aria-label="Edit Profile Details"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExportJson}
                className="flex-1 sm:flex-initial bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
                title="Download Profile JSON"
                aria-label="Export Profile JSON"
              >
                <FileJson className="h-3.5 w-3.5 text-teal-700" />
                <span>Export JSON</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrintCard}
                className="flex-1 sm:flex-initial bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
                title="Print Medical ID Card"
                aria-label="Print Medical ID Card"
              >
                <Printer className="h-3.5 w-3.5 text-teal-700" />
                <span>Print Card</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
