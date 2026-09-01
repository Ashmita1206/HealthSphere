import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Grid, List, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import { MedicineListView } from '@/components/medicines/MedicineListView';
import { MedicineForm, MedicineFormData } from '@/components/medicines/MedicineForm';
import { MedicineEmptyState } from '@/components/medicines/MedicineEmptyState';
import { MedicineSkeleton } from '@/components/medicines/MedicineSkeleton';
import { MedicineStats } from '@/components/medicines/MedicineStats';
import { MedicineStatusSummary } from '@/components/medicines/MedicineStatusSummary';
import { MedicineBulkActions } from '@/components/medicines/MedicineBulkActions';
import { MedicineSearch } from '@/components/medicines/MedicineSearch';
import { MedicineFilters } from '@/components/medicines/MedicineFilters';
import { MedicineDetailsDrawer } from '@/components/medicines/MedicineDetailsDrawer';
import { MedicineCalendar } from '@/components/medicines/MedicineCalendar';
import { MedicineScheduleDrawer } from '@/components/medicines/MedicineScheduleDrawer';
import type { Medicine } from '@/components/medicines/medicineTypes';
import {
  getMedicinesForDate,
  normalizeMedicine,
} from '@/components/medicines/medicineUtils';
import { exportMedicinesToCSV, printMedicineList } from '@/components/medicines/medicineExportUtils';
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

type FormMode = 'add' | 'edit' | 'duplicate';
type PendingAction = {
  type: 'delete' | 'archive';
  medicine: Medicine;
};

