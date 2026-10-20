import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Download,
  Printer,
  Droplet,
  Users,
  Building2,
  History,
  Heart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { socket } from '@/services/socket';
import { PageHeader } from '@/components/ui/PageHeader';
import { DonorCard, Donor } from '@/components/bloodDonation/DonorCard';
import { DonorDrawer } from '@/components/bloodDonation/DonorDrawer';
import { BloodRequestCard, BloodRequest } from '@/components/bloodDonation/BloodRequestCard';
import { BloodRequestForm, BloodRequestFormData } from '@/components/bloodDonation/BloodRequestForm';
import { DonationEmptyState } from '@/components/bloodDonation/DonationEmptyState';
import { DonationSkeleton } from '@/components/bloodDonation/DonationSkeleton';
import { DonationStats } from '@/components/bloodDonation/DonationStats';
import { DonationSearch } from '@/components/bloodDonation/DonationSearch';
import { DonationFilters } from '@/components/bloodDonation/DonationFilters';
import { EligibilityChecker } from '@/components/bloodDonation/EligibilityChecker';
import { BloodBankInventory } from '@/components/bloodDonation/BloodBankInventory';
import {
  exportDonorsToCSV,
  exportRequestsToCSV,
  printDonorList,
  printRequestList,
} from '@/components/bloodDonation/donationExportUtils';
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
import { Card, CardContent } from '@/components/ui/card';

export interface MyDonation {
  id: string;
  donationDate: string;
  facility: string;
  units: number;
  status: string;
  bloodType?: string;
  notes?: string;
}

type FormMode = 'add' | 'edit';
type ViewTab = 'donors' | 'requests' | 'inventory' | 'history';

type PendingAction = {
  type: 'delete' | 'cancel' | 'fulfill';
  request: BloodRequest;
};

