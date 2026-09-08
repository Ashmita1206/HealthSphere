import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorCard } from './DoctorCard';
import { DoctorProfile } from './DoctorProfile';
import { Search, Stethoscope, Filter, UserX } from 'lucide-react';
import type { Doctor } from '@/services/doctorService';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  loading?: boolean;
  onShareDoctor: (doctor: Doctor) => void;
}

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Internal Medicine',
  'Neurology',
  'Pediatrics',
  'Endocrinology',
];

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  loading = false,
  onShareDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [inspectingDoctor, setInspectingDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSpec =
        selectedSpec === 'All' ||
        doc.specialization.toLowerCase() === selectedSpec.toLowerCase();

      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        doc.fullName.toLowerCase().includes(term) ||
        doc.specialization.toLowerCase().includes(term) ||
        doc.hospital?.toLowerCase().includes(term) ||
        doc.qualification?.toLowerCase().includes(term);

      return matchesSpec && matchesSearch;
    });
  }, [doctors, selectedSpec, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctors by name, hospital, or specialty..."
              className="pl-9 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-teal-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Specialization Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" />
            Specialty:
          </span>
          {SPECIALIZATIONS.map((spec) => {
            const isActive = selectedSpec === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor._id || doctor.doctorId}
              doctor={doctor}
              onShare={onShareDoctor}
              onViewProfile={setInspectingDoctor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We could not find any physicians matching &quot;{searchTerm}&quot;. Try adjusting your search term or clearing the specialization filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedSpec('All');
            }}
            className="rounded-xl text-xs font-bold"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Inspecting Doctor Profile Modal */}
      <DoctorProfile
        doctor={inspectingDoctor}
        open={!!inspectingDoctor}
        onOpenChange={(open) => !open && setInspectingDoctor(null)}
        onShare={onShareDoctor}
      />
    </div>
  );
};
