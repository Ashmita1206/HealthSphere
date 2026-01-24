import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Moon, Bell, Shield, Globe, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    medicineReminders: true,
    appointmentAlerts: true,
    healthTips: true,
    emergencyAlerts: true,
    dataSync: true,
    twoFactorAuth: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    email: user?.email || "",
    language: "en",
    timezone: "UTC",
  });

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user?.id,
          ...preferences,
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast({ title: "Success", description: "Preferences saved successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save preferences", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email!);
      if (error) throw error;
      toast({ title: "Success", description: "Password reset link sent to your email" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reset link", variant: "destructive" });
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="max-w-2xl space-y-6">
          
          {/* Appearance */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Medicine Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notified for medications</p>
                </div>
                <Switch
                  checked={preferences.medicineReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, medicineReminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Appointment Alerts</Label>
                  <p className="text-sm text-muted-foreground">Reminders before appointments</p>
                </div>
                <Switch
                  checked={preferences.appointmentAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, appointmentAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Health Tips</Label>
                  <p className="text-sm text-muted-foreground">Daily wellness recommendations</p>
                </div>
                <Switch
                  checked={preferences.healthTips}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, healthTips: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Emergency Alerts</Label>
                  <p className="text-sm text-muted-foreground">Critical health notifications</p>
                </div>
                <Switch
                  checked={preferences.emergencyAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emergencyAlerts: checked })
                  }
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={emailSettings.email}
                  disabled
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed directly</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <select
                    value={emailSettings.language}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, language: e.target.value })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <select
                    value={emailSettings.timezone}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, timezone: e.target.value })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                    <option value="PST">PST</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleChangePassword} variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Protect your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch
                  checked={preferences.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, twoFactorAuth: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Sync Health Data</Label>
                  <p className="text-sm text-muted-foreground">Sync data across devices</p>
                </div>
                <Switch
                  checked={preferences.dataSync}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, dataSync: checked })
                  }
                />
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  <strong>Data Encryption:</strong> AES-256 encryption is always enabled for your health data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSavePreferences} disabled={loading} className="btn-healthcare w-full">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
