import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Pill,
  Activity,
  User,
  Zap,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';

interface Reminder {
  id: string;
  title: string;
  description: string;
  reminder_type: string;
  time: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    reminder_type: 'medication',
    time: '09:00',
    frequency: 'daily',
  });

  const fetchReminders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Reminder[]>('/reminders');
      setReminders(data || []);
    } catch (err: any) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    return () => {};
  }, [user]);

  const handleAdd = async () => {
    if (!user || !form.title) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/reminders', {
        title: form.title,
        description: form.description,
        reminder_type: form.reminder_type,
        reminder_time: form.time,
        frequency: form.frequency,
      });

      toast({ title: 'Success', description: 'Reminder created successfully' });
      setForm({
        title: '',
        description: '',
        reminder_type: 'medication',
        time: '09:00',
        frequency: 'daily',
      });
      setOpen(false);
      fetchReminders();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create reminder',
        variant: 'destructive',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/reminders/${id}`, { is_active: !isActive });

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)),
      );
      toast({
        title: 'Success',
        description: `Reminder ${!isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update reminder',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reminders/${id}`);

      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Success', description: 'Reminder deleted' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete reminder',
        variant: 'destructive',
      });
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'appointment':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'checkup':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'exercise':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 animate-bounce flex items-center justify-center text-white font-bold shadow-md">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500 font-heading">Loading Medical Reminders Timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Medication & Health Reminders"
        description="Schedule time-critical medication doses, upcoming clinical checkups, and wellness alerts."
        breadcrumbs={[{ label: "Reminders" }]}
        badge="Active Schedule"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Reminder</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Bell className="w-5 h-5 text-teal-700" />
                  Create Health Reminder
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-normal">
                  Set automatic notification alerts for medications, visits, or daily vitals check-ins.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reminder Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Take Metformin 500mg (Post Meal)"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Instructions / Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g., Take with a full glass of water after lunch"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</Label>
                    <Select
                      value={form.reminder_type}
                      onValueChange={(v) => setForm({ ...form, reminder_type: v })}
                    >
                      <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="checkup">Health Checkup</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reminder Time</Label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="h-10 text-xs rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Repeat Frequency</Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(v) => setForm({ ...form, frequency: v })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="daily">Everyday (Daily)</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="once">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={submitLoading}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
                >
                  {submitLoading ? 'Creating...' : 'Save & Activate Reminder'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Reminders Timeline */}
      {reminders.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <Bell className="h-8 w-8 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">No Reminders Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Add your daily prescription doses and upcoming checkups to stay on track.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reminders.map((reminder, idx) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className={`rounded-2xl border transition-all duration-300 ${
                  reminder.is_active ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md' : 'bg-slate-50/70 border-slate-200/50 opacity-75'
                }`}>
                  <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4">
                      {/* Clock / Icon Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                        <Clock className="w-5 h-5 stroke-[2.2]" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 font-heading">
                            {reminder.title}
                          </h3>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getReminderTypeColor(reminder.reminder_type)}`}>
                            {reminder.reminder_type}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reminder.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {reminder.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>

                        {reminder.description && (
                          <p className="text-xs text-slate-600 font-normal">
                            {reminder.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                          <span className="flex items-center gap-1 text-teal-800 font-bold">
                            <Clock className="h-3.5 w-3.5" />
                            {reminder.time}
                          </span>
                          <span className="capitalize text-slate-400">• {reminder.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle and Delete Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(reminder.id, reminder.is_active)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                          reminder.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {reminder.is_active ? (
                          <span className="flex items-center gap-1">
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Enabled</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reminder.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-9 w-9"
                        title="Delete Reminder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

