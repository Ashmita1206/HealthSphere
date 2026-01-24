import { motion } from "framer-motion";
import { HelpCircle, CheckCircle, AlertCircle, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BloodOrganInfoPage() {
  const navigate = useNavigate();

  const donations = [
    {
      title: "Blood Donation",
      icon: "droplet",
      description: "Help save up to 3 lives with a single donation",
      eligibility: ["Age 17-65 (may vary)", "Weight at least 110 lbs", "No recent tattoos or piercings", "Good health"],
      process: ["Pre-donation screening", "Donation takes 8-15 minutes", "Rest and refreshments provided", "Eligible to donate again after 8 weeks"],
    },
    {
      title: "Organ Donation",
      icon: "heart",
      description: "One organ donor can save up to 8 lives",
      eligibility: ["Any age (with parental consent if minor)", "No upper age limit", "Medical conditions do not disqualify", "Family discusses with medical team"],
      process: ["Register your decision", "Inform family of your decision", "Carry donor card or update ID", "Medical evaluation at time of need"],
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
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donation Information</h1>
          <p className="text-muted-foreground">Learn about blood and organ donation eligibility, process, and FAQs</p>
        </div>

        {/* Donation Types */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {donations.map((donation) => (
            <Card key={donation.title} className="card-healthcare">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {donation.title}
                </CardTitle>
                <CardDescription>{donation.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Eligibility
                  </h4>
                  <ul className="space-y-1">
                    {donation.eligibility.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Process</h4>
                  <ol className="space-y-1">
                    {donation.process.map((item, index) => (
                      <li key={item} className="text-sm text-muted-foreground flex gap-2">
                        <span className="font-semibold text-primary">{index + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Donate */}
        <Card className="card-healthcare mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Why Donate?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-primary mb-2">3 Lives</p>
                <p className="text-sm text-muted-foreground">One blood donation can save up to 3 lives</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success mb-2">8 Lives</p>
                <p className="text-sm text-muted-foreground">One organ donor can save up to 8 lives</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-info mb-2">500+</p>
                <p className="text-sm text-muted-foreground">People waiting for transplants right now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="card-healthcare mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-info" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Button className="btn-healthcare" onClick={() => navigate("/blood-organ")}>
            Register as Donor
          </Button>
          <Button variant="outline" onClick={() => navigate("/blood-organ")}>
            Request Blood/Organ
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
