import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Heart, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function BloodOrganPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [donorLoading, setDonorLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [donorForm, setDonorForm] = useState({
    blood_type: "",
    organ_type: "",
    willing_to_donate: "blood",
  });

  const [requestForm, setRequestForm] = useState({
    blood_type: "",
    organ_type: "",
    urgency: "routine",
    medical_reason: "",
  });

  const handleRegisterDonor = async () => {
    if (!user || !donorForm.blood_type || !donorForm.willing_to_donate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setDonorLoading(true);
    try {
      const { error } = await supabase.from("donors").insert({
        user_id: user.id,
        blood_type: donorForm.blood_type,
        organ_type: donorForm.organ_type || null,
        donation_type: donorForm.willing_to_donate,
        status: "active",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Thank you for registering as a donor!" });
      setDonorForm({ blood_type: "", organ_type: "", willing_to_donate: "blood" });
      setDonorDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to register donor", variant: "destructive" });
    } finally {
      setDonorLoading(false);
    }
  };

  const handleRequestBloodOrgan = async () => {
    if (!user || !requestForm.blood_type) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setRequestLoading(true);
    try {
      const { error } = await supabase.from("blood_organ_requests").insert({
        user_id: user.id,
        blood_type: requestForm.blood_type,
        organ_type: requestForm.organ_type || null,
        urgency: requestForm.urgency,
        medical_reason: requestForm.medical_reason,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Your request has been submitted successfully!" });
      setRequestForm({ blood_type: "", organ_type: "", urgency: "routine", medical_reason: "" });
      setRequestDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit request", variant: "destructive" });
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Blood & Organ Donation</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-healthcare">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <Droplets className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Blood Donation</CardTitle>
                  <CardDescription>Register as a blood donor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Help save lives by donating blood. Register to be matched with those in need.</p>
              <div className="space-y-2">
                <Dialog open={donorDialogOpen} onOpenChange={setDonorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-healthcare w-full">Register as Donor</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Register as Blood Donor</DialogTitle>
                      <DialogDescription>Help save lives by registering as a blood donor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Blood Type *</Label>
                        <Select value={donorForm.blood_type} onValueChange={(v) => setDonorForm({ ...donorForm, blood_type: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Willing to Donate *</Label>
                        <Select value={donorForm.willing_to_donate} onValueChange={(v) => setDonorForm({ ...donorForm, willing_to_donate: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blood">Blood Only</SelectItem>
                            <SelectItem value="organ">Organ Only</SelectItem>
                            <SelectItem value="both">Both Blood & Organ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(donorForm.willing_to_donate === "organ" || donorForm.willing_to_donate === "both") && (
                        <div>
                          <Label>Organ Type</Label>
                          <Select value={donorForm.organ_type} onValueChange={(v) => setDonorForm({ ...donorForm, organ_type: v })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select organ type" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Cornea", "Bone Marrow"].map((organ) => (
                                <SelectItem key={organ} value={organ}>{organ}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button onClick={handleRegisterDonor} disabled={donorLoading} className="w-full btn-healthcare">
                        {donorLoading ? "Registering..." : "Register as Donor"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Heart className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle>Organ Donation</CardTitle>
                  <CardDescription>Pledge to donate organs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Make a difference by pledging to donate organs and give the gift of life.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => navigate("/blood-organ/info")}>
                  <Info className="mr-2 h-4 w-4" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-healthcare mt-8">
          <CardHeader>
            <CardTitle>Need Blood or Organ?</CardTitle>
            <CardDescription>Submit a request to find available donors</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-healthcare">Request Blood/Organ</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Blood or Organ</DialogTitle>
                  <DialogDescription>Submit your request to our donor network</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Blood Type Needed *</Label>
                    <Select value={requestForm.blood_type} onValueChange={(v) => setRequestForm({ ...requestForm, blood_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Applicable"].map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Organ Type Needed</Label>
                    <Select value={requestForm.organ_type} onValueChange={(v) => setRequestForm({ ...requestForm, organ_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select organ type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Cornea", "Bone Marrow"].map((organ) => (
                          <SelectItem key={organ} value={organ}>{organ}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Urgency Level</Label>
                    <Select value={requestForm.urgency} onValueChange={(v) => setRequestForm({ ...requestForm, urgency: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Medical Reason</Label>
                    <Textarea
                      value={requestForm.medical_reason}
                      onChange={(e) => setRequestForm({ ...requestForm, medical_reason: e.target.value })}
                      placeholder="Describe your medical condition..."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleRequestBloodOrgan} disabled={requestLoading} className="w-full btn-healthcare">
                    {requestLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
