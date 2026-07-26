import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Download, Printer, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DonorCard } from '@/components/bloodDonation/DonorCard';
import { DonorDrawer } from '@/components/bloodDonation/DonorDrawer';
import { BloodRequestCard } from '@/components/bloodDonation/BloodRequestCard';
import { BloodRequestForm, BloodRequestFormData } from '@/components/bloodDonation/BloodRequestForm';
import { DonationEmptyState } from '@/components/bloodDonation/DonationEmptyState';
import { DonationSkeleton } from '@/components/bloodDonation/DonationSkeleton';
import { DonationStats } from '@/components/bloodDonation/DonationStats';
import { DonationSummary } from '@/components/bloodDonation/DonationSummary';
import { DonationSearch } from '@/components/bloodDonation/DonationSearch';
import { DonationFilters } from '@/components/bloodDonation/DonationFilters';
import { EligibilityChecker } from '@/components/bloodDonation/EligibilityChecker';
import { exportDonorsToCSV, exportRequestsToCSV, printDonorList, printRequestList } from '@/components/bloodDonation/donationExportUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  city: string;
  lastDonation?: string;
  availability: 'available' | 'unavailable';
  distance?: number;
  phone?: string;
  email?: string;
  totalDonations?: number;
  medicalNotes?: string;
  eligibilityStatus?: 'eligible' | 'not-eligible' | 'maybe-eligible';
  donationHistory?: Array<{
    date: string;
    location: string;
    units: number;
  }>;
}

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  status: 'active' | 'fulfilled' | 'cancelled';
  contactNumber?: string;
  notes?: string;
}

type FormMode = 'add' | 'edit';
type PendingAction = {
  type: 'delete' | 'cancel' | 'fulfill';
  request: BloodRequest;
};

type ViewMode = 'donors' | 'requests' | 'both';

