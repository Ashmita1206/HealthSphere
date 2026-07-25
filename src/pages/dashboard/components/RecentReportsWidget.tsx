import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Eye, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

interface Report {
  id: string;
  name: string;
  upload_date: string;
  status: string;
}

interface RecentReportsWidgetProps {
  limit?: number;
}

export function RecentReportsWidget({ limit = 3 }: RecentReportsWidgetProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        // TODO: Backend Integration - Verify if /api/reports endpoint exists and returns report data
        // Currently this endpoint may not be fully implemented
        const data = await api.get<Report[]>("/reports");
        setReports((data || []).slice(0, limit));
      } catch (err) {
        // TODO: Backend Integration - Remove this fallback when reports API is ready
        // For now, show empty state if API fails
        setError("Failed to load reports");
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [limit]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              Recent Reports
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Latest medical uploads</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || reports.length === 0) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              Recent Reports
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Latest medical uploads</CardDescription>
          </div>
          <Link to="/reports" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">No reports uploaded</p>
              <p className="text-[11px] text-slate-500 mt-1">Upload your medical reports to track your health history</p>
            </div>
            <Link to="/reports">
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm">
                Upload Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            Recent Reports
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-normal">Latest medical uploads</CardDescription>
        </div>
        <Link to="/reports" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5">
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2.5">
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">{report.name}</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {new Date(report.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge 
                  variant="outline" 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border-slate-200 text-slate-600"
                >
                  {report.status}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
