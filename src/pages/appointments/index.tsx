import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentForm, AppointmentFormData } from '@/components/appointments/AppointmentForm';
import { AppointmentEmptyState } from '@/components/appointments/AppointmentEmptyState';
import { AppointmentSkeleton } from '@/components/appointments/AppointmentSkeleton';
import { AppointmentStats } from '@/components/appointments/AppointmentStats';
import { AppointmentSearch } from '@/components/appointments/AppointmentSearch';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { AppointmentDrawer } from '@/components/appointments/AppointmentDrawer';
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

interface Appointment {
  id: string;
  doctor_name: string;
  specialty?: string;
  hospital?: string;
  appointment_date: string;
  status?: 'confirmed' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  purpose?: string;
  phone?: string;
  email?: string;
  preparation_instructions?: string;
  created_at?: string;
  updated_at?: string;
}

type FormMode = 'add' | 'edit';
type PendingAction = {
  type: 'delete' | 'cancel';
  appointment: Appointment;
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingAppointments, setFetchingAppointments] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editData, setEditData] = useState<AppointmentFormData | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const fetchAppointments = useCallback(async () => {
    if (!user) {
      setAppointments([]);
      setFetchingAppointments(false);
      return;
    }

    setFetchingAppointments(true);
    try {
      const data = await api.get<Appointment[]>('/health/appointments');
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setAppointments([]);
    } finally {
      setFetchingAppointments(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setFormMode('add');
    setEditData(undefined);
  }, []);

  const openAddForm = useCallback(() => {
    setSelectedAppointment(null);
    setEditData(undefined);
    setFormMode('add');
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(async (data: AppointmentFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post('/health/appointments', data);
      toast({ title: 'Appointment Scheduled Successfully' });
      closeForm();
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to schedule appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, fetchAppointments, toast, user]);

  const handleEdit = useCallback(async (data: AppointmentFormData) => {
    if (!user || !selectedAppointment) return;
    setLoading(true);
    try {
      await api.put(`/health/appointments/${selectedAppointment.id}`, data);
      toast({ title: 'Appointment Updated' });
      setDrawerOpen(false);
      setSelectedAppointment(null);
      closeForm();
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, fetchAppointments, selectedAppointment, toast, user]);

  const requestAction = useCallback(
    (type: PendingAction['type'], id: string) => {
      const appointment = appointments.find((apt) => apt.id === id);
      if (appointment) setPendingAction({ type, appointment });
    },
    [appointments],
  );

  const handleDelete = useCallback((id: string) => requestAction('delete', id), [requestAction]);
  const handleCancel = useCallback((id: string) => requestAction('cancel', id), [requestAction]);

  const handleConfirmedAction = useCallback(async () => {
    if (!pendingAction) return;
    setActionLoading(true);

    try {
      if (pendingAction.type === 'delete') {
        await api.delete(`/health/appointments/${pendingAction.appointment.id}`);
        setAppointments((current) =>
          current.filter((apt) => apt.id !== pendingAction.appointment.id),
        );
        toast({ title: 'Appointment Deleted' });
      } else {
        setAppointments((current) =>
          current.map((apt) =>
            apt.id === pendingAction.appointment.id ? { ...apt, status: 'cancelled' } : apt,
          ),
        );
        toast({ title: 'Appointment Cancelled' });
      }

      if (selectedAppointment?.id === pendingAction.appointment.id) {
        setDrawerOpen(false);
        setSelectedAppointment(null);
      }
      setPendingAction(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${pendingAction.type} appointment`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [pendingAction, selectedAppointment, toast]);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  }, []);

  const handleEditClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormMode('edit');
    setEditData({
      doctor_name: appointment.doctor_name,
      specialty: appointment.specialty || '',
      hospital: appointment.hospital || '',
      appointment_date: appointment.appointment_date,
      purpose: appointment.purpose || '',
      notes: appointment.notes || '',
    });
    setDrawerOpen(false);
    setFormOpen(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilter('all');
    setSortBy('date');
    setSearchQuery('');
  }, []);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfMonth = new Date(today);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.doctor_name.toLowerCase().includes(query) ||
          apt.specialty?.toLowerCase().includes(query) ||
          apt.hospital?.toLowerCase().includes(query) ||
          apt.purpose?.toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      switch (filter) {
        case 'today':
          filtered = filtered.filter((apt) => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === today.toDateString();
          });
          break;
        case 'tomorrow':
          filtered = filtered.filter((apt) => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === tomorrow.toDateString();
          });
          break;
        case 'upcoming':
          filtered = filtered.filter(
            (apt) =>
              new Date(apt.appointment_date) >= today &&
              apt.status !== 'cancelled' &&
              apt.status !== 'completed',
          );
          break;
        case 'completed':
          filtered = filtered.filter((apt) => apt.status === 'completed');
          break;
        case 'cancelled':
          filtered = filtered.filter((apt) => apt.status === 'cancelled');
          break;
        case 'missed':
          filtered = filtered.filter((apt) => apt.status === 'missed');
          break;
        case 'this-week':
          filtered = filtered.filter(
            (apt) => {
              const aptDate = new Date(apt.appointment_date);
              return aptDate >= today && aptDate <= endOfWeek;
            },
          );
          break;
        case 'this-month':
          filtered = filtered.filter(
            (apt) => {
              const aptDate = new Date(apt.appointment_date);
              return aptDate >= today && aptDate <= endOfMonth;
            },
          );
          break;
      }
    }

    return filtered;
  }, [appointments, filter, searchQuery]);

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
        case 'doctor':
          return a.doctor_name.localeCompare(b.doctor_name);
        case 'recent':
          return new Date(b.created_at || b.appointment_date).getTime() - new Date(a.created_at || a.appointment_date).getTime();
        case 'status':
          return (a.status || 'confirmed').localeCompare(b.status || 'confirmed');
        default:
          return 0;
      }
    });
  }, [filteredAppointments, sortBy]);

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

  if (fetchingAppointments) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Clinical Appointments & Consultations"
          description="Book, manage, and reschedule upcoming specialist visits across network hospitals."
          breadcrumbs={[{ label: 'Appointments' }]}
          badge="Confirmed Schedule"
          actions={
            <Button
              type="button"
              disabled
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
          }
        />
        <AppointmentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Clinical Appointments & Consultations"
        description="Book, manage, and reschedule upcoming specialist visits across network hospitals."
        breadcrumbs={[{ label: 'Appointments' }]}
        badge="Confirmed Schedule"
        actions={
          <Button
            type="button"
            onClick={openAddForm}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Button>
        }
      />

      {/* Stats */}
      <AppointmentStats appointments={appointments} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <AppointmentSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by doctor, hospital, or purpose..."
          />
        </div>
        <AppointmentFilters
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Appointments Grid */}
      {sortedAppointments.length === 0 ? (
        <AppointmentEmptyState
          type={emptyStateType}
          onAction={handleEmptyStateAction}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedAppointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={index}
              onDelete={handleDelete}
              onEdit={handleEditClick}
              onClick={handleAppointmentClick}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={formMode === 'edit' ? handleEdit : handleAdd}
        loading={loading}
        editData={editData}
        mode={formMode}
      />

      {/* Details Drawer */}
      <AppointmentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        appointment={selectedAppointment}
        onEdit={handleEditClick}
        onArchive={handleCancel}
        onDelete={handleDelete}
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
              {pendingAction?.type === 'cancel' ? 'Cancel appointment?' : 'Delete appointment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'cancel'
                ? `${pendingAction.appointment.doctor_name} appointment will be cancelled.`
                : `${pendingAction?.appointment.doctor_name ?? 'This appointment'} will be permanently deleted.`}
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
                pendingAction?.type === 'cancel'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600'
                  : 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600'
              }
            >
              {actionLoading
                ? 'Working...'
                : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
