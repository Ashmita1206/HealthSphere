import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, Calendar, Heart, MapPin } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';

interface PersonalInformationProps {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  address: string;
  updateProfile: (updates: any) => void;
}

export function PersonalInformation({
  full_name,
  phone,
  date_of_birth,
  gender,
  blood_type,
  address,
  updateProfile,
}: PersonalInformationProps) {
  return (
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
        <ProfileAvatar full_name={full_name} />

        <div className="h-px bg-slate-100" />

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Legal Name *</Label>
            <Input
              id="full_name"
              value={full_name}
              onChange={(e) => updateProfile({ full_name: e.target.value })}
              placeholder="e.g. Dr. Eleanor Vance"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Full legal name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-teal-700" />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Phone number"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-teal-700" />
              Date of Birth
            </Label>
            <Input
              type="date"
              value={date_of_birth}
              onChange={(e) => updateProfile({ date_of_birth: e.target.value })}
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Date of birth"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</Label>
            <Select
              value={gender || ''}
              onValueChange={(v) => updateProfile({ gender: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Gender">
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
              value={blood_type || ''}
              onValueChange={(v) => updateProfile({ blood_type: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Blood group">
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
              value={address}
              onChange={(e) => updateProfile({ address: e.target.value })}
              placeholder="742 Evergreen Terrace, Springfield, OR"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Residential address"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
