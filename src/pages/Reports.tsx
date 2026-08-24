import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Upload, Download, Trash2, Calendar, FileUp, Sparkles, Filter, CheckCircle2, AlertCircle, Eye, Search 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";

interface Report {
  id: string;
  title: string;
  category?: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_url?: string;
  summary?: string;
  risk_level?: string;
  ocr_status?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", file: null as File | null });
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Report[]>("/reports");
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
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("file", form.file);
      await api.post("/reports/upload", payload);

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
      await api.delete(`/reports/${id}`);

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

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "ALL") return matchesSearch;
    if (filterType === "PDF") return matchesSearch && report.file_type.includes("pdf");
    if (filterType === "IMAGE") return matchesSearch && (report.file_type.includes("jpeg") || report.file_type.includes("png") || report.file_type.includes("jpg"));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 animate-bounce flex items-center justify-center text-white font-bold shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500 font-heading">Loading Medical Reports Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Medical Reports & Lab Results"
        description="Securely store, organize, and analyze lab PDF results, imaging studies, and physician prescriptions."
        breadcrumbs={[{ label: "Reports" }]}
        badge="Encrypted Vault"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload New Report</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-teal-700" />
                  Upload Medical Report
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Blood Panel CBC & Lipid Profile"
                    className="h-11 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select File * (PDF, JPG, PNG)</Label>
                  
                  {/* File Dropzone Mock Container */}
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-teal-50/30 transition-all cursor-pointer">
                    <FileUp className="w-8 h-8 text-teal-700 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">Click to browse or drag & drop</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10 MB</p>
                    
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {form.file && (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{form.file.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 shrink-0">{formatFileSize(form.file.size)}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Parsing & Uploading...</span>
                    </div>
                  ) : (
                    <span>Confirm & Save Report</span>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "PDF", "IMAGE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === type
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "ALL" ? "All Formats" : type === "PDF" ? "PDF Documents" : "Image Scans"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <FileText className="h-8 w-8 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">No Medical Reports Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload your blood test results, X-ray scans, or doctor prescriptions to store them safely.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 font-heading line-clamp-1 group-hover:text-teal-800 transition-colors">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 font-normal">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {report.file_type.split("/")[1]?.toUpperCase() || "DOC"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {formatFileSize(report.file_size)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(report)}
                        className="flex-1 text-xs font-bold text-teal-800 border-teal-200/80 hover:bg-teal-50 rounded-xl h-9 flex items-center justify-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(report.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-9 w-9 shrink-0"
                        title="Delete Report"
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

