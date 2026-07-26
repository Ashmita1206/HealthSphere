import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquareText, ShieldCheck, ArrowRight, Activity, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIHealthSummaryWidgetProps {
  healthScore?: number;
}

export const AIHealthSummaryWidget = memo(function AIHealthSummaryWidget({
  healthScore = 85,
}: AIHealthSummaryWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-2xl border border-teal-200/80 shadow-xs bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 text-white overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600/90 text-white shadow-md border border-teal-500/50">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm font-heading">AI Health Triage</h3>
                <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 text-[9px] font-extrabold uppercase">
                  Active
                </Badge>
              </div>
              <p className="text-[10px] text-teal-200/80">Real-time clinical insights & advice</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ai-assistant')}
            className="text-teal-200 hover:text-white hover:bg-white/10 text-xs font-bold h-8 rounded-xl gap-1"
          >
            Launch Assistant <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="rounded-xl border border-teal-800/80 bg-teal-900/40 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-teal-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> Clinical Triage Summary
          </div>
          <p className="text-xs text-teal-100/90 leading-relaxed font-normal">
            Your patient health index stands at **{healthScore}%**. Medication compliance is stable. Continue DASH diet guidelines for blood pressure regulation.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-teal-200/80 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> HIPAA 256-Bit Encrypted
          </span>
          <Button
            type="button"
            variant="link"
            onClick={() => navigate('/ai-assistant')}
            className="text-teal-300 hover:text-white text-xs font-bold p-0 h-auto"
          >
            Ask AI Assistant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
