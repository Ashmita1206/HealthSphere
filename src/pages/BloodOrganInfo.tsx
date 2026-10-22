import { useState } from 'react';
import {
  Heart,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Building2,
  AlertTriangle,
  ArrowRight,
  FileText,
  UserCheck,
  Phone,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function BloodOrganInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [hasExpressedIntent, setHasExpressedIntent] = useState(false);
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([
    'Corneas',
    'Kidneys',
    'Heart',
    'Liver',
  ]);

  const toggleOrgan = (organ: string) => {
    setSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handleRecordIntent = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to record your personal donation intent.',
        variant: 'destructive',
      });
      return;
    }

    setHasExpressedIntent(true);
    toast({
      title: 'Intent Recorded for Personal Profile',
      description:
        'Your expression of interest has been updated in your HealthSphere emergency profile. Please remember to complete legal Form 7 registration at notto.mohfw.gov.in.',
    });
  };

  const organTypes = [
    { name: 'Corneas', impact: 'Restores sight to up to 2 individuals' },
    { name: 'Kidneys', impact: 'Treats end-stage renal disease (up to 2 lives)' },
    { name: 'Liver', impact: 'Can be divided for pediatric and adult recipients' },
    { name: 'Heart', impact: 'Saves patients with end-stage heart failure' },
    { name: 'Lungs', impact: 'Provides life-saving breathing support' },
    { name: 'Pancreas', impact: 'Restores insulin production for severe diabetes' },
    { name: 'Heart Valves & Tissue', impact: 'Reconstructive cardiac & burn healing' },
    { name: 'Skin & Bones', impact: 'Severe burn recovery and orthopedic grafting' },
  ];

  const authorizedCentres = [
    {
      name: 'All India Institute of Medical Sciences (AIIMS) - ROTTO North',
      city: 'New Delhi',
      state: 'Delhi',
      type: 'Central Government Apex Center',
      helpline: '1800-11-4770 (NOTTO Toll-Free)',
      isVerified: true,
    },
    {
      name: 'King Edward Memorial Hospital & ROTTO-SOTTO West',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Regional Organ & Tissue Transplant Organization',
      helpline: '+91 22 2410 7000',
      isVerified: true,
    },
    {
      name: 'Stanley Medical College & ROTTO South',
      city: 'Chennai',
      state: 'Tamil Nadu',
      type: 'State Organ & Tissue Transplant Organization (TRANSTAN)',
      helpline: '044-2528 1111',
      isVerified: true,
    },
  ];

  const faqItems = [
    {
      question: 'What is the legal framework governing organ donation in India?',
      answer:
        'Organ and tissue donation is governed by the Transplantation of Human Organs and Tissues Act (THOTA), 1994, and its subsequent amendments. Commercial trading, buying, or selling of organs is strictly prohibited by law and constitutes a severe criminal offence. All deceased organ allocations are coordinated exclusively through government bodies: NOTTO (National), ROTTO (Regional), and SOTTO (State).',
    },
    {
      question: 'Does expressing intent in HealthSphere count as an official legal pledge?',
      answer:
        'No. Recording your intent in HealthSphere stores your personal preferences within your emergency medical profile for family awareness. To register an official legal pledge, you must submit Form 7 on the official government NOTTO portal (notto.mohfw.gov.in) and obtain an official national donor card.',
    },
    {
      question: 'Who decides on organ donation after brain death?',
      answer:
        'Even if a person has signed a pledge card, Indian law requires the legal written consent of next-of-kin or legal guardians before retrieval can take place. Therefore, sharing your decision with your family is the single most important step.',
    },
    {
      question: 'What is brain stem death and how is it clinically certified?',
      answer:
        'Brain stem death is the permanent, irreversible cessation of all brain stem functions. By law, it must be certified twice (minimum 6 hours apart) by a certified panel of 4 independent doctors, including a neurologist/neurosurgeon and a hospital medical superintendent not involved in transplantation.',
    },
    {
      question: 'Can organ donors have an open casket funeral?',
      answer:
        'Yes. Organ retrieval is carried out with complete surgical dignity and precision in a sterile operating theatre. The donor body is respectfully closed and handed over to the family without any cosmetic disfigurement.',
    },
    {
      question: 'Can I change or revoke my organ donation decision later?',
      answer:
        'Yes, you can modify or revoke your decision at any time by updating your preferences in HealthSphere, logging into the NOTTO portal to update your registration, and notifying your family members.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Organ & Tissue Donation Guidance"
        description="Official education, ethical guidelines, authorized transplant network information, and voluntary pledge roadmap under NOTTO regulations."
        breadcrumbs={[
          { label: 'Blood & Organ', href: '/blood-donation' },
          { label: 'Organ Donation Guidance' },
        ]}
        badge="Regulated Healthcare Pathway"
        actions={
          <Button
            type="button"
            onClick={() => navigate('/blood-donation')}
            className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2"
          >
            <Droplets className="h-4 w-4" />
            <span>Blood Donation Registry</span>
          </Button>
        }
      />

      {/* Safety & Regulatory Banner */}
      <Card className="rounded-2xl border border-teal-300 bg-gradient-to-r from-teal-50/80 via-white to-slate-50 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Strict Regulatory & Safety Compliance
              </h3>
              <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white text-teal-800 border-teal-300">
                THOTA Compliant
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              HealthSphere provides educational guidance and personal intent tracking. In strict accordance with the Transplantation of Human Organs Act, <strong>HealthSphere does not operate an organ marketplace, waiting list, or reservation system</strong>. All organ matching is handled exclusively by authorized government transplant networks.
            </p>
          </div>
        </div>
      </Card>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 p-5 bg-white shadow-xs">
          <span className="text-3xl font-extrabold text-teal-800 font-heading block">8 Lives</span>
          <p className="text-xs text-slate-600 mt-1">
            Can be saved by a single deceased organ donor through heart, lung, liver, kidney, and pancreas transplantation.
          </p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 p-5 bg-white shadow-xs">
          <span className="text-3xl font-extrabold text-emerald-800 font-heading block">75+ People</span>
          <p className="text-xs text-slate-600 mt-1">
            Can experience life restoration through cornea, heart valve, bone, and skin tissue donations.
          </p>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 p-5 bg-white shadow-xs">
          <span className="text-3xl font-extrabold text-slate-800 font-heading block">100% Voluntary</span>
          <p className="text-xs text-slate-600 mt-1">
            Ethical altruism strictly protected by national law. Financial compensation for organ donation is illegal.
          </p>
        </Card>
      </div>

      {/* Main Grid: Educational Modules & Personal Intent Expression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Educational Process & Organs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Process Step-by-Step */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900 font-heading">
                    How Legal Organ Donation Works
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    4-step walkthrough from voluntary decision to clinical coordination
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Next-of-Kin Discussion</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Inform your family members of your decision. Under Indian law, clinical coordinators require family consent before any deceased donation takes place.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">NOTTO Portal Form 7</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Submit official Form 7 on the National Organ & Tissue Transplant Organisation registry (notto.mohfw.gov.in) using your Aadhaar or government ID.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Donor Pledge Card</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Download and carry your national donor pledge card in your wallet or keep a digital copy in your HealthSphere personal profile.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Clinical Allocation</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    In the event of hospital brain death, medical coordinators cross-match organs via ROTTO/SOTTO registry waiting lists transparently.
                  </p>
                </div>
              </div>

              {/* Official Government Gateway Link Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full h-10 text-xs font-bold rounded-xl border-teal-300 text-teal-800 hover:bg-teal-50 shadow-xs"
                >
                  <a
                    href="https://notto.mohfw.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Visit Official Ministry of Health NOTTO Portal (Form 7 Registration)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Organs & Tissues That Can Be Donated */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading">
                Transplantable Organs & Tissues
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Understanding which anatomical structures can restore life and health
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {organTypes.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Authorized Regional Transplant Centers Guidance */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900 font-heading">
                    Authorized Apex Transplant Centers (ROTTO Network)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Statutory government coordination bodies overseeing regional organ recovery
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="space-y-3">
                {authorizedCentres.map((centre) => (
                  <div
                    key={centre.name}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{centre.name}</h4>
                        <Badge variant="outline" className="text-[9px] font-bold bg-white text-teal-800">
                          {centre.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {centre.city}, {centre.state} • Official Helpline: {centre.helpline}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 text-xs font-bold rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shrink-0"
                    >
                      <a href="https://notto.mohfw.gov.in" target="_blank" rel="noopener noreferrer">
                        <span>Directory Info</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
                <span>
                  Centres listed above are verified national and regional apex institutions. Live computerized waiting list allocation is restricted to certified institutional coordinators via MoHFW encrypted networks.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Personal Intent Expression & FAQs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Intent Expression Card */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-700" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                    My Personal Pledge Intent
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Record your voluntary preferences for emergency awareness
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold">Important Notice: </span>
                This preference is stored for your personal health record and emergency contact sharing. It does <strong>not</strong> substitute for official legal Form 7 registration at NOTTO.
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Select Anatomical Structures to Pledge:
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {['Corneas', 'Kidneys', 'Heart', 'Liver', 'Lungs', 'Pancreas', 'Skin', 'Heart Valves'].map(
                    (organ) => {
                      const isSelected = selectedOrgans.includes(organ);
                      return (
                        <button
                          key={organ}
                          type="button"
                          onClick={() => toggleOrgan(organ)}
                          className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {organ}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleRecordIntent}
                className="w-full h-10 text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white shadow-xs flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {hasExpressedIntent ? 'Update Profile Intent' : 'Record Intent in Health Profile'}
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* FAQs Accordion */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-800" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                    Clinical & Legal FAQs
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Common questions regarding donor rights and safety
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-slate-100">
                    <AccordionTrigger className="text-xs font-bold text-slate-900 hover:text-teal-800 py-3 text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-600 font-normal leading-relaxed pb-3">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
