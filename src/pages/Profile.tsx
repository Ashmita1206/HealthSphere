import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Save, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", gender: "", blood_type: "", address: "" });

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name || "", phone: data.phone || "", gender: data.gender || "", blood_type: data.blood_type || "", address: data.address || "" });
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile Updated", description: "Your profile has been saved." });
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div><CardTitle>Personal Information</CardTitle><CardDescription>Update your profile details</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Full Name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1" /></div>
              <div><Label>Gender</Label><Select value={profile.gender} onValueChange={(v) => setProfile({ ...profile, gender: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div><Label>Blood Type</Label><Select value={profile.blood_type} onValueChange={(v) => setProfile({ ...profile, blood_type: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Address</Label><Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="mt-1" /></div>
            <Button onClick={handleSave} disabled={loading} className="btn-healthcare"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
