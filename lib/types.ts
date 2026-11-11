export type Role =
  | "PARENT"
  | "ADULT_LEARNER"
  | "TUTOR"
  | "ADMIN"
  | "SUPER_ADMIN";
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role: Role;
  account_type: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  must_change_password: boolean;
  created_at: string;
};
export type TutorProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number | null;
  qualifications: string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  created_at: string;
  updated_at: string;
};
export type Subject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};
export type Location = {
  id: string;
  name: string;
  slug: string;
  location_type: string;
  parent_id: string | null;
  country_code: string;
  is_active: boolean;
};
export type Learner = {
  id: string;
  parent_profile_id: string | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};
export type TutoringRequest = {
  id: string;
  requester_user_id: string;
  learner_profile_id: string;
  subject_id: string;
  location_id: string | null;
  tutoring_mode: "ONLINE" | "IN_PERSON";
  description: string;
  preferred_schedule: string | null;
  status: string;
  assigned_tutor_id: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Booking = {
  id: string;
  tutoring_request_id: string;
  tutor_profile_id: string;
  requester_user_id: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  hourly_rate: number | null;
  gross_amount_minor: number | null;
  currency: string;
  status: string;
  meeting_link: string | null;
  location_id: string | null;
  lesson_notes: string | null;
  created_at: string;
  updated_at: string;
  tutor_completed_at: string | null;
  learner_acknowledged_at: string | null;
};
export type ApiError = { detail?: string | { msg?: string }[] };
