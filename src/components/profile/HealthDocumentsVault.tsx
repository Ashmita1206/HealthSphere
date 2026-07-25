import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Download,
  Eye,
  Trash2,
  Filter,
  Plus,
  ShieldCheck,
  Receipt,
  Syringe,
  TestTube,
  CreditCard,
} from 'lucide-react';
import type { ProfileDocument } from '@/pages/profile/profileData';
import { useToast } from '@/hooks/use-toast';

interface HealthDocumentsVaultProps {
  documents: ProfileDocument[];
  onUploadDocument: (doc: ProfileDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const HealthDocumentsVault = memo(function HealthDocumentsVault({
  documents,
  onUploadDocument,
  onDeleteDocument,
}: HealthDocumentsVaultProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleSimulatedFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    cat: ProfileDocument['category']
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: 'File Exceeds Size Limit',
        description: 'Maximum document upload limit is 15MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            const newDoc: ProfileDocument = {
              id: `doc-${Date.now()}`,
              title: file.name,
              category: cat,
              date: new Date().toISOString().slice(0, 10),
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              fileType: file.name.split('.').pop()?.toUpperCase() || 'PDF',
            };
            onUploadDocument(newDoc);
            toast({
              title: 'Document Saved',
              description: `"${file.name}" added to Health Vault.`,
            });
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    event.target.value = '';
  };

  const filteredDocs = documents.filter((d) => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: ProfileDocument['category']) => {
    switch (cat) {
      case 'report':
        return <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[9px] uppercase font-bold">Medical Report</Badge>;
      case 'lab':
        return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-[9px] uppercase font-bold">Lab Test</Badge>;
      case 'prescription':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] uppercase font-bold">Prescription</Badge>;
      case 'vaccination':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[9px] uppercase font-bold">Vaccination</Badge>;
      case 'insurance':
        return <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[9px] uppercase font-bold">Insurance Card</Badge>;
    }
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                Medical Records & Health Vault
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted repository for diagnostic lab reports, prescriptions, vaccinations, and insurance cards.
            </p>
          </div>

          {/* Document Upload Trigger Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 shadow-sm transition-all">
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleSimulatedFileUpload(e, 'report')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-teal-900">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="h-4 w-4 text-teal-600 animate-bounce" /> Uploading file to Health Vault...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5 bg-teal-100" />
          </div>
        )}

        {/* Search & Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'report', 'lab', 'prescription', 'vaccination', 'insurance'].map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-bold capitalize ${
                  selectedCategory === cat
                    ? 'bg-teal-700 text-white hover:bg-teal-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'All Records' : cat}
              </Button>
            ))}
          </div>

          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="h-8 text-xs rounded-xl border-slate-200 w-full sm:w-48"
          />
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {filteredDocs.length === 0 ? (
            <div className="col-span-full text-center py-10 opacity-60">
              <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No medical documents in vault</p>
              <p className="text-[10px] text-slate-400">Click Upload Document above to save reports</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <FileCheck className="h-4 w-4 text-teal-700" />
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-teal-800">
                        {doc.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Date: {doc.date}</span>
                    <span>{doc.fileSize} ({doc.fileType})</span>
                  </div>

                  <div>{getCategoryBadge(doc.category)}</div>
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5 mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toast({
                        title: 'Opening Document',
                        description: `Viewing ${doc.title} preview.`,
                      })
                    }
                    className="h-7 rounded-lg text-[10px] font-bold text-slate-600 hover:text-teal-700 hover:bg-slate-100 gap-1"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toast({
                        title: 'Document Downloaded',
                        description: `Downloaded ${doc.title}.`,
                      })
                    }
                    className="h-7 rounded-lg text-[10px] font-bold text-teal-700 hover:bg-teal-50 gap-1"
                  >
                    <Download className="h-3 w-3" /> Download
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