const timingFilters = ['morning', 'afternoon', 'night'];
const dateValue = (value?: string) => {
  const parsedValue = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

export default function MedicinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingMedicines, setFetchingMedicines] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<Date | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editData, setEditData] = useState<MedicineFormData | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchMedicines = useCallback(async () => {
    if (!user) {
      setMedicines([]);
      setFetchingMedicines(false);
      return;
    }

    setFetchingMedicines(true);
    try {
      const data = await api.get<unknown>('/health/medicines');
      const safeMedicines = Array.isArray(data) ? data : [];
      setMedicines(
        safeMedicines.map((medicine, index) =>
          normalizeMedicine(medicine, `medicine-${index}`),
        ),
      );
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      setMedicines([]);
    } finally {
      setFetchingMedicines(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setFormMode('add');
    setEditData(undefined);
  }, []);

  const openAddForm = useCallback(() => {
    setSelectedMedicine(null);
    setEditData(undefined);
    setFormMode('add');
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(async (data: MedicineFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const createdMedicine = await api.post<unknown>(
        '/health/medicines',
        data,
      );
      const optimisticMedicine = normalizeMedicine(
        {
          ...(createdMedicine && typeof createdMedicine === 'object'
            ? createdMedicine
            : {}),
          ...data,
        },
        `medicine-${Date.now()}`,
      );
      setMedicines((currentMedicines) => [
        optimisticMedicine,
        ...currentMedicines,
      ]);
      toast({ title: 'Medication Added to Rx Cabinet' });
      closeForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add medication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, toast, user]);

  const handleEdit = useCallback(async (data: MedicineFormData) => {
    if (!user || !selectedMedicine) return;
    setLoading(true);
    try {
      const updatedMedicine = await api.put<unknown>(
        `/health/medicines/${selectedMedicine.id}`,
        data,
      );
      const normalizedUpdated = normalizeMedicine(
        {
          ...(updatedMedicine && typeof updatedMedicine === 'object'
            ? updatedMedicine
            : {}),
          ...data,
          id: selectedMedicine.id,
        },
        selectedMedicine.id,
      );
      setMedicines((currentMedicines) =>
        currentMedicines.map((medicine) =>
          medicine.id === selectedMedicine.id
            ? normalizedUpdated
            : medicine,
        ),
      );
      toast({ title: 'Medication Updated' });
      setDrawerOpen(false);
      setSelectedMedicine(null);
      closeForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update medication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [closeForm, selectedMedicine, toast, user]);

  const requestAction = useCallback(
    (type: PendingAction['type'], id: string) => {
      const medicine = medicines.find((item) => item.id === id);
      if (medicine) setPendingAction({ type, medicine });
    },
    [medicines],
  );

  const handleDelete = useCallback(
    (id: string) => requestAction('delete', id),
    [requestAction],
  );

  const handleArchive = useCallback(
    (id: string) => requestAction('archive', id),
    [requestAction],
  );

  const handleConfirmedAction = useCallback(async () => {
    if (!pendingAction) return;
    setActionLoading(true);

    try {
      if (pendingAction.type === 'delete') {
        await api.delete(`/health/medicines/${pendingAction.medicine.id}`);
        setMedicines((currentMedicines) =>
          currentMedicines.filter(
            (medicine) => medicine.id !== pendingAction.medicine.id,
          ),
        );
        toast({ title: 'Medication Removed' });
      } else {
        setMedicines((currentMedicines) =>
          currentMedicines.map((medicine) =>
            medicine.id === pendingAction.medicine.id
              ? { ...medicine, status: 'archived' }
              : medicine,
          ),
        );
        toast({
          title: 'Medication Archived',
          description:
            'Archive status is kept for this session until backend persistence is available.',
        });
      }

      if (selectedMedicine?.id === pendingAction.medicine.id) {
        setDrawerOpen(false);
        setSelectedMedicine(null);
      }
      setPendingAction(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err.message ||
          `Failed to ${pendingAction.type} medication`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [pendingAction, selectedMedicine, toast]);

  const handleDuplicate = useCallback((id: string) => {
    const medicine = medicines.find((item) => item.id === id);
    if (!medicine) return;
    setSelectedMedicine(null);
    setFormMode('duplicate');
    setEditData({
      name: `Copy of ${medicine.name}`,
      dosage: medicine.dosage,
      strength: medicine.strength,
      frequency: medicine.frequency,
      timing: medicine.timing,
      remainingPills: medicine.remainingPills,
      totalPills: medicine.totalPills,
      startDate: medicine.startDate,
      endDate: medicine.endDate,
      doctorName: medicine.doctorName,
      description: medicine.description,
      instructions: medicine.instructions,
      notes: medicine.notes,
    });
    setFormOpen(true);
  }, [medicines]);

  const handleMedicineClick = useCallback((medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDrawerOpen(true);
  }, []);

  const handleEditClick = useCallback((medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormMode('edit');
    setEditData({
      name: medicine.name,
      dosage: medicine.dosage,
      strength: medicine.strength,
      frequency: medicine.frequency,
      timing: medicine.timing,
      remainingPills: medicine.remainingPills,
      totalPills: medicine.totalPills,
      startDate: medicine.startDate,
      endDate: medicine.endDate,
      doctorName: medicine.doctorName,
      description: medicine.description,
      instructions: medicine.instructions,
      notes: medicine.notes,
    });
    setDrawerOpen(false);
    setFormOpen(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilter('all');
    setSortBy('recent');
    setSearchQuery('');
  }, []);

  const handleSelectMedicine = useCallback((id: string) => {
    setSelectedIds((current) => {
      const newSet = new Set(current);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(query) ||
          medicine.dosage.toLowerCase().includes(query) ||
          medicine.doctorName?.toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      filtered = timingFilters.includes(filter)
        ? filtered.filter((medicine) =>
            medicine.timing?.toLowerCase().includes(filter),
          )
        : filtered.filter((medicine) => medicine.status === filter);
    }

    return filtered;
  }, [filter, medicines, searchQuery]);

  const sortedMedicines = useMemo(() => {
    return [...filteredMedicines].sort((firstMedicine, secondMedicine) => {
      switch (sortBy) {
        case 'name':
          return firstMedicine.name.localeCompare(secondMedicine.name);
        case 'recent':
          return (
            dateValue(secondMedicine.createdAt ?? secondMedicine.startDate) -
            dateValue(firstMedicine.createdAt ?? firstMedicine.startDate)
          );
        case 'expiry':
          return (
            dateValue(firstMedicine.endDate) -
            dateValue(secondMedicine.endDate)
          );
        case 'remaining':
          return (
            (firstMedicine.remainingPills ?? 0) -
            (secondMedicine.remainingPills ?? 0)
          );
        default:
          return 0;
      }
    });
  }, [filteredMedicines, sortBy]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedMedicines.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [sortedMedicines]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkArchive = useCallback(() => {
    // TODO: Backend integration required for bulk archive
    toast({
      title: 'Bulk Archive',
      description: 'Archive functionality requires backend integration',
      variant: 'destructive',
    });
  }, [toast]);

  const handleBulkDelete = useCallback(() => {
    // TODO: Backend integration required for bulk delete
    toast({
      title: 'Bulk Delete',
      description: 'Delete functionality requires backend integration',
      variant: 'destructive',
    });
  }, [toast]);

  const handleExportCSV = useCallback(() => {
    exportMedicinesToCSV(sortedMedicines);
    toast({ title: 'CSV Exported Successfully' });
  }, [sortedMedicines, toast]);

  const handlePrint = useCallback(() => {
    printMedicineList(sortedMedicines);
  }, [sortedMedicines]);

  const stats = useMemo(() => {
    const active = medicines.filter(
      (medicine) => medicine.status === 'active',
    ).length;
    const completed = medicines.filter(
      (medicine) => medicine.status === 'completed',
    ).length;
    const missed = medicines.filter(
      (medicine) => medicine.status === 'missed',
    ).length;
    const today = getMedicinesForDate(medicines, new Date()).length;
    const medicinesWithAdherence = medicines.filter(
      (medicine) => medicine.adherence !== undefined,
    );
    const averageAdherence =
      medicinesWithAdherence.length > 0
        ? medicinesWithAdherence.reduce(
            (sum, medicine) => sum + (medicine.adherence ?? 0),
            0,
          ) / medicinesWithAdherence.length
      : 0;

    return {
      active,
      completed,
      missed,
      today,
      completionRate: Math.round(averageAdherence),
    };
  }, [medicines]);

  const selectedCalendarMedicines = useMemo(
    () =>
      selectedCalendarDate
        ? getMedicinesForDate(medicines, selectedCalendarDate)
        : [],
    [medicines, selectedCalendarDate],
  );

  const handleCalendarDateSelect = useCallback((date: Date) => {
    setSelectedCalendarDate(date);
    setCalendarDrawerOpen(true);
  }, []);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setFormOpen(true);
      } else {
        closeForm();
      }
    },
    [closeForm],
  );

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

  if (fetchingMedicines) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Active Prescriptions & Rx Cabinet"
          description="Track daily dosage schedules, active medications, and refill frequencies."
          breadcrumbs={[{ label: "Medicines" }]}
          badge="Rx Cabinet"
          actions={
            <Button
              type="button"
              disabled
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medication</span>
            </Button>
          }
        />
        <MedicineSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Active Prescriptions & Rx Cabinet"
        description="Track daily dosage schedules, active medications, and refill frequencies."
        breadcrumbs={[{ label: "Medicines" }]}
        badge="Rx Cabinet"
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
              aria-label="Print medicine list"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
            <Button
              type="button"
              onClick={openAddForm}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medication</span>
            </Button>
          </div>
        }
      />

      {/* Status Summary */}
      <MedicineStatusSummary medicines={medicines} />

      {/* Stats */}
      <MedicineStats
        activeMedicines={stats.active}
        completedMedicines={stats.completed}
        missedDoses={stats.missed}
        todayMedicines={stats.today}
        completionRate={stats.completionRate}
      />

      {/* Search, Filters, and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="flex-1 w-full">
            <MedicineSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search medicines by name, dosage, or doctor..."
            />
          </div>
          <MedicineFilters
            filter={filter}
            onFilterChange={setFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`h-9 text-xs font-bold rounded-lg ${viewMode === 'grid' ? 'bg-teal-700 text-white hover:bg-teal-800' : ''}`}
            aria-label="Grid view"
          >
            <Grid className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`h-9 text-xs font-bold rounded-lg ${viewMode === 'list' ? 'bg-teal-700 text-white hover:bg-teal-800' : ''}`}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <MedicineBulkActions
        selectedCount={selectedIds.size}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
      />

      {/* Calendar View */}
      <MedicineCalendar
        medicines={medicines}
        onDateSelect={handleCalendarDateSelect}
      />

      {/* Medicines Grid/List */}
      {sortedMedicines.length === 0 ? (
        <MedicineEmptyState
          onAction={handleEmptyStateAction}
          type={emptyStateType}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMedicines.map((medicine, index) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              index={index}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
              onClick={handleMedicineClick}
            />
          ))}
        </div>
      ) : (
        <MedicineListView
          medicines={sortedMedicines}
          selectedIds={selectedIds}
          onSelect={handleSelectMedicine}
          onSelectAll={handleSelectAll}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onDuplicate={handleDuplicate}
          onClick={handleMedicineClick}
        />
      )}

      {/* Add/Edit Form Dialog */}
      <MedicineForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={formMode === 'edit' ? handleEdit : handleAdd}
        loading={loading}
        editData={editData}
        mode={formMode}
      />

      {/* Details Drawer */}
      <MedicineDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        medicine={selectedMedicine}
        onEdit={handleEditClick}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <MedicineScheduleDrawer
        open={calendarDrawerOpen}
        onOpenChange={setCalendarDrawerOpen}
        date={selectedCalendarDate}
        medicines={selectedCalendarMedicines}
      />

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-slate-900">
              {pendingAction?.type === 'archive'
                ? 'Archive medicine?'
                : 'Delete medicine?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'archive'
                ? `${pendingAction.medicine.name} will move out of your active medicine list.`
                : `${pendingAction?.medicine.name ?? 'This medicine'} will be permanently deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmedAction();
              }}
              className={
                pendingAction?.type === 'archive'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600'
                  : 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600'
              }
            >
              {actionLoading
                ? 'Working...'
                : pendingAction?.type === 'archive'
                  ? 'Archive'
                  : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
