import { motion } from "framer-motion";
import { HelpCircle, CheckCircle, AlertCircle, Heart, Droplets, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";

export default function BloodOrganInfoPage() {
  const navigate = useNavigate();

  const donations = [
    {
      title: "Blood Donation Guidelines",
      icon: Droplets,
      description: "Help save up to 3 lives with a single voluntary blood donation",
      eligibility: ["Age 17-65 (may vary by state)", "Weight at least 110 lbs (50 kg)", "No recent tattoos or piercings in last 6 months", "Good overall physical health condition"],
      process: ["Pre-donation medical screening & hemoglobin check", "Donation session takes only 8-15 minutes", "Rest, hydration, and refreshments provided", "Eligible to donate again after 8 weeks"],
    },
    {
      title: "Organ Donation Pledge",
      icon: Heart,
      description: "One organ donor can save up to 8 lives and improve 75 others",
      eligibility: ["Any age group eligible (with guardian consent if minor)", "No upper age limit for registration", "Most medical conditions do not disqualify automatically", "Family consultation with clinical team at time of need"],
      process: ["Register your digital organ pledge preference", "Inform next-of-kin family members of your decision", "Carry digital donor card on mobile profile", "Clinical evaluation performed at time of emergency"],
    },
  ];

  const faqItems = [
    {
      question: "Does donating blood hurt?",
      answer: "Most donors report only a slight pinch at the start. The actual donation is painless."
    },
    {
      question: "How long does blood donation take?",
      answer: "The actual donation process takes 8-15 minutes, but plan for 1-1.5 hours total including screening and recovery."
    },
    {
      question: "Can I get ill from donating blood?",
      answer: "No, the donation process is safe and sterile. Your body quickly replenishes the blood you donate."
    },
    {
      question: "Can I be an organ donor and have a funeral?",
      answer: "Yes, organ donation does not prevent an open casket funeral. Organs are removed respectfully."
    },
    {
      question: "Will my religious beliefs be considered?",
      answer: "Yes, organ donation is accepted by major religions. You can specify preferences in your decision."
    },
    {
      question: "Can I change my mind about organ donation?",
      answer: "Yes, you can change your decision at any time. Inform your family and update your registration."
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Donation Awareness & Guidelines"
        description="Learn about blood and organ donation eligibility criteria, process walkthroughs, and FAQs."
        breadcrumbs={[
          { label: "Blood & Organ", href: "/blood-organ" },
          { label: "Info & FAQs" }
        ]}
        badge="Clinical Guide"
        actions={
          <Button
            onClick={() => navigate("/blood-organ")}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <span>Go to Registry</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      {/* Impact Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl font-extrabold text-teal-700 font-heading">3 Lives</span>
            <p className="text-xs text-slate-500 font-normal mt-1">Saved by a single unit of whole blood donation.</p>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl font-extrabold text-emerald-700 font-heading">8 Lives</span>
            <p className="text-xs text-slate-500 font-normal mt-1">Saved through one organ donor pledge registration.</p>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl font-extrabold text-rose-600 font-heading">500+</span>
            <p className="text-xs text-slate-500 font-normal mt-1">Patients actively awaiting organ matching in regional networks.</p>
          </div>
        </Card>
      </div>

      {/* Donation Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donations.map((donation) => {
          const IconComp = donation.icon;
          return (
            <Card key={donation.title} className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
                    <IconComp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold text-slate-900 font-heading">{donation.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-normal">{donation.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Eligibility Requirements
                  </h4>
                  <ul className="space-y-1.5">
                    {donation.eligibility.map((item) => (
                      <li key={item} className="text-xs text-slate-600 font-normal flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Process Step-by-Step</h4>
                  <ol className="space-y-2">
                    {donation.process.map((item, index) => (
                      <li key={item} className="text-xs text-slate-600 font-normal flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-teal-100">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQs Card */}
      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
              <HelpCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Common questions regarding donor safety and rights</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-100">
                <AccordionTrigger className="text-xs font-bold text-slate-900 hover:text-teal-700 py-3.5">
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
  );
}

