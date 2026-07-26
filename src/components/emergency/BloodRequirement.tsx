import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, AlertTriangle, Send } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BloodRequirementProps {
  onRequest: (data: any) => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = ['critical', 'high', 'normal'];

export const BloodRequirement = memo(function BloodRequirement({
  onRequest,
}: BloodRequirementProps) {
  const [bloodGroup, setBloodGroup] = useState('');
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState('');
  const [urgency, setUrgency] = useState('normal');

  const handleSubmit = () => {
    if (!bloodGroup || !hospital) return;

    // TODO: Backend integration for blood requirement request
    onRequest({
      bloodGroup,
      units,
      hospital,
      urgency,
    });

    setBloodGroup('');
    setUnits(1);
    setHospital('');
    setUrgency('normal');
  };

  const urgencyColors: Record<string, string> = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <Card className="rounded-2xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-white to-rose-50">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Blood Requirement</h3>
            <p className="text-[10px] text-slate-500">Quick emergency blood request</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Blood Group
            </Label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Units Required
            </Label>
            <Input
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
              className="h-10 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hospital
            </Label>
            <Input
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Hospital name"
              className="h-10 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Urgency
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {urgencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    <div className="flex items-center gap-2">
                      {level === 'critical' && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                      <span className="capitalize">{level}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {urgency === 'critical' && (
            <Badge className={`text-[10px] font-bold ${urgencyColors.critical}`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Critical Request
            </Badge>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!bloodGroup || !hospital}
            className="w-full h-10 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl"
          >
            <Send className="h-3.5 w-3.5 mr-2" />
            Generate Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
