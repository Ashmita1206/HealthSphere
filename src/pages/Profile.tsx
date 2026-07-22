import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Save,
  Camera,
  Heart,
  Zap,
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  Activity,
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';

interface Profile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  health_score: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    health_score: 75,
  });

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-700';
    if (score >= 60) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getHealthScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  useEffect(() => {
    if (user) {
      setFetchingProfile(true);
      api.get<Profile>('/user/profile')
        .then((data) => {
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              phone: data.phone || '',
              date_of_birth: data.date_of_birth || '',
              gender: data.gender || '',
              blood_type: data.blood_type || '',
              address: data.address || '',
              emergency_contact_name: data.emergency_contact_name || '',
              emergency_contact_phone: data.emergency_contact_phone || '',
              health_score: data.health_score || 75,
            });
          }
        })
        .finally(() => setFetchingProfile(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.put('/user/profile', profile);
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 animate-bounce flex items-center justify-center text-white font-bold shadow-md">
            <User className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500 font-heading">Loading Medical Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Patient Health Record & Profile"
        description="Manage your clinical demographics, emergency contacts, and vital medical history."
        breadcrumbs={[{ label: "Profile" }]}
        badge="HIPAA Compliant"
        actions={
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </Button>
        }
      />

      {/* Health Score Banner */}
      <Card className={`rounded-3xl border ${getHealthScoreBg(profile.health_score)} shadow-sm`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-sm shrink-0">
                <Activity className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Clinical Wellness Score</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold font-heading ${getHealthScoreColor(profile.health_score)}`}>
                    {profile.health_score}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
              </div>
            </div>

            <Badge className="text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs">
              {profile.health_score >= 80
                ? 'Optimal Health Rating'
                : profile.health_score >= 60
                  ? 'Good Clinical Baseline'
                  : 'Follow-Up Recommended'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Card */}
      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Demographics & Personal Details</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Primary identification and communication preferences</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-teal-600/30 shadow-md">
              <AvatarFallback className="bg-teal-700 text-white font-extrabold text-2xl font-heading rounded-2xl">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="text-xs font-bold text-slate-700 border-slate-200 rounded-xl h-9 gap-2">
                <Camera className="h-3.5 w-3.5 text-teal-700" />
                <span>Upload New Avatar</span>
              </Button>
              <p className="text-[11px] text-slate-400 mt-1 font-normal">JPG, PNG or WEBP (Max size 2MB)</p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Legal Name *</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="e.g. Dr. Eleanor Vance"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-teal-700" />
                Phone Number
              </Label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-700" />
                Date of Birth
              </Label>
              <Input
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</Label>
              <Select
                value={profile.gender || ''}
                onValueChange={(v) => setProfile({ ...profile, gender: v })}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-600" />
                Blood Group
              </Label>
              <Select
                value={profile.blood_type || ''}
                onValueChange={(v) => setProfile({ ...profile, blood_type: v })}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-700" />
                Residential Address
              </Label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="742 Evergreen Terrace, Springfield, OR"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Emergency Next-of-Kin Contact</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Designated guardian notified during 24/7 SOS dispatch alerts</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Person Name</Label>
              <Input
                value={profile.emergency_contact_name}
                onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                placeholder="e.g. Robert Vance (Spouse)"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-rose-600" />
                Contact Direct Phone
              </Label>
              <Input
                type="tel"
                value={profile.emergency_contact_phone}
                onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                placeholder="+1 (555) 982-1100"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

