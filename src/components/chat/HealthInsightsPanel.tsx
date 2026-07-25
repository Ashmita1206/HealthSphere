import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Droplets,
  Heart,
  Moon,
  Pill,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HealthInsightsPanel = memo(function HealthInsightsPanel() {
  const [healthScore] = useState(88);
  const [reminders, setReminders] = useState([
    { id: 'rem-1', label: 'Morning Metformin (500mg)', time: '8:00 AM', done: true, type: 'medicine' },
    { id: 'rem-2', label: 'Drink 2.5L Water Target', time: 'Daily', done: false, type: 'water' },
    { id: 'rem-3', label: '30 min Aerobic Walk', time: '6:00 PM', done: false, type: 'exercise' },
    { id: 'rem-4', label: 'Night Atorvastatin (10mg)', time: '9:00 PM', done: false, type: 'medicine' },
  ]);

  const { toast } = useToast();

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = !r.done;
          if (updated) {
            toast({
              title: 'Reminder Completed',
              description: `Marked "${r.label}" as completed!`,
            });
          }
          return { ...r, done: updated };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-4 text-xs">
      {/* AI Health Score Card */}
      <Card className="overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-200">
                AI Health Score
              </span>
            </div>
            <Badge className="border-teal-400/30 bg-teal-500/20 text-[10px] text-teal-200">
              Optimal
            </Badge>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold font-heading text-white">
                {healthScore}
                <span className="text-xs font-normal text-teal-200/70">/100</span>
              </p>
              <p className="text-[10px] text-teal-100/80">Excellent adherence & vital stability</p>
            </div>
            <Heart className="h-8 w-8 text-rose-400 animate-pulse" />
          </div>

          <Progress value={healthScore} className="h-1.5 bg-teal-950" />
        </CardContent>
      </Card>

      {/* Daily Clinical Tip */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-teal-800">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Daily Clinical Tip</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 font-medium">
            Taking Metformin with food reduces gastrointestinal side effects and enhances steady 24h glucose regulation.
          </p>
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Risk Indicators</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-2 border border-amber-100">
              <span className="font-semibold text-amber-900">Penicillin Allergy</span>
              <Badge className="bg-amber-200 text-amber-900 border-none text-[9px]">Severe Alert</Badge>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-200">
              <span className="font-medium text-slate-700">Systolic BP Target</span>
              <span className="font-bold text-teal-700">118/76 mmHg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Reminders Widget */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Bell className="h-4 w-4 text-teal-700" />
              <span className="font-bold uppercase tracking-wider text-[10px]">Daily Reminders</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {reminders.filter((r) => r.done).length}/{reminders.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                onClick={() => toggleReminder(rem.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                  rem.done
                    ? 'border-emerald-200 bg-emerald-50/50 text-slate-500'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-teal-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Checkbox checked={rem.done} onCheckedChange={() => toggleReminder(rem.id)} />
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${rem.done ? 'line-through text-slate-400' : ''}`}>
                      {rem.label}
                    </p>
                    <span className="text-[10px] text-slate-400">{rem.time}</span>
                  </div>
                </div>
                {rem.type === 'medicine' && <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                {rem.type === 'water' && <Droplets className="h-3.5 w-3.5 text-cyan-600 shrink-0" />}
                {rem.type === 'exercise' && <Activity className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-800">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Upcoming Appointment</span>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
            <p className="font-extrabold text-slate-900">Cardiology Follow-Up</p>
            <p className="text-[11px] text-blue-800 font-semibold mt-0.5">Dr. Ananya Rao • HealthSphere Heart Centre</p>
            <p className="text-[10px] text-slate-500 mt-1">Tomorrow at 10:30 AM</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
