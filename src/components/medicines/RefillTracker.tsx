import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, RefreshCw } from 'lucide-react';

interface RefillTrackerProps {
  remainingPills: number;
  totalPills: number;
  dailyDose: number;
}

export function RefillTracker({ remainingPills, totalPills, dailyDose }: RefillTrackerProps) {
  const percentage = totalPills > 0 ? (remainingPills / totalPills) * 100 : 0;
  const daysLeft = dailyDose > 0 ? Math.floor(remainingPills / dailyDose) : 0;
  const isLowStock = percentage < 20;

  return (
    <Card className={`rounded-2xl border ${isLowStock ? 'border-amber-200 bg-amber-50' : 'border-slate-200/80 bg-white'} shadow-sm`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className={`h-4 w-4 ${isLowStock ? 'text-amber-600' : 'text-teal-700'}`} />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Refill Status</span>
          </div>
          {isLowStock && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Remaining: {remainingPills} pills</span>
            <span className={`font-bold ${isLowStock ? 'text-amber-700' : 'text-teal-700'}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={percentage} className={`h-2 ${isLowStock ? '[&>div]:bg-amber-500' : '[&>div]:bg-teal-600'}`} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Estimated days left: {daysLeft}</span>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-7 text-[10px] font-bold rounded-lg"
            aria-label="Request refill"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refill
          </Button>
        </div>

        <p className="text-[9px] text-slate-400">
          TODO: Backend integration required for refill requests
        </p>
      </CardContent>
    </Card>
  );
}
