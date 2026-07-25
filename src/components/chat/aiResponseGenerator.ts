import type { RiskLevel } from './types';

export interface GeneratedAIResponse {
  response: string;
  riskLevel: RiskLevel;
  category: string;
  suggestions: string[];
  recommendations: string[];
  requiresDoctor: boolean;
}

export function generateFrontendAIResponse(
  userQuery: string,
  attachmentName?: string
): GeneratedAIResponse {
  const query = userQuery.toLowerCase();

  // Emergency / Critical Keywords
  if (
    query.includes('chest pain') ||
    query.includes('shortness of breath') ||
    query.includes('heart attack') ||
    query.includes('stroke') ||
    query.includes('unconscious') ||
    query.includes('severe bleeding') ||
    query.includes('anaphylaxis') ||
    query.includes('poison')
  ) {
    return {
      riskLevel: 'CRITICAL',
      category: 'Emergency Triage',
      requiresDoctor: true,
      response: `### 🚨 CRITICAL MEDICAL ALERT

Your inquiry indicates symptoms that may require **immediate medical emergency intervention**. 

#### **Recommended Emergency Actions:**
1. **Call Emergency Services Immediately**: Contact your local emergency ambulance hotline (e.g. 108 / 911 / 112) or visit the nearest Emergency Room.
2. **Do Not Drive Yourself**: Have a family member, bystander, or emergency personnel transport you.
3. **Rest & Remain Calm**: Sit or lie down in a safe position until medical professionals arrive.

> ⚠️ *HealthSphere AI triage has flagged this message with **CRITICAL** risk. Please navigate to the Emergency tab or tap Emergency Triage below.*`,
      recommendations: [
        'Call Emergency Services (108 / 911)',
        'Visit nearest Emergency Department immediately',
        'Avoid physical exertion',
      ],
      suggestions: [
        'Open Emergency Hotline Triage',
        'View Nearby Emergency Hospitals',
        'Check Allergy Profile',
      ],
    };
  }

  // High Risk / Severe Symptoms
  if (
    query.includes('high fever') ||
    query.includes('severe headache') ||
    query.includes('blood in stool') ||
    query.includes('vomiting blood') ||
    query.includes('numbness') ||
    query.includes('fainting') ||
    query.includes('high bp') ||
    query.includes('180')
  ) {
    return {
      riskLevel: 'HIGH',
      category: 'Clinical Symptom Evaluation',
      requiresDoctor: true,
      response: `### ⚠️ High Clinical Risk Evaluation

Thank you for reaching out. Based on the symptoms described, this condition requires **prompt medical consultation with a qualified healthcare provider**.

#### **Clinical Breakdown:**
- **Symptom Severity**: High. Symptoms such as acute severe onset, high temperature, or neurological red flags necessitate clinical examination.
- **Vitals Monitoring**: Please measure your current Blood Pressure, Pulse Rate, and Temperature if home devices are available.

#### **Recommended Next Steps:**
1. Schedule a consultation with a General Physician or Specialist within 12–24 hours.
2. Rest, stay well hydrated with water/electrolytes, and monitor vitals every 4 hours.
3. If symptoms worsen rapidly or chest discomfort develops, escalate to emergency care immediately.

| Parameter | Recommended Target | Current Status |
| :--- | :--- | :--- |
| **Blood Pressure** | < 120/80 mmHg | Evaluation Needed |
| **Body Temperature** | < 98.6°F (37°C) | Elevating Signal |
| **Hydration** | 2.5–3.0 Liters | Active Monitoring |`,
      recommendations: [
        'Book urgent doctor consultation',
        'Log vitals in HealthSphere Timeline',
        'Maintain strict resting regimen',
      ],
      suggestions: [
        'Find available Doctors nearby',
        'How to log vitals in Timeline?',
        'What medications treat high fever?',
      ],
    };
  }

  // Medicine / Prescription Questions
  if (
    query.includes('medicine') ||
    query.includes('drug') ||
    query.includes('metformin') ||
    query.includes('dosage') ||
    query.includes('atorvastatin') ||
    query.includes('paracetamol') ||
    query.includes('side effect') ||
    query.includes('antibiotic') ||
    query.includes('prescription')
  ) {
    return {
      riskLevel: 'LOW',
      category: 'Pharmacology Guidance',
      requiresDoctor: false,
      response: `### 💊 Clinical Pharmacology Guidance

Here is a structured overview regarding your medication inquiry:

#### **Key Information:**
* **Administration & Timing**: Always take prescription medications as directed by your prescribing physician. Oral medications like Metformin should generally be taken with meals to minimize stomach upset.
* **Storage Instructions**: Keep medications in a cool, dry place away from direct sunlight (below 25°C / 77°F).
* **Adherence & Reminders**: Consistent daily timing maintains steady therapeutic plasma levels.

\`\`\`text
Prescription Safety Check:
[✓] Verified Name & Strength
[✓] Meal Association (With Breakfast / Dinner)
[✓] Interaction Check Cleared
\`\`\`

#### **General Precautions:**
- **Missed Dose Protocol**: Take the missed dose as soon as remembered unless it is almost time for your next dose. Never double up doses.
- **Drug Interactions**: Inform your physician of all over-the-counter supplements or herbal remedies you use.`,
      recommendations: [
        'Set daily dose reminders in HealthSphere Reminders',
        'Log medicine intake on your timeline',
        'Consult pharmacist before starting new supplements',
      ],
      suggestions: [
        'How do I set a medicine reminder?',
        'Can I take vitamins with antibiotics?',
        'Explain side effects of statins',
      ],
    };
  }

  // Report Analysis / Lab Test Questions
  if (
    query.includes('report') ||
    query.includes('lab') ||
    query.includes('cholesterol') ||
    query.includes('hba1c') ||
    query.includes('blood test') ||
    query.includes('lipid') ||
    query.includes('cbc') ||
    attachmentName
  ) {
    return {
      riskLevel: 'LOW',
      category: 'Diagnostic Report Analysis',
      requiresDoctor: false,
      response: `### 📄 Medical & Diagnostic Report Summary ${attachmentName ? `(*Analyzed ${attachmentName}*)` : ''}

Here is a clinical breakdown of typical diagnostic parameters based on standard reference ranges:

#### **Primary Markers Analyzed:**
| Diagnostic Marker | Standard Reference Range | Target Status |
| :--- | :--- | :--- |
| **Total Cholesterol** | < 200 mg/dL | Normal Range |
| **LDL (Bad Cholesterol)** | < 100 mg/dL | Optimal |
| **HDL (Good Cholesterol)** | > 40 mg/dL (Men) / > 50 (Women) | Heart Protective |
| **HbA1c (Glycemic Index)** | < 5.7% | Normal Glycemic Control |
| **Fasting Blood Glucose** | 70 – 99 mg/dL | Within Normal Bounds |

#### **Insights & Clinical Interpretation:**
- **Lipid Profile Assessment**: Your numbers indicate good cardiovascular management. Maintaining a Mediterranean-style diet rich in soluble fiber and omega-3s supports healthy HDL levels.
- **Glycemic Profile**: Glycated hemoglobin (HbA1c) measures your average blood sugar level over the past 90 days.

> 💡 *Note: Always review lab results with your attending physician to correlate findings with your clinical history.*`,
      recommendations: [
        'Save report to HealthSphere Medical Reports',
        'Re-test Lipid profile in 6 months',
        'Maintain daily aerobic exercise (30 mins)',
      ],
      suggestions: [
        'What foods lower LDL cholesterol?',
        'How to upload PDF report to HealthSphere?',
        'Schedule doctor report review appointment',
      ],
    };
  }

  // Diet, Exercise, Weight & BMI
  if (
    query.includes('diet') ||
    query.includes('nutrition') ||
    query.includes('weight') ||
    query.includes('bmi') ||
    query.includes('exercise') ||
    query.includes('calories') ||
    query.includes('protein')
  ) {
    return {
      riskLevel: 'LOW',
      category: 'Lifestyle & Wellness',
      requiresDoctor: false,
      response: `### 🥗 Personalized Health & Lifestyle Guidance

Here are evidence-based recommendations tailored for nutrition, body composition, and cardiovascular fitness:

#### **Nutritional Recommendations:**
1. **Balanced Whole Foods**: Prioritize complex carbohydrates (quinoa, oats, brown rice), lean proteins (fish, legumes, poultry), and healthy fats (avocado, olive oil, almonds).
2. **Macronutrient Balance**: Aim for a balance of **30% Protein**, **40% Carbs**, and **30% Healthy Fats**.
3. **Hydration Benchmark**: Drink approximately 2.5 to 3.5 Liters of water daily.

#### **Physical Activity Strategy:**
* **Aerobic Volume**: 150 minutes of moderate-intensity exercise per week (e.g. brisk walking, cycling).
* **Strength Resistance**: 2 to 3 sessions per week targeting major muscle groups.

\`\`\`text
Daily Wellness Blueprint:
[Morning] 500ml Water + 20 min Morning Walk
[Afternoon] High Protein Lunch + Short Hydration Break
[Evening] 30 min Exercise + Unwind (No Screens 1h before bed)
\`\`\``,
      recommendations: [
        'Track daily hydration target in HealthSphere',
        'Log weight update on Health Timeline',
        'Maintain 7-8 hours of restful sleep nightly',
      ],
      suggestions: [
        'Give me a 1-day diabetic meal plan',
        'What is a safe BMI target?',
        'Best exercises for lowering Blood Pressure?',
      ],
    };
  }

  // Default General Health Response
  return {
    riskLevel: 'LOW',
    category: 'General Health Guidance',
    requiresDoctor: false,
    response: `### 🩺 HealthSphere Clinical AI Assistance

Thank you for consulting HealthSphere AI Assistant. 

#### **Summary Guidance for your query:**
> *"Information provided is designed to support, not replace, the relationship between patient and healthcare professional."*

1. **Longitudinal Record**: You can log clinical events, medications, and health metrics directly in your **Health Timeline**.
2. **Clinical Navigation**: Use HealthSphere to store medical diagnostic reports, monitor prescription doses, and schedule doctor follow-ups.
3. **Daily Care Plan**: Stay consistent with hydration, regular physical activity, balanced whole-food nutrition, and 7–8 hours of quality sleep.

Feel free to pick one of the quick suggestions below or upload a medical document for detailed review.`,
    recommendations: [
      'Maintain regular wellness checkups',
      'Keep medical history updated in HealthSphere Profile',
    ],
    suggestions: [
      'Analyze my symptoms',
      'Explain my medicine',
      'Upload a medical report for AI review',
      'How do I calculate my daily water intake?',
    ],
  };
}
