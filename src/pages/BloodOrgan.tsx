import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Heart, Info, ArrowRight, ShieldCheck, HeartHandshake, FilePlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';

export default function BloodOrganPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [donorLoading, setDonorLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [donorForm, setDonorForm] = useState({
    blood_type: '',
    organ_type: '',
    willing_to_donate: 'blood',
  });

  const [requestForm, setRequestForm] = useState({
    blood_type: '',
    organ_type: '',
    urgency: 'routine',
    medical_reason: '',
  });

  const handleRegisterDonor = async () => {
    if (!user || !donorForm.blood_type || !donorForm.willing_to_donate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setDonorLoading(true);
    try {
      await api.post('/health/donors', {
        blood_type: donorForm.blood_type,
        organ_type:
          donorForm.organ_type && donorForm.organ_type !== 'none'
            ? donorForm.organ_type
            : null,
        willing_to_donate: donorForm.willing_to_donate,
      });

      toast({
        title: 'Success',
        description: 'Thank you for registering as a donor!',
      });
      setDonorForm({
        blood_type: '',
        organ_type: '',
        willing_to_donate: 'blood',
      });
      setDonorDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to register donor',
        variant: 'destructive',
      });
    } finally {
      setDonorLoading(false);
    }
  };

  const handleRequestBloodOrgan = async () => {
    if (!user || !requestForm.blood_type) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setRequestLoading(true);
    try {
      await api.post('/health/donation-requests', {
        request_type:
          requestForm.blood_type === 'Not Applicable' ? 'organ' : 'blood',
        blood_type:
          requestForm.blood_type === 'Not Applicable'
            ? null
            : requestForm.blood_type,
        organ_type:
          requestForm.organ_type && requestForm.organ_type !== 'none'
            ? requestForm.organ_type
            : null,
        urgency: requestForm.urgency,
        notes: requestForm.medical_reason,
      });

      toast({
        title: 'Success',
        description: 'Your request has been submitted successfully!',
      });
      setRequestForm({
        blood_type: '',
        organ_type: '',
        urgency: 'routine',
        medical_reason: '',
      });
      setRequestDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Blood & Organ Donor Registry"
        description="Pledge to save lives by registering as a voluntary donor, or post emergency donor matching requests."
        breadcrumbs={[{ label: "Blood & Organ" }]}
        badge="Life Registry"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Blood Donor Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden flex flex-col justify-between group hover:shadow-card-hover transition-all">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Droplets className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Blood Donor Registration</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-normal">Join our emergency blood bank network</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Register your blood group to receive verified emergency dispatch alerts when patients in your area require urgent transfusions.
            </p>
            
            <Dialog open={donorDialogOpen} onOpenChange={setDonorDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                  Register as Voluntary Donor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-rose-600" />
                    Blood & Organ Donor Pledge
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-normal">
                    Your details will remain confidential and only shared with verified trauma hospitals.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Blood Group *</Label>
                    <Select
                      value={donorForm.blood_type}
                      onValueChange={(v) => setDonorForm({ ...donorForm, blood_type: v })}
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
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Donation Preference *</Label>
                    <Select
                      value={donorForm.willing_to_donate}
                      onValueChange={(v) => setDonorForm({ ...donorForm, willing_to_donate: v })}
                    >
                      <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="blood">Blood Only</SelectItem>
                        <SelectItem value="organ">Organ Only</SelectItem>
                        <SelectItem value="both">Both Blood & Organ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(donorForm.willing_to_donate === 'organ' || donorForm.willing_to_donate === 'both') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pledged Organ Type</Label>
                      <Select
                        value={donorForm.organ_type || 'none'}
                        onValueChange={(v) => setDonorForm({ ...donorForm, organ_type: v === 'none' ? '' : v })}
                      >
                        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                          <SelectValue placeholder="Select Organ Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">All Viable Organs</SelectItem>
                          {['Heart', 'Lung', 'Liver', 'Kidney', 'Pancreas', 'Cornea', 'Bone Marrow'].map((organ) => (
                            <SelectItem key={organ} value={organ}>{organ}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleRegisterDonor}
                    disabled={donorLoading}
                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
                  >
                    {donorLoading ? 'Pledging...' : 'Confirm Donor Pledge'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Organ Pledge Information Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden flex flex-col justify-between group hover:shadow-card-hover transition-all">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Heart className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Organ Donation Awareness</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-normal">Guidelines, legal rights, and eligibility FAQs</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Learn how organ pledge cards function, ethical guidelines, and how a single donor can save up to 8 lives.
            </p>
            
            <Button
              variant="outline"
              onClick={() => navigate('/blood-organ/info')}
              className="w-full h-11 text-xs font-bold text-teal-800 border-teal-200 hover:bg-teal-50 rounded-xl flex items-center justify-center gap-2"
            >
              <Info className="h-4 w-4" />
              <span>Read Organ Donation Information Guide</span>
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Emergency Request Banner */}
      <Card className="rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Emergency Patient Request</span>
            </div>
            <h3 className="text-xl font-extrabold font-heading">Need Blood or Organ Transplants Urgently?</h3>
            <p className="text-xs text-teal-100/90 max-w-xl font-normal leading-relaxed">
              Submit a priority hospital request to broadcast your required blood group across our verified donor registry.
            </p>
          </div>

          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs px-6 py-3 rounded-xl shadow-lg shrink-0">
                <FilePlus className="w-4 h-4 mr-2 text-teal-700" />
                Submit Emergency Request
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-rose-600" />
                  Request Blood or Organ
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-normal">
                  Our clinical dispatch team will immediately alert nearby matching donors.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Blood Group *</Label>
                  <Select
                    value={requestForm.blood_type}
                    onValueChange={(v) => setRequestForm({ ...requestForm, blood_type: v })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Applicable'].map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Organ Type</Label>
                  <Select
                    value={requestForm.organ_type || 'none'}
                    onValueChange={(v) => setRequestForm({ ...requestForm, organ_type: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                      <SelectValue placeholder="Select Organ Type (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Not Applicable (Blood Only)</SelectItem>
                      {['Heart', 'Lung', 'Liver', 'Kidney', 'Pancreas', 'Cornea', 'Bone Marrow'].map((organ) => (
                        <SelectItem key={organ} value={organ}>{organ}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Urgency Level</Label>
                  <Select
                    value={requestForm.urgency}
                    onValueChange={(v) => setRequestForm({ ...requestForm, urgency: v })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="routine">Routine Request</SelectItem>
                      <SelectItem value="urgent">Urgent Hospital Request</SelectItem>
                      <SelectItem value="critical">Critical ICU Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Diagnosis / Notes</Label>
                  <Textarea
                    value={requestForm.medical_reason}
                    onChange={(e) => setRequestForm({ ...requestForm, medical_reason: e.target.value })}
                    placeholder="Describe patient condition, attending physician, and hospital ward..."
                    className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <Button
                  onClick={handleRequestBloodOrgan}
                  disabled={requestLoading}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
                >
                  {requestLoading ? 'Dispatching Request...' : 'Submit Emergency Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

    </div>
  );
}

