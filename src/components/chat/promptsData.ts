import type { PromptCategory } from './types';

export const QUICK_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'medicines',
    label: 'Medicine Explanation',
    iconName: 'Pill',
    prompts: [
      {
        id: 'med-1',
        title: 'Explain Metformin & Dosage',
        prompt: 'Explain what Metformin is used for, standard dosage guidance, and common side effects.',
        description: 'Understand diabetes medication, timing with food, and precautions.',
        category: 'Medicine Explanation',
        badge: 'Popular',
      },
      {
        id: 'med-2',
        title: 'Atorvastatin & Statin Guidelines',
        prompt: 'How does Atorvastatin lower LDL cholesterol, and what food/medication interactions should I watch out for?',
        description: 'Cholesterol medication overview, muscle symptoms, and night dosing.',
        category: 'Medicine Explanation',
      },
      {
        id: 'med-3',
        title: 'Antibiotics & Probiotics Timing',
        prompt: 'What is the recommended delay between taking antibiotics (e.g. Amoxicillin) and taking probiotics?',
        description: 'Preserve gut health while completing antibiotic courses.',
        category: 'Medicine Explanation',
      },
    ],
  },
  {
    id: 'symptoms',
    label: 'Symptom Checker',
    iconName: 'Stethoscope',
    prompts: [
      {
        id: 'sym-1',
        title: 'Chest Tightness vs Muscle Strain',
        prompt: 'How can I differentiate between musculoskeletal chest wall pain and cardiac angina symptoms?',
        description: 'Triage guidance for sharp chest pain, breathing, and red flags.',
        category: 'Symptom Checker',
        badge: 'Triage',
      },
      {
        id: 'sym-2',
        title: 'Persistent Headache Triage',
        prompt: 'I have had a dull headache behind my eyes for 2 days. What symptoms indicate a tension headache vs migraine or high BP?',
        description: 'Analyze onset, vision changes, neck stiffness, and BP triggers.',
        category: 'Symptom Checker',
      },
      {
        id: 'sym-3',
        title: 'Mild Fever & Fatigue Evaluation',
        prompt: 'What are the most common causes of low-grade fever (99.5°F - 100.4°F) accompanied by fatigue?',
        description: 'Viral prodrome, hydration, resting guidelines, and temperature thresholds.',
        category: 'Symptom Checker',
      },
    ],
  },
  {
    id: 'diet',
    label: 'Diet & Nutrition',
    iconName: 'Apple',
    prompts: [
      {
        id: 'diet-1',
        title: 'DASH Diet for Hypertension',
        prompt: 'Explain the DASH diet principles for lowering systolic blood pressure and provide a sample 1-day meal plan.',
        description: 'Sodium reduction, potassium-rich foods, and heart-healthy meal structure.',
        category: 'Diet Advice',
        badge: 'Heart',
      },
      {
        id: 'diet-2',
        title: 'Low Glycemic Index Meal Ideas',
        prompt: 'What are high-protein, low glycemic index foods suitable for managing Type 2 Diabetes?',
        description: 'Blood sugar control, fiber pairings, and glycemic load tips.',
        category: 'Diet Advice',
      },
      {
        id: 'diet-3',
        title: 'Anti-Inflammatory Nutrition Plan',
        prompt: 'Which key foods and spices help reduce chronic systemic inflammation?',
        description: 'Omega-3 fatty acids, turmeric, berries, leafy greens, and processed food avoidance.',
        category: 'Diet Advice',
      },
    ],
  },
  {
    id: 'exercise',
    label: 'Exercise & Fitness',
    iconName: 'Activity',
    prompts: [
      {
        id: 'ex-1',
        title: 'Safe Workout with Mild Hypertension',
        prompt: 'What aerobic and strength training guidelines are safe for an individual with Stage 1 hypertension?',
        description: 'Target heart rate zones, breathing mechanics, and heavy lift warnings.',
        category: 'Exercise Advice',
      },
      {
        id: 'ex-2',
        title: 'Post-Injury Knee Rehabilitation',
        prompt: 'What low-impact exercises strengthen quadriceps and hamstrings without placing excessive pressure on knees?',
        description: 'Straight leg raises, swimming, stationary bike, and quad sets.',
        category: 'Exercise Advice',
      },
    ],
  },
  {
    id: 'mental',
    label: 'Mental Wellness',
    iconName: 'Brain',
    prompts: [
      {
        id: 'men-1',
        title: 'Managing Acute Anxiety & Panic',
        prompt: 'Explain grounding techniques (like 5-4-3-2-1) and box breathing for acute stress relief.',
        description: 'Immediate calming strategies, vagus nerve stimulation, and mindful focus.',
        category: 'Mental Wellness',
        badge: 'Calm',
      },
      {
        id: 'men-2',
        title: 'Overcoming Work Burnout & Sleep Anxiety',
        prompt: 'What evidence-based cognitive strategies help quiet a racing mind before sleep?',
        description: 'Worry logs, cognitive shuffle, and sleep hygiene practices.',
        category: 'Mental Wellness',
      },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep Advice',
    iconName: 'Moon',
    prompts: [
      {
        id: 'sl-1',
        title: 'Optimizing Sleep Architecture & Hygiene',
        prompt: 'What scientifically proven protocol improves deep slow-wave sleep and reduces middle-of-the-night awakenings?',
        description: 'Temperature, circadian light exposure, caffeine cutoff, and bedtime routines.',
        category: 'Sleep Advice',
      },
    ],
  },
  {
    id: 'hydration',
    label: 'Hydration Guidance',
    iconName: 'Droplets',
    prompts: [
      {
        id: 'hy-1',
        title: 'Daily Fluid Targets & Electrolytes',
        prompt: 'How do I calculate my daily hydration requirements based on body weight, climate, and exercise volume?',
        description: 'Water intake formulas, electrolyte replenishment, and hydration signs.',
        category: 'Hydration',
      },
    ],
  },
  {
    id: 'bmi',
    label: 'BMI & Weight Management',
    iconName: 'Scale',
    prompts: [
      {
        id: 'bmi-1',
        title: 'Healthy Fat Loss vs Muscle Retention',
        prompt: 'How can I calculate a sustainable caloric deficit while maintaining lean muscle mass?',
        description: 'Macronutrient ratios, protein distribution, and realistic weight loss velocity.',
        category: 'BMI',
      },
    ],
  },
  {
    id: 'disease',
    label: 'Disease Explanation',
    iconName: 'ShieldAlert',
    prompts: [
      {
        id: 'dis-1',
        title: 'Understanding Fatty Liver Disease',
        prompt: 'Explain Non-Alcoholic Fatty Liver Disease (NAFLD), its reversibility, and necessary lifestyle interventions.',
        description: 'Liver enzymes, triglyceride reduction, weight loss, and dietary changes.',
        category: 'Disease Explanation',
      },
      {
        id: 'dis-2',
        title: 'Thyroid Dysfunction (Hypothyroidism)',
        prompt: 'What is TSH, free T4, and how does levothyroxine hormone replacement therapy work?',
        description: 'Metabolism, levothyroxine timing (empty stomach), and lab tracking.',
        category: 'Disease Explanation',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Medical Report Explanation',
    iconName: 'FileText',
    prompts: [
      {
        id: 'rep-1',
        title: 'Explain Lipid Profile Markers',
        prompt: 'What do Total Cholesterol, HDL, LDL, Triglycerides, and Non-HDL ratio mean in a laboratory blood panel?',
        description: 'Reference ranges, cardiovascular risk stratification, and diet impact.',
        category: 'Medical Report Explanation',
        badge: 'Lab',
      },
      {
        id: 'rep-2',
        title: 'Complete Blood Count (CBC) Decoded',
        prompt: 'Explain RBC, Hemoglobin, Hematocrit, WBC differential, and Platelets in a CBC test result.',
        description: 'Anemia markers, infection signals, and platelet counts.',
        category: 'Medical Report Explanation',
      },
    ],
  },
  {
    id: 'prescriptions',
    label: 'Prescription Explanation',
    iconName: 'Receipt',
    prompts: [
      {
        id: 'rx-1',
        title: 'Understanding Medical Abbreviations (BID, TID, PRN)',
        prompt: 'What do prescription medical shorthand codes like QD, BID, TID, AC, PC, and PRN mean?',
        description: 'Translating doctor handwriting and pharmacy dosing instructions.',
        category: 'Prescription Explanation',
      },
    ],
  },
  {
    id: 'lab',
    label: 'Lab Report Explanation',
    iconName: 'TestTube',
    prompts: [
      {
        id: 'lab-1',
        title: 'Understanding HbA1c & Fasting Glucose',
        prompt: 'What is the diagnostic difference between fasting plasma glucose, postprandial glucose, and HbA1c percentage?',
        description: 'Glycemic control parameters, prediabetes cutoffs, and 3-month average glucose.',
        category: 'Lab Report Explanation',
      },
      {
        id: 'lab-2',
        title: 'Kidney Function Panel (Creatinine & eGFR)',
        prompt: 'What do serum Creatinine, Blood Urea Nitrogen (BUN), and eGFR indicate regarding renal function?',
        description: 'Kidney filtration efficiency, hydration impact, and referral markers.',
        category: 'Lab Report Explanation',
      },
    ],
  },
  {
    id: 'vaccinations',
    label: 'Vaccination Advice',
    iconName: 'Syringe',
    prompts: [
      {
        id: 'vac-1',
        title: 'Adult Immunization Schedule Overview',
        prompt: 'What booster shots are recommended for adults (e.g. Tdap, Flu, Pneumococcal, Shingles)?',
        description: 'Vaccine schedules, age-based recommendations, and immunity duration.',
        category: 'Vaccination Advice',
      },
    ],
  },
  {
    id: 'womens_health',
    label: "Women's Health",
    iconName: 'HeartHandshake',
    prompts: [
      {
        id: 'wh-1',
        title: 'PCOS Symptoms & Metabolic Management',
        prompt: 'What lifestyle and nutritional strategies help manage Polycystic Ovary Syndrome (PCOS) symptoms?',
        description: 'Insulin sensitivity, hormonal balance, exercise, and menstrual regularity.',
        category: "Women's Health",
      },
    ],
  },
  {
    id: 'mens_health',
    label: "Men's Health",
    iconName: 'UserCheck',
    prompts: [
      {
        id: 'mh-1',
        title: 'Prostate Health & PSA Screening Guidelines',
        prompt: 'What is a PSA test, what factors cause PSA elevation, and when should prostate screenings begin?',
        description: 'Prostate wellness, BPH signs, and age-based screening recommendations.',
        category: "Men's Health",
      },
    ],
  },
  {
    id: 'senior_care',
    label: 'Senior Care',
    iconName: 'Users',
    prompts: [
      {
        id: 'sc-1',
        title: 'Fall Prevention & Bone Density in Seniors',
        prompt: 'What daily exercise and environmental changes protect senior adults against falls and bone fractures?',
        description: 'Balance training, DEXA bone scan, Calcium/Vitamin D3, and home safety checklist.',
        category: 'Senior Care',
      },
    ],
  },
  {
    id: 'child_care',
    label: 'Child Care & Pediatrics',
    iconName: 'Baby',
    prompts: [
      {
        id: 'cc-1',
        title: 'Pediatric Fever Management Guidelines',
        prompt: 'How should parents safely manage a fever in children, and what signs require urgent pediatrician evaluation?',
        description: 'Hydration, dosing precautions, febrile seizures awareness, and red flags.',
        category: 'Child Care',
      },
    ],
  },
  {
    id: 'general',
    label: 'General Health',
    iconName: 'Sparkles',
    prompts: [
      {
        id: 'gen-1',
        title: 'Comprehensive Annual Checkup Checklist',
        prompt: 'What routine diagnostic blood tests, physical exams, and preventative screenings should I request at my annual physical?',
        description: 'Screening roadmap by age, lipid panels, vitals, and wellness tracking.',
        category: 'General Health',
        badge: 'Essential',
      },
    ],
  },
];
