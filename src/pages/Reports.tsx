import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_url?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", file: null as File | null });

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "Only PDF and image files are allowed", variant: "destructive" });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" });
        return;
      }
      setForm({ ...form, file });
    }
  };

  const handleUpload = async () => {
    if (!user || !form.title || !form.file) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}-${form.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, form.file);

      if (uploadError) throw uploadError;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from("reports")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      // Save report metadata
      const { error: dbError } = await supabase.from("reports").insert({
        user_id: user.id,
        title: form.title,
        file_type: form.file.type,
        file_size: form.file.size,
        file_path: fileName,
        file_url: urlData?.signedUrl,
      });

      if (dbError) throw dbError;

      toast({ title: "Success", description: "Report uploaded successfully" });
      setForm({ title: "", file: null });
      setOpen(false);
      fetchReports();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload report", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Success", description: "Report deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete report", variant: "destructive" });
    }
  };

  const handleDownload = (report: Report) => {
    if (report.file_url) {
      window.open(report.file_url, "_blank");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Reports</h1>
            <p className="text-muted-foreground mt-1">Manage and organize your medical reports</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-healthcare">
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Medical Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Report Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Blood Test Results"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Select File * (PDF, JPG, PNG)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  {form.file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {form.file.name} ({formatFileSize(form.file.size)})
                    </p>
                  )}
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full btn-healthcare">
                  {uploading ? "Uploading..." : "Upload Report"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {reports.length === 0 ? (
          <Card className="card-healthcare">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Reports Yet</h3>
              <p className="text-muted-foreground text-center mt-2">Upload your medical reports to keep them organized and accessible.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-healthcare">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-1">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{report.file_type.split("/")[1]?.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">{formatFileSize(report.file_size)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report)}
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
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