export default function BloodDonationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [editData, setEditData] = useState<BloodRequestFormData | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchDonors = useCallback(async () => {
    // TODO: Backend integration required for real donor APIs
    // TODO: Backend integration required for nearby donor geolocation
    try {
      const data = await api.get<Donor[]>('/health/blood-donors');
      setDonors(data || []);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
      setDonors([]);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    // TODO: Backend integration required for blood bank APIs
    try {
      const data = await api.get<BloodRequest[]>('/health/blood-requests');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    }
  }, []);

  const fetchMyDonations = useCallback(async () => {
    if (!user) return;
    // TODO: Backend integration required for user donation history
    try {
      const data = await api.get<any[]>('/health/my-donations');
      setMyDonations(data || []);
    } catch (err) {
      console.error('Failed to fetch my donations:', err);
      setMyDonations([]);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      await Promise.all([fetchDonors(), fetchRequests(), fetchMyDonations()]);
      setFetchingData(false);
    };
    void fetchData();
  }, [fetchDonors, fetchRequests, fetchMyDonations]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setFormMode('add');
    setEditData(undefined);
  }, []);

  const openAddForm = useCallback(() => {
    setFormMode('add');
    setEditData(undefined);
    setFormOpen(true);
  }, []);

  const handleAddRequest = useCallback(async (data: BloodRequestFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      // TODO: Backend integration required for blood request creation
      await api.post('/health/blood-requests', data);
      toast({ title: 'Blood Request Created' });
      closeForm();
      fetchRequests();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, fetchRequests, toast, user]);

  const handleEditRequest = useCallback(async (data: BloodRequestFormData) => {
    setLoading(true);
    try {
      // TODO: Backend integration required for blood request update
      toast({ title: 'Request Updated' });
      closeForm();
      fetchRequests();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, fetchRequests, toast]);

  const requestAction = useCallback(
    (type: PendingAction['type'], id: string) => {
      const request = requests.find((r) => r.id === id);
      if (request) setPendingAction({ type, request });
    },
    [requests],
  );

  const handleDeleteRequest = useCallback((id: string) => requestAction('delete', id), [requestAction]);
  const handleCancelRequest = useCallback((id: string) => requestAction('cancel', id), [requestAction]);
  const handleFulfillRequest = useCallback((id: string) => requestAction('fulfill', id), [requestAction]);

  const handleConfirmedAction = useCallback(async () => {
    if (!pendingAction) return;
    setActionLoading(true);

    try {
      // TODO: Backend integration required for request actions
      if (pendingAction.type === 'delete') {
        setRequests((current) => current.filter((r) => r.id !== pendingAction.request.id));
        toast({ title: 'Request Deleted' });
      } else if (pendingAction.type === 'cancel') {
        setRequests((current) =>
          current.map((r) => (r.id === pendingAction.request.id ? { ...r, status: 'cancelled' } : r)),
        );
        toast({ title: 'Request Cancelled' });
      } else if (pendingAction.type === 'fulfill') {
        setRequests((current) =>
          current.map((r) => (r.id === pendingAction.request.id ? { ...r, status: 'fulfilled' } : r)),
        );
        toast({ title: 'Request Marked as Fulfilled' });
      }
      setPendingAction(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [pendingAction, toast]);

  const handleDonorClick = useCallback((donor: Donor) => {
    setSelectedDonor(donor);
    setDrawerOpen(true);
  }, []);

  const handleContactDonor = useCallback((donor: Donor) => {
    // TODO: Backend integration required for contact functionality
    // TODO: Backend integration required for SMS notifications
    // TODO: Backend integration required for email notifications
    toast({
      title: 'Contact Donor',
      description: `Contacting ${donor.name}...`,
    });
  }, [toast]);

  const handleRequestClick = useCallback((request: BloodRequest) => {
    setFormMode('edit');
    setEditData({
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      hospital: request.hospital,
      unitsRequired: request.unitsRequired,
      requiredDate: request.requiredDate,
      contactNumber: request.contactNumber || '',
      notes: request.notes || '',
    });
    setFormOpen(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilter('all');
    setSortBy('distance');
    setSearchQuery('');
  }, []);

  const filteredDonors = useMemo(() => {
    let filtered = donors;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.city.toLowerCase().includes(query) ||
          d.bloodGroup.toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      switch (filter) {
        case 'available':
          filtered = filtered.filter((d) => d.availability === 'available');
          break;
        case 'unavailable':
          filtered = filtered.filter((d) => d.availability === 'unavailable');
          break;
        case 'nearby':
          filtered = filtered.filter((d) => d.distance !== undefined && d.distance < 50);
          break;
      }
    }

    return filtered;
  }, [donors, filter, searchQuery]);

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.patientName.toLowerCase().includes(query) ||
          r.hospital.toLowerCase().includes(query) ||
          r.bloodGroup.toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      switch (filter) {
        case 'critical':
          filtered = filtered.filter((r) => r.urgency === 'critical' && r.status === 'active');
          break;
        case 'active':
          filtered = filtered.filter((r) => r.status === 'active');
          break;
        case 'fulfilled':
          filtered = filtered.filter((r) => r.status === 'fulfilled');
          break;
      }
    }

    return filtered;
  }, [requests, filter, searchQuery]);

  const sortedDonors = useMemo(() => {
    return [...filteredDonors].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance ?? 999) - (b.distance ?? 999);
        case 'blood-group':
          return a.bloodGroup.localeCompare(b.bloodGroup);
        case 'recent':
          return (b.totalDonations ?? 0) - (a.totalDonations ?? 0);
        default:
          return 0;
      }
    });
  }, [filteredDonors, sortBy]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, high: 1, normal: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'blood-group':
          return a.bloodGroup.localeCompare(b.bloodGroup);
        case 'recent':
          return new Date(b.requiredDate).getTime() - new Date(a.requiredDate).getTime();
        default:
          return 0;
      }
    });
  }, [filteredRequests, sortBy]);

  const handleExportCSV = useCallback(() => {
    if (viewMode === 'donors' || viewMode === 'both') {
      exportDonorsToCSV(sortedDonors);
    }
    if (viewMode === 'requests' || viewMode === 'both') {
      exportRequestsToCSV(sortedRequests);
    }
    toast({ title: 'CSV Exported Successfully' });
  }, [sortedDonors, sortedRequests, toast, viewMode]);

  const handlePrint = useCallback(() => {
    if (viewMode === 'donors' || viewMode === 'both') {
      printDonorList(sortedDonors);
    }
    if (viewMode === 'requests' || viewMode === 'both') {
      printRequestList(sortedRequests);
    }
  }, [sortedDonors, sortedRequests, viewMode]);

  const emptyStateType = searchQuery.trim()
    ? 'search'
    : filter !== 'all'
      ? 'filter'
      : 'default';

  const handleEmptyStateAction = useCallback(() => {
    if (searchQuery.trim()) {
      setSearchQuery('');
      return;
    }
    if (filter !== 'all') {
      handleClearFilters();
      return;
    }
    openAddForm();
  }, [filter, handleClearFilters, openAddForm, searchQuery]);

  if (fetchingData) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Blood Donation & Requests"
          description="Find blood donors, manage requests, and track donation history."
          breadcrumbs={[{ label: 'Blood Donation' }]}
          badge="Save Lives"
          actions={
            <Button
              type="button"
              disabled
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Request</span>
            </Button>
          }
        />
        <DonationSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Blood Donation & Requests"
        description="Find blood donors, manage requests, and track donation history."
        breadcrumbs={[{ label: 'Blood Donation' }]}
        badge="Save Lives"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 text-xs font-bold rounded-lg"
              aria-label="Export to CSV"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 text-xs font-bold rounded-lg"
              aria-label="Print list"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
            <Button
              type="button"
              onClick={openAddForm}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Request</span>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <DonationStats donors={donors} requests={requests} myDonations={myDonations} />

      {/* Eligibility Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <div className="flex-1 w-full">
              <DonationSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search donors or requests..."
              />
            </div>
            <DonationFilters
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={viewMode === 'donors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('donors')}
              className={`h-9 text-xs font-bold rounded-lg ${viewMode === 'donors' ? 'bg-rose-700 text-white hover:bg-rose-800' : ''}`}
            >
              <Droplet className="h-3.5 w-3.5 mr-1.5" />
              Donors
            </Button>
            <Button
              type="button"
              variant={viewMode === 'requests' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('requests')}
              className={`h-9 text-xs font-bold rounded-lg ${viewMode === 'requests' ? 'bg-rose-700 text-white hover:bg-rose-800' : ''}`}
            >
              <Droplet className="h-3.5 w-3.5 mr-1.5" />
              Requests
            </Button>
            <Button
              type="button"
              variant={viewMode === 'both' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('both')}
              className={`h-9 text-xs font-bold rounded-lg ${viewMode === 'both' ? 'bg-rose-700 text-white hover:bg-rose-800' : ''}`}
            >
              Both
            </Button>
          </div>

          {/* Donors Grid */}
          {(viewMode === 'donors' || viewMode === 'both') && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Blood Donors</h3>
              {sortedDonors.length === 0 ? (
                <DonationEmptyState type="no-donors" onAction={handleEmptyStateAction} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {sortedDonors.map((donor, index) => (
                    <DonorCard
                      key={donor.id}
                      donor={donor}
                      index={index}
                      onContact={handleContactDonor}
                      onClick={handleDonorClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Grid */}
          {(viewMode === 'requests' || viewMode === 'both') && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Blood Requests</h3>
              {sortedRequests.length === 0 ? (
                <DonationEmptyState type="no-requests" onAction={handleEmptyStateAction} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {sortedRequests.map((request, index) => (
                    <BloodRequestCard
                      key={request.id}
                      request={request}
                      index={index}
                      onDelete={handleDeleteRequest}
                      onArchive={handleCancelRequest}
                      onFulfill={handleFulfillRequest}
                      onClick={handleRequestClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-5">
          {/* Summary */}
          <DonationSummary donors={donors} requests={requests} />
          {/* Eligibility Checker */}
          <EligibilityChecker />
        </div>
      </div>

      {/* Add/Edit Form Dialog */}
      <BloodRequestForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === 'edit' ? handleEditRequest : handleAddRequest}
        loading={loading}
        editData={editData}
        mode={formMode}
      />

      {/* Donor Drawer */}
      <DonorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        donor={selectedDonor}
        onContact={handleContactDonor}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-slate-900">
              {pendingAction?.type === 'delete'
                ? 'Delete request?'
                : pendingAction?.type === 'cancel'
                  ? 'Cancel request?'
                  : 'Mark as fulfilled?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'delete'
                ? `${pendingAction.request.patientName ?? 'This request'} will be permanently deleted.`
                : pendingAction?.type === 'cancel'
                  ? `${pendingAction.request.patientName} request will be cancelled.`
                  : `${pendingAction.request.patientName} request will be marked as fulfilled.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmedAction();
              }}
              className={
                pendingAction?.type === 'delete'
                  ? 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600'
                  : pendingAction?.type === 'cancel'
                    ? 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600'
              }
            >
              {actionLoading ? 'Working...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
