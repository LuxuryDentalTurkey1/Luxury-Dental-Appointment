export interface BookingRow {
  id: string;
  created_at: string;
  consultation_type: string;
  appointment_date: string;
  appointment_time_uk: string;
  duration_minutes: number;
  price_gbp: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  treatment: string;
  notes: string | null;
  status: string;
  payment_status: string;
  transaction_id: string | null;
  amount_paid: number | null;
  paid_at: string | null;
  staff_notes: string | null;
}

export interface MessageRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  body: string;
  status: string;
}
