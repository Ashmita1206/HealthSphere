import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  ToggleLeft,
  ToggleRight,
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (err: any) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();

    // Set up real-time subscription for reminders
    if (!user) return;

    const subscription = supabase
      .channel(`reminders:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReminders((prev) => [payload.new as Reminder, ...prev]);
            toast({
              title: 'Reminder Created',
              description: 'New reminder added successfully',
            });
          } else if (payload.eventType === 'UPDATE') {
            setReminders((prev) =>
              prev.map((r) =>
                r.id === payload.new.id ? (payload.new as Reminder) : r,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setReminders((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        reminder_type: form.reminder_type,
        reminder_time: form.time,
        frequency: form.frequency,
        is_active: true,
      });

      if (error) throw error;

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
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase.from('reminders').delete().eq('id', id);

      if (error) throw error;

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
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'appointment':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'checkup':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'exercise':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
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
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Reminders</h1>
            <p className="text-muted-foreground mt-1">
              Manage your health reminders and notifications
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-healthcare">
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
                <DialogDescription>
                  Set up a reminder for medications, appointments, or health
                  activities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g., Take Blood Pressure Medicine"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Additional notes (optional)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.reminder_type}
                    onValueChange={(v) =>
                      setForm({ ...form, reminder_type: v })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="checkup">Health Checkup</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={form.frequency}
                    onValueChange={(v) => setForm({ ...form, frequency: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="once">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={submitLoading}
                  className="w-full btn-healthcare"
                >
                  {submitLoading ? 'Creating...' : 'Create Reminder'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {reminders.length === 0 ? (
          <Card className="card-healthcare">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Reminders Yet</h3>
              <p className="text-muted-foreground text-center mt-2">
                Set up reminders for medications, appointments, and health
                check-ups.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="card-healthcare">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          <Badge
                            className={getReminderTypeColor(
                              reminder.reminder_type,
                            )}
                          >
                            {reminder.reminder_type}
                          </Badge>
                          {reminder.is_active ? (
                            <Badge variant="default" className="bg-success">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {reminder.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {reminder.time}
                          </span>
                          <span className="capitalize">
                            {reminder.frequency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleToggle(reminder.id, reminder.is_active)
                          }
                          title={reminder.is_active ? 'Disable' : 'Enable'}
                        >
                          {reminder.is_active ? (
                            <ToggleRight className="h-5 w-5 text-success" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reminder.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
