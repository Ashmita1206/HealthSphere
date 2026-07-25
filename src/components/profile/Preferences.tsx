import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Moon, Download, Printer, ShieldCheck, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Profile } from '@/pages/profile/profileData';

interface PreferencesProps {
  language: string;
  units: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  updateProfile: (updates: Partial<Profile>) => void;
  onExportJson?: () => void;
  onPrintCard?: () => void;
}

export function Preferences({
  language,
  units,
  notification_preferences,
  updateProfile,
  onExportJson,
  onPrintCard,
}: PreferencesProps) {
  const { theme, setTheme } = useTheme();

  const handleNotificationToggle = (key: keyof typeof notification_preferences) => {
    updateProfile({
      notification_preferences: {
        ...notification_preferences,
        [key]: !notification_preferences[key],
      },
    });
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                App Preferences & Privacy
              </h3>
              <p className="text-xs text-slate-500">
                Language, measurement units, notifications, theme, and data management.
              </p>
            </div>
          </div>
        </div>

        {/* Language & Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-purple-700" /> Language
            </Label>
            <Select
              value={language || 'en'}
              onValueChange={(v) => updateProfile({ language: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Language">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="en">English (US / UK Clinical)</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Measurement Units</Label>
            <Select
              value={units || 'metric'}
              onValueChange={(v) => updateProfile({ units: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Measurement units">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Theme & Notifications */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-purple-700" /> Notifications & Theme
          </Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Dark Mode Theme</p>
                <p className="text-[11px] text-slate-500">Switch application visual theme</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Dark mode theme"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Email Clinical Notifications</p>
                <p className="text-[11px] text-slate-500">Receive reports & prescription alerts via email</p>
              </div>
              <Switch
                checked={notification_preferences?.email}
                onCheckedChange={() => handleNotificationToggle('email')}
                aria-label="Email notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">SMS Critical Emergency Alerts</p>
                <p className="text-[11px] text-slate-500">Receive instant text alerts for urgent notifications</p>
              </div>
              <Switch
                checked={notification_preferences?.sms}
                onCheckedChange={() => handleNotificationToggle('sms')}
                aria-label="SMS notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Push Notifications</p>
                <p className="text-[11px] text-slate-500">In-app dosage & appointment reminders</p>
              </div>
              <Switch
                checked={notification_preferences?.push}
                onCheckedChange={() => handleNotificationToggle('push')}
                aria-label="Push notifications"
              />
            </div>
          </div>
        </div>

        {/* Data Export & Print Card Actions */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700" /> Data Export & Backup
          </span>

          <div className="flex flex-col sm:flex-row gap-3">
            {onExportJson && (
              <Button
                type="button"
                variant="outline"
                onClick={onExportJson}
                className="flex-1 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2"
              >
                <Download className="h-4 w-4 text-teal-700" /> Download Profile JSON
              </Button>
            )}

            {onPrintCard && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrintCard}
                className="flex-1 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2"
              >
                <Printer className="h-4 w-4 text-teal-700" /> Print Medical Card
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
