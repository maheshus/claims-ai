// frontend/src/types.ts

export interface Adjustment {
  category_label: string;
  category_code: string;
  financial_responsibility?: string;
  reason_code?: string;
  reason_type?: string;
  description?: string;
  action_needed?: string;
  amount: number;
  currency: string;
}

export interface Diagnosis {
  code: string;
  description: string;
  type: string;
}

export interface LineItem {
  service: string;
  adjudications: Adjustment[];
}

export interface ClaimSummary {
  claim_id: string;
  fhir_id: string;
  patient_name: string;

  claim_status: string; // e.g. "Clean", "Denied"
  processing_status: string; // e.g. "partial"
  payment_date: string;

  service_period: {
    start: string;
    end: string;
  };

  // Financials
  billed_amount: number;
  paid_amount: number;
  patient_responsibility: number;
  contractual_writeoff: number;

  // Clinical
  primary_diagnosis: string;
  drg_code?: string;
  diagnoses: Diagnosis[];

  // Adjudication (The Rules)
  adjustments: Adjustment[]; // Global/Header adjustments
  line_items: LineItem[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
