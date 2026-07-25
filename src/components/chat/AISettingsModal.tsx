import { memo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Globe,
  Sliders,
  Trash2,
  Volume2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { AISettings, Message } from './types';
import { useToast } from '@/hooks/use-toast';

interface AISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AISettings;
  onUpdateSettings: (newSettings: Partial<AISettings>) => void;
  onClearHistory: () => void;
  messages: Message[];
}

export const AISettingsModal = memo(function AISettingsModal({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onClearHistory,
  messages,
}: AISettingsModalProps) {
  const { toast } = useToast();

  const handleExportHistory = (format: 'json' | 'txt') => {
    if (messages.length === 0) {
      toast({
        title: 'Empty History',
        description: 'There are no messages to export.',
      });
      return;
    }

    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = messages
        .map(
          (m) =>
            `[${new Date(m.timestamp).toLocaleString()}] ${
              m.role === 'user' ? 'Patient' : 'HealthSphere AI'
            }:\n${m.content}\n`
        )
        .join('\n----------------------------------------\n');
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthSphere_AI_Consultation_${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'Consultation History Exported',
      description: `Downloaded as ${extension.toUpperCase()} file.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg rounded-3xl border-slate-200 bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold font-heading text-slate-900">
                AI Assistant Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Customize clinical response length, voice synthesis, and history.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5 text-xs">
          {/* Response Length */}
          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700">Clinical Response Length</Label>
            <Select
              value={settings.responseLength}
              onValueChange={(val) =>
                onUpdateSettings({ responseLength: val as AISettings['responseLength'] })
              }
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="concise">Concise (Bullet points & key takeaways)</SelectItem>
                <SelectItem value="detailed">Detailed (Comprehensive clinical breakdown)</SelectItem>
                <SelectItem value="clinical">Clinical (Doctor reference format with tables)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-slate-700">
              <Globe className="h-3.5 w-3.5 text-teal-700" /> Language
            </Label>
            <Select
              value={settings.language}
              onValueChange={(val) =>
                onUpdateSettings({ language: val as AISettings['language'] })
              }
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="en">English (US / UK Clinical)</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voice Placeholder Selector */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 font-bold text-slate-700">
              <Volume2 className="h-3.5 w-3.5 text-teal-700" /> Voice Synthesis Pitch
            </Label>
            <Select
              value={settings.voice}
              onValueChange={(val) =>
                onUpdateSettings({ voice: val as AISettings['voice'] })
              }
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="natural">Natural AI Assistant</SelectItem>
                <SelectItem value="female">Clinical Female Voice</SelectItem>
                <SelectItem value="male">Clinical Male Voice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Auto-Read AI Responses</span>
                <p className="text-[10px] text-slate-500">Automatically speak answers aloud when received.</p>
              </div>
              <Switch
                checked={settings.autoSpeak}
                onCheckedChange={(checked) => onUpdateSettings({ autoSpeak: checked })}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div>
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> High-Risk Emergency Alerts
                </span>
                <p className="text-[10px] text-slate-500">Flag severe symptoms with triage notifications.</p>
              </div>
              <Switch
                checked={settings.highRiskAlerts}
                onCheckedChange={(checked) => onUpdateSettings({ highRiskAlerts: checked })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExportHistory('txt')}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-teal-700" /> Export TXT
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExportHistory('json')}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-teal-700" /> Export JSON
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onClearHistory();
                onOpenChange(false);
              }}
              className="w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear All Conversation History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
