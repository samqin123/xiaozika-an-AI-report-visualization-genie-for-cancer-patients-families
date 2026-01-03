export type IndicatorType = 'Tumor' | 'Blood' | 'Liver' | 'Infection' | 'Coagulation' | 'Renal' | 'Metabolism' | 'Bio';

export interface IndicatorDefinition {
  code: string;
  name: string;
  category: IndicatorType;
  unit: string;
  ref_range: string;
  meaning?: string;
}

export interface IndicatorData {
  [key: string]: number;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  indicators: IndicatorData;
  treatmentPhase?: string;
  hospital?: string;
}

export interface TreatmentPhase {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  color: string;
}

export interface HealthArchive {
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  medicalHistory: string;
  doctors: Doctor[];
  emergency: EmergencyContact;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  contact: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'line' | 'area';
  metrics: string[];
  isPinned: boolean;
}

export interface MonitoringScenario {
  id: string;
  label: string;
  metrics: string[];
  description: string;
  icon: string;
  color?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  senior_mode: boolean;
  diagnosis?: string;
  medical_history?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}