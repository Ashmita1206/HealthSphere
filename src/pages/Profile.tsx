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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  useEffect(() => {
    if (user) {
      setFetchingProfile(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
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
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);
      if (error) throw error;
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
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal and health information
          </p>
        </div>

        {/* Health Score Card */}
        <Card
          className={cn(
            'card-healthcare mb-6 border-2',
            getHealthScoreBg(profile.health_score),
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full',
                    getHealthScoreBg(profile.health_score),
                  )}
                >
                  <Zap
                    className={cn(
                      'h-8 w-8',
                      getHealthScoreColor(profile.health_score),
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Overall Health Score
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      getHealthScoreColor(profile.health_score),
                    )}
                  >
                    {profile.health_score}
                  </p>
                </div>
              </div>
              <Badge className="text-lg px-4 py-2">
                {profile.health_score >= 80
                  ? 'Excellent'
                  : profile.health_score >= 60
                    ? 'Good'
                    : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card className="card-healthcare mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your basic profile details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF (max 2MB)
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Grid Layout for Form Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dob"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) =>
                    setProfile({ ...profile, date_of_birth: e.target.value })
                  }
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(v) => setProfile({ ...profile, gender: v })}
                >
                  <SelectTrigger id="gender" className="border-primary/20">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bloodType"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 text-destructive" />
                  Blood Type
                </Label>
                <Select
                  value={profile.blood_type || ''}
                  onValueChange={(v) =>
                    setProfile({ ...profile, blood_type: v })
                  }
                >
                  <SelectTrigger id="bloodType" className="border-primary/20">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State"
                  className="border-primary/20 md:col-span-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card className="card-healthcare mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
            <CardDescription>
              Information for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyName" className="text-sm font-medium">
                  Contact Name
                </Label>
                <Input
                  id="emergencyName"
                  value={profile.emergency_contact_name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergency_contact_name: e.target.value,
                    })
                  }
                  placeholder="e.g., John Doe"
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyPhone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Contact Number
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={profile.emergency_contact_phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergency_contact_phone: e.target.value,
                    })
                  }
                  placeholder="+1 (555) 987-6543"
                  className="border-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="btn-healthcare gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