export default function BloodDonationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Primary Data
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [myDonations, setMyDonations] = useState<MyDonation[]>([]);

  // Loading & Error States
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ViewTab>('donors');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Dialogs & Drawers
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editData, setEditData] = useState<BloodRequestFormData | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // 1. Fetch Donors
  const fetchDonors = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/health/donors');
      if (Array.isArray(data)) {
        setDonors(
          data.map((d: any) => ({
            id: d._id || d.id,
            name: d.name || 'Consented Volunteer Donor',
            bloodGroup: d.bloodType || d.bloodGroup || 'Not specified',
            city: d.city || 'Regional Health Network',
            approximateArea: d.approximateArea || d.city || 'Local Area',
            availability: d.availability || (d.isAvailable === false ? 'unavailable' : 'available'),
            lastDonation: d.lastDonationDate || d.lastDonated || d.lastDonation,
            contactPreference: d.contactPreference || 'in-app',
            distance: d.distance,
          }))
        );
      } else {
        setDonors([]);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load donors');
      setDonors([]);
    }
  }, []);

  // 2. Fetch Requests
  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/health/donation-requests');
      if (Array.isArray(data)) {
        setRequests(
          data.map((r: any) => ({
            id: r._id || r.id,
            userId: r.userId,
            patientName: r.patientName || 'Blood Recipient',
            bloodGroup: r.bloodType || r.bloodGroup || 'Not specified',
            componentType: r.componentType || 'whole_blood',
            hospital: r.hospital || 'Medical Facility',
            approximateArea: r.approximateArea || '',
            unitsRequired: r.unitsRequired || r.unitsNeeded || 1,
            urgency:
              r.urgency?.toLowerCase() === 'critical'
                ? 'critical'
                : r.urgency?.toLowerCase() === 'high'
                  ? 'high'
                  : 'normal',
            contactNumber: r.contactPhone || r.contactNumber || '',
            requiredDate: r.requiredDate || r.requiredBy || new Date().toISOString(),
            notes: r.notes || r.additionalNotes || '',
            status: r.status || 'active',
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString(),
            isOwner: Boolean(r.isOwner),
          }))
        );
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load blood requests');
      setRequests([]);
    }
  }, []);

  // 3. Fetch Personal Donations
  const fetchMyDonations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get<MyDonation[]>('/health/my-donations');
      if (Array.isArray(data)) {
        setMyDonations(data);
      } else {
        setMyDonations([]);
      }
    } catch {
      setMyDonations([]);
    }
  }, [user]);

  // Initial Data Load
  const reloadAllData = useCallback(async () => {
    setFetchingData(true);
    setFetchError(null);
    await Promise.all([fetchDonors(), fetchRequests(), fetchMyDonations()]);
    setFetchingData(false);
  }, [fetchDonors, fetchRequests, fetchMyDonations]);

  useEffect(() => {
    void reloadAllData();
  }, [reloadAllData]);

  // 4. Socket.IO Real-time Subscription for Blood Requests
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleRequestCreated = (newReq: any) => {
      setRequests((prev) => {
        if (prev.some((r) => r.id === newReq.id)) return prev;
        const mapped: BloodRequest = {
          id: newReq.id,
          patientName: 'Blood Recipient',
          bloodGroup: newReq.bloodGroup || 'Not specified',
          componentType: newReq.componentType || 'whole_blood',
          hospital: newReq.hospital || 'Medical Facility',
          approximateArea: newReq.approximateArea || '',
          unitsRequired: newReq.unitsRequired || 1,
          requiredDate: newReq.requiredDate || new Date().toISOString(),
          urgency: newReq.urgency || 'normal',
          status: newReq.status || 'active',
          createdAt: newReq.timestamp || new Date().toISOString(),
          updatedAt: newReq.timestamp || new Date().toISOString(),
          isOwner: false,
        };
        return [mapped, ...prev];
      });
    };

    const handleRequestUpdated = (updatedReq: any) => {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === updatedReq.id) {
            return {
              ...r,
              bloodGroup: updatedReq.bloodGroup || r.bloodGroup,
              componentType: updatedReq.componentType || r.componentType,
              hospital: updatedReq.hospital || r.hospital,
              approximateArea: updatedReq.approximateArea || r.approximateArea,
              unitsRequired: updatedReq.unitsRequired || r.unitsRequired,
              requiredDate: updatedReq.requiredDate || r.requiredDate,
              urgency: updatedReq.urgency || r.urgency,
              status: updatedReq.status || r.status,
              updatedAt: updatedReq.updatedAt || new Date().toISOString(),
            };
          }
          return r;
        })
      );
    };

    const handleRequestDeleted = ({ id }: { id: string }) => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    };

    // Reconnection snapshot sync
    const handleReconnect = () => {
      void fetchRequests();
    };

    socket.on('blood:request-created', handleRequestCreated);
    socket.on('blood:request-updated', handleRequestUpdated);
    socket.on('blood:request-status-changed', handleRequestUpdated);
    socket.on('blood:request-deleted', handleRequestDeleted);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('blood:request-created', handleRequestCreated);
      socket.off('blood:request-updated', handleRequestUpdated);
      socket.off('blood:request-status-changed', handleRequestUpdated);
      socket.off('blood:request-deleted', handleRequestDeleted);
      socket.off('connect', handleReconnect);
    };
  }, [fetchRequests]);

  // Form Handlers
  const openAddForm = useCallback(() => {
    setFormMode('add');
    setEditData(undefined);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setFormMode('add');
    setEditData(undefined);
  }, []);

  // Workflow: Create Blood Request
  const handleAddRequest = useCallback(
    async (formData: BloodRequestFormData) => {
      if (!user) {
        toast({ title: 'Authentication Required', description: 'Please sign in to publish a request', variant: 'destructive' });
        return;
      }

      setFormSubmitting(true);
      try {
        const res = await api.post<any>('/health/donation-requests', {
          patientName: formData.patientName,
          bloodType: formData.bloodGroup,
          componentType: formData.componentType,
          hospital: formData.hospital,
          approximateArea: formData.approximateArea,
          unitsRequired: formData.unitsRequired,
          requiredDate: formData.requiredDate,
          urgency: formData.urgency,
          contactPhone: formData.contactNumber,
          notes: formData.notes,
        });

        toast({
          title: 'Blood Request Published',
          description: `Active requirement for ${formData.unitsRequired} unit(s) of ${formData.bloodGroup} registered.`,
        });

        closeForm();
        // Optimistic refresh
        await fetchRequests();
      } catch (err: any) {
        toast({
          title: 'Request Failed',
          description: err.message || 'Unable to create blood request',
          variant: 'destructive',
        });
      } finally {
        setFormSubmitting(false);
      }
    },
    [closeForm, fetchRequests, toast, user]
  );

  // Workflow: Edit Blood Request
  const handleEditRequest = useCallback(
    async (formData: BloodRequestFormData) => {
      if (!formData.id) return;
      setFormSubmitting(true);
      try {
        await api.put(`/health/donation-requests/${formData.id}`, {
          patientName: formData.patientName,
          bloodType: formData.bloodGroup,
          componentType: formData.componentType,
          hospital: formData.hospital,
          approximateArea: formData.approximateArea,
          unitsRequired: formData.unitsRequired,
          requiredDate: formData.requiredDate,
          urgency: formData.urgency,
          contactPhone: formData.contactNumber,
          notes: formData.notes,
        });

        toast({
          title: 'Request Updated',
          description: 'Blood requirement details have been saved.',
        });

        closeForm();
        await fetchRequests();
      } catch (err: any) {
        toast({
          title: 'Update Failed',
          description: err.message || 'Unable to update request',
          variant: 'destructive',
        });
      } finally {
        setFormSubmitting(false);
      }
    },
    [closeForm, fetchRequests, toast]
  );

  // Workflow: Trigger Edit Dialog
  const handleRequestClick = useCallback((request: BloodRequest) => {
    if (request.isOwner) {
      setFormMode('edit');
      setEditData({
        id: request.id,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        componentType: (request.componentType as any) || 'whole_blood',
        hospital: request.hospital,
        approximateArea: request.approximateArea || '',
        unitsRequired: request.unitsRequired,
        requiredDate: request.requiredDate,
        urgency: request.urgency,
        contactNumber: request.contactNumber || '',
        notes: request.notes || '',
      });
      setFormOpen(true);
    } else {
      toast({
        title: 'Clinical Requisition Details',
        description: `Facility: ${request.hospital}. Units: ${request.unitsRequired} (${request.bloodGroup}). Urgency: ${request.urgency.toUpperCase()}.`,
      });
    }
  }, [toast]);

  // Workflow: Request Actions (Fulfill, Cancel, Delete)
  const initiateAction = useCallback(
    (type: PendingAction['type'], id: string) => {
      const request = requests.find((r) => r.id === id);
      if (request) setPendingAction({ type, request });
    },
    [requests]
  );

  const handleDeleteRequest = useCallback((id: string) => initiateAction('delete', id), [initiateAction]);
  const handleCancelRequest = useCallback((id: string) => initiateAction('cancel', id), [initiateAction]);
  const handleFulfillRequest = useCallback((id: string) => initiateAction('fulfill', id), [initiateAction]);

  const handleConfirmedAction = useCallback(async () => {
    if (!pendingAction) return;
    setActionLoading(true);

    try {
      if (pendingAction.type === 'delete') {
        await api.delete(`/health/donation-requests/${pendingAction.request.id}`);
        setRequests((cur) => cur.filter((r) => r.id !== pendingAction.request.id));
        toast({ title: 'Request Deleted', description: 'Requisition permanently removed.' });
      } else if (pendingAction.type === 'cancel') {
        await api.put(`/health/donation-requests/${pendingAction.request.id}`, { status: 'cancelled' });
        setRequests((cur) =>
          cur.map((r) => (r.id === pendingAction.request.id ? { ...r, status: 'cancelled' } : r))
        );
        toast({ title: 'Request Cancelled', description: 'Requisition marked as cancelled.' });
      } else if (pendingAction.type === 'fulfill') {
        await api.put(`/health/donation-requests/${pendingAction.request.id}`, { status: 'fulfilled' });
        setRequests((cur) =>
          cur.map((r) => (r.id === pendingAction.request.id ? { ...r, status: 'fulfilled' } : r))
        );
        toast({ title: 'Request Fulfilled', description: 'Marked as fulfilled.' });
      }
      setPendingAction(null);
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message || 'Unable to update request state',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [pendingAction, toast]);

  // Workflow: Donor Drawer & Contact
  const handleDonorClick = useCallback((donor: Donor) => {
    setSelectedDonor(donor);
    setDrawerOpen(true);
  }, []);

  const handleContactDonor = useCallback(
    async (donor: Donor) => {
      if (!user) {
        toast({
          title: 'Sign In Required',
          description: 'Please sign in to contact volunteer blood donors.',
          variant: 'destructive',
        });
        return;
      }

      setContactLoading(true);
      try {
        const res = await api.post<{ success: boolean; message: string }>(
          `/health/donors/${donor.id}/contact`,
          {
            urgency: 'high',
            bloodGroup: donor.bloodGroup,
            message: `Clinical donation inquiry initiated by ${user.name || 'a registered coordinator'}.`,
          }
        );

        toast({
          title: 'Contact Request Dispatched',
          description:
            res.message ||
            `A confidential platform notification has been routed to ${donor.name}.`,
        });
        setDrawerOpen(false);
      } catch (err: any) {
        toast({
          title: 'Contact Dispatch Notice',
          description:
            err.message ||
            'Unable to dispatch automated notification. Donor remains protected under privacy protocols.',
          variant: 'destructive',
        });
      } finally {
        setContactLoading(false);
      }
    },
    [toast, user]
  );

  // Filters Reset
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setBloodGroupFilter('all');
    setAvailabilityFilter('all');
    setRequestStatusFilter('all');
    setUrgencyFilter('all');
    setSortBy('default');
  }, []);

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    let result = donors;

    if (bloodGroupFilter !== 'all') {
      result = result.filter((d) => d.bloodGroup === bloodGroupFilter);
    }

    if (availabilityFilter !== 'all') {
      result = result.filter((d) => d.availability === availabilityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.approximateArea?.toLowerCase().includes(q) ||
          d.bloodGroup.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'blood-group') {
      result = [...result].sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    } else if (sortBy === 'availability') {
      result = [...result].sort((a, b) => (a.availability === 'available' ? -1 : 1));
    }

    return result;
  }, [donors, bloodGroupFilter, availabilityFilter, searchQuery, sortBy]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    let result = requests;

    if (bloodGroupFilter !== 'all') {
      result = result.filter((r) => r.bloodGroup === bloodGroupFilter);
    }

    if (requestStatusFilter !== 'all') {
      result = result.filter((r) => r.status === requestStatusFilter);
    }

    if (urgencyFilter !== 'all') {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.hospital.toLowerCase().includes(q) ||
          r.approximateArea?.toLowerCase().includes(q) ||
          r.bloodGroup.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'urgency') {
      const order = { critical: 0, high: 1, normal: 2 };
      result = [...result].sort((a, b) => order[a.urgency] - order[b.urgency]);
    } else if (sortBy === 'blood-group') {
      result = [...result].sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    } else if (sortBy === 'date') {
      result = [...result].sort(
        (a, b) => new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime()
      );
    }

    return result;
  }, [requests, bloodGroupFilter, requestStatusFilter, urgencyFilter, searchQuery, sortBy]);

  // Export and Print
  const handleExportCSV = useCallback(() => {
    if (activeTab === 'donors') {
      exportDonorsToCSV(filteredDonors);
      toast({ title: 'Export Complete', description: 'Volunteer donor directory exported to CSV.' });
    } else if (activeTab === 'requests') {
      exportRequestsToCSV(filteredRequests);
      toast({ title: 'Export Complete', description: 'Clinical blood requests exported to CSV.' });
    } else {
      exportRequestsToCSV(requests);
      toast({ title: 'Export Complete', description: 'Requisitions exported to CSV.' });
    }
  }, [activeTab, filteredDonors, filteredRequests, requests, toast]);

  const handlePrint = useCallback(() => {
    if (activeTab === 'donors') {
      printDonorList(filteredDonors);
    } else {
      printRequestList(filteredRequests);
    }
  }, [activeTab, filteredDonors, filteredRequests]);

  if (fetchingData) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Blood Donation & Requests"
          description="Find verified blood donors, manage urgent requisitions, and discover authorized donation facilities."
          breadcrumbs={[{ label: 'Blood Donation & Requests' }]}
          badge="Health Registry"
        />
        <DonationSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Blood Donation & Requests"
        description="Find verified voluntary blood donors, manage clinical blood requisitions, and discover certified facility inventory."
        breadcrumbs={[{ label: 'Blood Donation & Requests' }]}
        badge="Life Saving Network"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 text-xs font-bold rounded-xl border-slate-200 shadow-xs"
              title="Export visible list to CSV"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 text-xs font-bold rounded-xl border-slate-200 shadow-xs"
              title="Print current list"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
            <Button
              type="button"
              onClick={openAddForm}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Blood Request</span>
            </Button>
          </div>
        }
      />

      {/* Summary Statistics */}
      <DonationStats
        donors={donors}
        requests={requests}
        myDonations={myDonations}
        error={fetchError}
        onRetry={reloadAllData}
      />

      {/* Main Grid Layout: Interactive Views & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Tabs & Content) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navigation Mechanism / Tab Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('donors')}
              className={`h-9 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'donors'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-teal-800" />
              <span>Volunteer Donors</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                {donors.length}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('requests')}
              className={`h-9 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'requests'
                  ? 'bg-white text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplet className="w-4 h-4 text-rose-700" />
              <span>Blood Requests</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-800">
                {requests.filter((r) => r.status === 'active').length}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('inventory')}
              className={`h-9 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-teal-800" />
              <span>Blood-Bank Inventory</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('history')}
              className={`h-9 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-slate-700" />
              <span>My Donations</span>
              {myDonations.length > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                  {myDonations.length}
                </span>
              )}
            </Button>
          </div>

          {/* Search & Filter Toolbar (For Donors and Requests) */}
          {(activeTab === 'donors' || activeTab === 'requests') && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <DonationSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  activeTab === 'donors'
                    ? 'Search donors by name, blood group, or district...'
                    : 'Search requests by patient, hospital, or blood group...'
                }
              />
              <DonationFilters
                viewMode={activeTab}
                bloodGroup={bloodGroupFilter}
                onBloodGroupChange={setBloodGroupFilter}
                availability={availabilityFilter}
                onAvailabilityChange={setAvailabilityFilter}
                requestStatus={requestStatusFilter}
                onRequestStatusChange={setRequestStatusFilter}
                urgency={urgencyFilter}
                onUrgencyChange={setUrgencyFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* TAB 1: DONORS */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Showing {filteredDonors.length} of {donors.length} volunteer donors
                </span>
                <span className="text-[11px] text-teal-800 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Protected platform contact dispatch
                </span>
              </div>

              {filteredDonors.length === 0 ? (
                <DonationEmptyState
                  type={searchQuery.trim() || bloodGroupFilter !== 'all' ? 'no-matching-donors' : 'no-donors'}
                  onAction={handleResetFilters}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDonors.map((donor, index) => (
                    <DonorCard
                      key={donor.id}
                      donor={donor}
                      index={index}
                      onContact={handleDonorClick}
                      onClick={handleDonorClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Showing {filteredRequests.length} of {requests.length} blood requests
                </span>
                <span className="text-[11px] text-slate-500">
                  Live synchronized via WebSocket
                </span>
              </div>

              {filteredRequests.length === 0 ? (
                <DonationEmptyState
                  type={
                    searchQuery.trim() || bloodGroupFilter !== 'all' || requestStatusFilter !== 'all'
                      ? 'no-matching-requests'
                      : 'no-requests'
                  }
                  onAction={openAddForm}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((request, index) => (
                    <BloodRequestCard
                      key={request.id}
                      request={request}
                      index={index}
                      onDelete={handleDeleteRequest}
                      onCancel={handleCancelRequest}
                      onFulfill={handleFulfillRequest}
                      onEdit={handleRequestClick}
                      onClick={handleRequestClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BLOOD-BANK INVENTORY */}
          {activeTab === 'inventory' && <BloodBankInventory />}

          {/* TAB 4: MY DONATIONS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                    My Voluntary Donation Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track your personal blood and component contributions.
                  </p>
                </div>
              </div>

              {myDonations.length === 0 ? (
                <DonationEmptyState type="no-history" onAction={() => setActiveTab('inventory')} />
              ) : (
                <div className="space-y-3">
                  {myDonations.map((item) => (
                    <Card key={item.id} className="rounded-2xl border border-slate-200/80 p-4 bg-white shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                            <Droplet className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{item.facility}</h4>
                            <p className="text-[11px] text-slate-500">
                              {new Date(item.donationDate).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-teal-900 block">
                            {item.units} unit{item.units > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-sm inline-block mt-0.5">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Eligibility Checker & Regulated Organ Guidance Teaser */}
        <div className="lg:col-span-1 space-y-5">
          {/* Eligibility Checker */}
          <EligibilityChecker />

          {/* Regulated Organ Donation Teaser Box */}
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-gradient-to-br from-slate-50 to-white overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
                  <Heart className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                    Organ Donation & NOTTO Guidance
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                    Separate Regulated Pathway
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Organ donation is governed by the Transplantation of Human Organs and Tissues Act (THOTA) and coordinated through NOTTO. It cannot be traded or reserved as public inventory.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/blood-organ/info')}
                className="w-full h-9 text-xs font-bold rounded-xl border-slate-200 text-teal-800 hover:bg-teal-50 hover:border-teal-300 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View Organ Guidance & NOTTO FAQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Blood Request Dialog */}
      <BloodRequestForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === 'edit' ? handleEditRequest : handleAddRequest}
        loading={formSubmitting}
        editData={editData}
        mode={formMode}
      />

      {/* Donor Profile Drawer */}
      <DonorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        donor={selectedDonor}
        onContact={handleContactDonor}
        contactLoading={contactLoading}
      />

      {/* Destructive Action Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-slate-900 text-base">
              {pendingAction?.type === 'delete'
                ? 'Permanently delete this blood request?'
                : pendingAction?.type === 'cancel'
                  ? 'Cancel this blood request?'
                  : 'Mark blood request as fulfilled?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              {pendingAction?.type === 'delete'
                ? 'This action cannot be undone. The requisition will be permanently removed from the hospital dashboard and matching network.'
                : pendingAction?.type === 'cancel'
                  ? 'The requisition will be marked as cancelled and donors will no longer be dispatched.'
                  : 'Confirm that required blood units have been collected and verified by the attending medical team.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} className="rounded-xl text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmedAction();
              }}
              className={`rounded-xl text-xs h-9 font-bold ${
                pendingAction?.type === 'delete'
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : pendingAction?.type === 'cancel'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {actionLoading ? 'Updating Server...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
