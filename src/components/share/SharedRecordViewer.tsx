import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Pill,
  FileText,
  History,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Heart,
  Droplet,
  CheckCircle2,
  Phone,
  FileBadge,
} from 'lucide-react';
import type { SharedPatientData } from '@/services/shareService';

interface SharedRecordViewerProps {
  data: SharedPatientData;
}

export const SharedRecordViewer: React.FC<SharedRecordViewerProps> = ({ data }) => {
  const { doctor, patient, permissions, expiresAt, createdAt, records } = data;

  const formattedExpiry = new Date(expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header Banner: Clinical Read-Only Session */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-teal-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/40 text-xs gap-1.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Clinical Access
              </Badge>
              <span className="text-xs text-slate-300 font-mono">
                ID: {data.shareToken}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight mt-2">
              Patient Medical Record: {patient?.name || 'Authorized Patient'}
            </h1>
            <p className="text-xs text-slate-300">
              Shared securely with{' '}
              <strong className="text-white font-semibold">{doctor?.fullName || 'Physician'}</strong>{' '}
              {doctor?.hospital && `• ${doctor.hospital}`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right space-y-0.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              Session Valid Until
            </span>
            <p className="text-xs font-mono font-bold text-white">{formattedExpiry}</p>
          </div>
        </div>

        {/* Permissions Badge Ribbon */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Granted Permissions:
          </span>
          {Object.entries(permissions)
            .filter(([_, val]) => Boolean(val))
            .map(([key]) => (
              <span
                key={key}
                className="text-[10px] font-semibold text-teal-200 bg-teal-500/20 border border-teal-400/30 px-2 py-0.5 rounded-md capitalize"
              >
                {key}
              </span>
            ))}
        </div>
      </div>

      {/* 2. Permitted Medical Sections */}
      <div className="space-y-6">
        {/* CARD: MEDICAL PROFILE & DEMOGRAPHICS */}
        {permissions.profile && records.profile && (
          <Card className="rounded-3xl border border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center gap-2 text-teal-800">
                <User className="w-5 h-5" />
                <CardTitle className="text-sm font-bold font-heading text-slate-900">
                  Patient Medical Identity & Demographics
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Health ID</span>
                <p className="font-mono font-bold text-slate-800">
                  {records.profile.healthId || 'HS-2026-PATIENT'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Blood Group</span>
                <p className="font-bold text-teal-800 text-sm">
                  {records.profile.bloodGroup || 'Unknown'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Date of Birth / Gender</span>
                <p className="font-semibold text-slate-700">
                  {records.profile.dateOfBirth || 'N/A'} • {records.profile.gender || 'Not specified'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Height / Weight</span>
                <p className="font-semibold text-slate-700">
                  {records.profile.height ? `${records.profile.height} cm` : 'N/A'} /{' '}
                  {records.profile.weight ? `${records.profile.weight} kg` : 'N/A'}
                </p>
              </div>

              {records.profile.chronicDiseases && records.profile.chronicDiseases.length > 0 && (
                <div className="col-span-2 space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Chronic Conditions</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {records.profile.chronicDiseases.map((c, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {records.profile.insurance?.provider && (
                <div className="col-span-2 space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Insurance Provider</span>
                  <p className="font-semibold text-slate-700">
                    {records.profile.insurance.provider} (Policy: {records.profile.insurance.policyNumber || 'N/A'})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARD: EMERGENCY INFORMATION */}
        {permissions.emergency && records.emergency && (
          <Card className="rounded-3xl border border-red-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-red-100 bg-red-50/50 p-5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle className="text-sm font-bold font-heading text-slate-900">
                  Emergency Medical Information & Allergies
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Known Allergies</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {records.emergency.allergies && records.emergency.allergies.length > 0 ? (
                      records.emergency.allergies.map((all, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 font-bold text-[11px] border border-red-200">
                          {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No allergies recorded</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Organ Donor Status</span>
                  <p className="font-bold text-slate-800">
                    {records.emergency.organDonor ? 'Registered Organ Donor' : 'Not Registered'}
                  </p>
                </div>
              </div>

              {records.emergency.emergencyContacts && records.emergency.emergencyContacts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Emergency Contacts</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {records.emergency.emergencyContacts.map((contact, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{contact.name} ({contact.relationship})</p>
                          <p className="text-[11px] text-slate-500 font-mono">{contact.phone}</p>
                        </div>
                        {contact.isPrimary && (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARD: ACTIVE MEDICATIONS */}
        {permissions.medicines && (
          <Card className="rounded-3xl border border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800">
                  <Pill className="w-5 h-5" />
                  <CardTitle className="text-sm font-bold font-heading text-slate-900">
                    Active Prescriptions & Medication Adherence
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {records.medicines?.length || 0} Medications
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {records.medicines && records.medicines.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {records.medicines.map((med, i) => (
                    <div key={med._id || i} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                            {med.dosage || 'Standard'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Frequency: {med.frequency || med.timing || 'Daily'} {med.instructions && `• ${med.instructions}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Adherence</span>
                        <p className="font-bold text-emerald-600">{med.adherenceRate ?? 95}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No medication records recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARD: MEDICAL REPORTS */}
        {permissions.reports && (
          <Card className="rounded-3xl border border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800">
                  <FileText className="w-5 h-5" />
                  <CardTitle className="text-sm font-bold font-heading text-slate-900">
                    Diagnostic Reports & Biomarkers
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {records.reports?.length || 0} Reports
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {records.reports && records.reports.length > 0 ? (
                <div className="space-y-3">
                  {records.reports.map((report, i) => (
                    <div key={report._id || i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                        <Badge
                          className={`text-[10px] capitalize ${
                            report.riskLevel === 'high' || report.riskLevel === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : report.riskLevel === 'moderate'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          Risk: {report.riskLevel || 'Normal'}
                        </Badge>
                      </div>
                      {report.summary && <p className="text-slate-600 text-xs leading-relaxed">{report.summary}</p>}
                      {report.abnormalValues && report.abnormalValues.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-rose-700 uppercase">Abnormal Biomarkers: </span>
                          <span className="text-slate-700 font-medium">{report.abnormalValues.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No lab reports found.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARD: HEALTH TIMELINE */}
        {permissions.timeline && (
          <Card className="rounded-3xl border border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center gap-2 text-teal-800">
                <History className="w-5 h-5" />
                <CardTitle className="text-sm font-bold font-heading text-slate-900">
                  Health Journey & Timeline
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {records.timeline && records.timeline.length > 0 ? (
                <div className="space-y-4">
                  {records.timeline.map((event, i) => (
                    <div key={event._id || i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-teal-700 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{event.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No timeline events recorded.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* CARD: SMART ANALYTICS & HEALTH SCORE */}
        {permissions.analytics && records.analytics && (
          <Card className="rounded-3xl border border-slate-200/90 shadow-xs bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center gap-2 text-teal-800">
                <Activity className="w-5 h-5" />
                <CardTitle className="text-sm font-bold font-heading text-slate-900">
                  Clinical Telemetry & AI Health Index
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800">Overall Score</span>
                  <p className="text-2xl font-black text-teal-900">{records.analytics.score}/100</p>
                  <p className="text-xs font-semibold text-teal-700">{records.analytics.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vitals</span>
                    <p className="font-bold text-slate-800">{records.analytics.breakdown?.vitals || 85}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Adherence</span>
                    <p className="font-bold text-slate-800">{records.analytics.breakdown?.adherence || 90}%</p>
                  </div>
                </div>
              </div>

              {records.analytics.insights && records.analytics.insights.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Observations:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {records.analytics.insights.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
