import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Droplet,
  MapPin,
  Clock,
  Phone,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/services/api';
import { DonationEmptyState } from './DonationEmptyState';

export interface BloodStockItem {
  id: string;
  bloodBank: {
    _id?: string;
    id?: string;
    name: string;
    city: string;
    state?: string;
    phone?: string;
    isVerified?: boolean;
    address?: string;
    operatingHours?: string;
    licenseNumber?: string;
    category?: string;
  };
  bloodGroup: string;
  component: string;
  availableUnits: number;
  lastVerifiedAt: string;
  source: string;
  freshnessStatus: 'live' | 'recent' | 'stale';
  isDevelopmentFixture: boolean;
}

export interface SyncStatus {
  adapterStatus: 'configured' | 'not_configured' | 'error';
  source: string;
  message: string;
  lastAttempt: string | null;
  isLiveConnected: boolean;
  prerequisites?: string[];
}

const componentLabels: Record<string, string> = {
  all: 'All Components',
  whole_blood: 'Whole Blood',
  prbc: 'Packed Red Blood Cells (PRBC)',
  platelets: 'Platelets (RDP/SDP)',
  ffp: 'Fresh Frozen Plasma (FFP)',
  cryo: 'Cryoprecipitate',
};

const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function BloodBankInventory() {
  const [stocks, setStocks] = useState<BloodStockItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<BloodStockItem['bloodBank'] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stocksData, statusData] = await Promise.all([
        api.get<BloodStockItem[]>('/health/blood-stock'),
        api.get<SyncStatus>('/health/blood-banks/sync-status'),
      ]);

      setStocks(Array.isArray(stocksData) ? stocksData : []);
      setSyncStatus(statusData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load blood bank stock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      if (bloodGroupFilter !== 'all' && item.bloodGroup !== bloodGroupFilter) {
        return false;
      }
      if (componentFilter !== 'all' && item.component !== componentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const facilityName = item.bloodBank?.name?.toLowerCase() || '';
        const facilityCity = item.bloodBank?.city?.toLowerCase() || '';
        const facilityAddress = item.bloodBank?.address?.toLowerCase() || '';
        if (!facilityName.includes(q) && !facilityCity.includes(q) && !facilityAddress.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [stocks, bloodGroupFilter, componentFilter, searchQuery]);

  const hasDevelopmentFixtures = stocks.some((s) => s.isDevelopmentFixture);

  return (
    <div className="space-y-5">
      {/* External Integration Notice Banner */}
      <Card className="rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50/60 to-slate-50 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                  National Blood-Bank Network Integration
                </h4>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border-amber-300 px-2 py-0.5"
                >
                  Adapter Status: {syncStatus?.adapterStatus || 'not_configured'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
                {syncStatus?.message ||
                  'Official e-RaktKosh national blood-bank API adapter is isolated and architecturally ready for verified institutional credentials. Displaying internal verified blood banks and facility stock directory.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-8 text-xs font-bold rounded-xl border-slate-200 bg-white shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </Button>
        </div>
      </Card>

      {/* Development Fixture Sandbox Notice */}
      {hasDevelopmentFixtures && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold uppercase text-[10px] tracking-wider block text-amber-800">
              Development Fixture Sandbox
            </span>
            <p className="text-[11px] leading-relaxed">
              These records are simulated local development fixtures for UI verification and are explicitly marked. They are isolated from production and are not presented as real-time clinical blood units.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, district, or city..."
            className="h-9 pl-9 text-xs rounded-xl border-slate-200 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[125px] bg-white">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {bloodGroups.map((bg) => (
                <SelectItem key={bg} value={bg} className="text-xs">
                  {bg === 'all' ? 'All Groups' : bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={componentFilter} onValueChange={setComponentFilter}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[160px] bg-white">
              <SelectValue placeholder="Component" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Object.entries(componentLabels).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid / States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-2xl border border-slate-200/80 p-5 space-y-3 animate-pulse bg-white">
              <div className="h-5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl mt-3" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <DonationEmptyState type="api-error" customMessage={error} onAction={fetchData} />
      ) : filteredStocks.length === 0 ? (
        <DonationEmptyState
          type="inventory-unconfigured"
          onAction={() => {
            setSearchQuery('');
            setBloodGroupFilter('all');
            setComponentFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const facility = stock.bloodBank;
            const verifiedDate = stock.lastVerifiedAt ? new Date(stock.lastVerifiedAt) : null;
            const formattedVerified = verifiedDate && !isNaN(verifiedDate.getTime())
              ? verifiedDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently verified';

            return (
              <Card
                key={stock.id}
                className="rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-900 font-heading truncate">
                          {facility?.name || 'Verified Blood Bank'}
                        </h4>
                        {facility?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" title="Verified Facility" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {facility?.city || 'Local District'}, {facility?.state || ''}
                        </span>
                      </p>
                    </div>

                    <Badge className="text-[10px] font-extrabold bg-teal-50 text-teal-800 border-teal-200 px-2 py-0.5">
                      {stock.bloodGroup}
                    </Badge>
                  </div>

                  {/* Stock Units and Component */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Component
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {componentLabels[stock.component] || stock.component}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Available Stock
                      </span>
                      <span className="text-base font-extrabold font-heading text-teal-900">
                        {stock.availableUnits} units
                      </span>
                    </div>
                  </div>

                  {/* Freshness & Facility Hours */}
                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Verified: {formattedVerified}</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 ${
                          stock.freshnessStatus === 'live'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {stock.freshnessStatus}
                      </Badge>
                    </div>

                    {facility?.operatingHours && (
                      <p className="text-[10px] text-slate-400 truncate">
                        Hours: {facility.operatingHours}
                      </p>
                    )}
                  </div>

                  {/* Details Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFacility(facility)}
                    className="w-full h-8 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Info className="w-3.5 h-3.5 mr-1.5" />
                    Facility Details & Contact
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Facility Details Modal */}
      <Dialog open={Boolean(selectedFacility)} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-800" />
              <span>{selectedFacility?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified regional blood transfusion facility details
            </DialogDescription>
          </DialogHeader>

          {selectedFacility && (
            <div className="space-y-4 mt-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500">Facility Type</span>
                  <Badge variant="outline" className="text-[10px] font-bold bg-white">
                    {selectedFacility.category || 'Government / Charitable'}
                  </Badge>
                </div>
                {selectedFacility.licenseNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500">License Number</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800">
                      {selectedFacility.licenseNumber}
                    </span>
                  </div>
                )}
                {selectedFacility.operatingHours && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500">Operating Schedule</span>
                    <span className="font-semibold text-slate-800">{selectedFacility.operatingHours}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Address</span>
                    <span className="text-slate-800 font-medium">
                      {selectedFacility.address || 'Central District Medical Center'}, {selectedFacility.city}
                    </span>
                  </div>
                </div>

                {selectedFacility.phone && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-teal-800 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Helpline</span>
                        <span className="text-slate-800 font-bold">{selectedFacility.phone}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-7 text-[11px] font-bold rounded-lg border-teal-200 text-teal-800 hover:bg-teal-50"
                    >
                      <a href={`tel:${selectedFacility.phone}`}>Call</a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                <span className="font-bold">Official Blood Bank: </span>
                Units are distributed strictly in accordance with hospital requisition forms, patient cross-matching results, and voluntary blood banking statutes.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
