"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, uploadWithProgress } from "@/lib/api";
import type { Subject, Location } from "@/lib/types";
import { toast } from "sonner";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LocationType = "STATE" | "LGA" | "CITY" | "NEIGHBORHOOD";

type CatalogLocation = Location & {
  location_type: LocationType;
  parent_id: string | null;
  country_code?: string;
  is_active?: boolean;
};

type LocationListResponse =
  | CatalogLocation[]
  | {
      items?: CatalogLocation[];
      data?: CatalogLocation[];
      results?: CatalogLocation[];
    };

type TutorProfile = {
  id?: string;
  bio: string | null;
  qualifications: string | null;
  monthly_fee: number | string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  profile_picture_url?: string | null;
  introduction_video_url?: string | null;
  subject_ids?: string[];
  location_ids?: string[];
};

type CurrentUserResponse = {
  id: string;
  phone_number: string | null;
  is_phone_verified: boolean;
};

type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

type VerificationResponse = {
  id: string;
  status: VerificationStatus;
  nda_version?: string | null;
  nda_accepted_at?: string | null;
  nda_content?: string | null;
  nda_accepted_ip?: string | null;
  nda_accepted_user_agent?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
};

type RefereeStatus = "PENDING" | "CONSENTED" | "DECLINED" | "EXPIRED";
type TutorReferee = {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  relationship_to_tutor: string;
  status: RefereeStatus;
  invitation_sent_at: string | null;
  consented_at: string | null;
};
type RefereeDraft = {
  full_name: string;
  email: string;
  job_title: string;
  relationship_to_tutor: string;
};
const EMPTY_REFEREE: RefereeDraft = {
  full_name: "",
  email: "",
  job_title: "",
  relationship_to_tutor: "",
};

type UploadResponse = {
  message?: string;
  profile_picture_url?: string | null;
  introduction_video_url?: string | null;
};
type VideoUploadSignatureResponse = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  public_id: string;
  overwrite: boolean;
};

type CloudinaryVideoUploadResponse = {
  public_id?: string;
  secure_url?: string;
  duration?: number;
  bytes?: number;
  format?: string;
  error?: {
    message?: string;
  };
};
type IdentityDocumentType =
  | "NATIONAL_ID"
  | "PASSPORT"
  | "DRIVERS_LICENSE"
  | "OTHER_APPROVED_ID";

type UploadAction =
  | "picture"
  | "video"
  | "identity"
  | "picture-delete"
  | "video-delete";

type InstitutionOption = { id: string; name: string; country_code: string };
type EducationDraft = {
  institution_id: string;
  institution_name: string;
  country_code: string;
  course_of_study: string;
  specialty: string;
  qualification_type: string;
  grade: string;
  start_date: string;
  end_date: string;
  currently_enrolled: boolean;
  document_public_id: string;
  document_name: string;
  document_format: string;
};
type CertificationDraft = {
  name: string;
  issuing_organization: string;
  date_obtained: string;
  expiry_date: string;
  document_public_id: string;
  document_name: string;
  document_format: string;
};
type WorkDraft = {
  organization: string;
  job_title: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
};
type BackgroundApiResponse = {
  education: Array<
    Partial<EducationDraft> & {
      institution_id?: string | null;
      institution_name?: string | null;
      country_code?: string | null;
      course_of_study?: string | null;
      qualification_type?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      document_public_id?: string | null;
      document_name?: string | null;
      document_format?: string | null;
    }
  >;
  certifications: Array<
    Partial<CertificationDraft> & {
      name?: string | null;
      issuing_organization?: string | null;
      date_obtained?: string | null;
      expiry_date?: string | null;
      document_public_id?: string | null;
      document_name?: string | null;
      document_format?: string | null;
    }
  >;
  work_history: Array<
    Partial<WorkDraft> & {
      organization?: string | null;
      job_title?: string | null;
      employment_type?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      description?: string | null;
    }
  >;
};

const EMPTY_EDUCATION: EducationDraft = {
  institution_id: "",
  institution_name: "",
  country_code: "NG",
  course_of_study: "",
  specialty: "",
  qualification_type: "Bachelor's Degree",
  grade: "",
  start_date: "",
  end_date: "",
  currently_enrolled: false,
  document_public_id: "",
  document_name: "",
  document_format: "",
};
const EMPTY_CERTIFICATION: CertificationDraft = {
  name: "",
  issuing_organization: "",
  date_obtained: "",
  expiry_date: "",
  document_public_id: "",
  document_name: "",
  document_format: "",
};
const EMPTY_WORK: WorkDraft = {
  organization: "",
  job_title: "",
  employment_type: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
};
const QUALIFICATION_TYPES = [
  "Secondary School",
  "Diploma",
  "NCE",
  "OND",
  "HND",
  "Bachelor's Degree",
  "Postgraduate Diploma",
  "Master's Degree",
  "Doctorate",
  "Professional Qualification",
  "Other",
];
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia, Plurinational State of" },
  { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BV", name: "Bouvet Island" },
  { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "BN", name: "Brunei Darussalam" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, The Democratic Republic of the" },
  { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CW", name: "Curaçao" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FK", name: "Falkland Islands (Malvinas)" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GF", name: "French Guiana" },
  { code: "PF", name: "French Polynesia" },
  { code: "TF", name: "French Southern Territories" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HM", name: "Heard Island and McDonald Islands" },
  { code: "VA", name: "Holy See (Vatican City State)" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran, Islamic Republic of" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, Democratic People's Republic of" },
  { code: "KR", name: "Korea, Republic of" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Lao People's Democratic Republic" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia, Federated States of" },
  { code: "MD", name: "Moldova, Republic of" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NC", name: "New Caledonia" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "MK", name: "North Macedonia" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine, State of" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" },
  { code: "RW", name: "Rwanda" },
  { code: "RE", name: "Réunion" },
  { code: "BL", name: "Saint Barthélemy" },
  { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin (French part)" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten (Dutch part)" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syrian Arab Republic" },
  { code: "TW", name: "Taiwan, Province of China" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania, United Republic of" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "TR", name: "Türkiye" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela, Bolivarian Republic of" },
  { code: "VN", name: "Viet Nam" },
  { code: "VG", name: "Virgin Islands, British" },
  { code: "VI", name: "Virgin Islands, U.S." },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
  { code: "AX", name: "Åland Islands" },
];

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const AGE_GROUPS = [
  { value: "PRIMARY", label: "Primary learners" },
  { value: "SECONDARY", label: "Secondary learners" },
  { value: "ADULT", label: "Adult learners" },
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "IN_PERSON", label: "In person" },
  { value: "HYBRID", label: "Hybrid" },
];

const IDENTITY_DOCUMENT_TYPES: {
  value: IdentityDocumentType;
  label: string;
}[] = [
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "PASSPORT", label: "International passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence" },
  { value: "OTHER_APPROVED_ID", label: "Other approved ID" },
];

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  NOT_SUBMITTED: "Not submitted",
  PENDING_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const INITIAL_SUBJECT_LIMIT = 12;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function unwrapLocations(response: LocationListResponse): CatalogLocation[] {
  if (Array.isArray(response)) return response;

  return response.items ?? response.data ?? response.results ?? [];
}

function formatStatus(status: VerificationStatus) {
  return VERIFICATION_LABELS[status] ?? status.replaceAll("_", " ");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

function SelectionButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-[#00A99A] bg-[#E8F8F5] text-[#087E75]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StepIndicator({
  currentStep,
  onStepChange,
  profileExists,
  stage2Completed,
}: {
  currentStep: 1 | 2 | 3;
  onStepChange: (step: 1 | 2 | 3) => void;
  profileExists: boolean;
  stage2Completed: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onStepChange(1)}
          className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769D2] focus-visible:ring-offset-2 ${
            currentStep === 1
              ? "border-[#1769D2] bg-blue-50"
              : "border-transparent bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              profileExists
                ? "bg-emerald-100 text-emerald-700"
                : currentStep === 1
                  ? "bg-[#1769D2] text-white"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            {profileExists ? <Check size={17} /> : "1"}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102A56]">
              Profile creation
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Your professional details
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={!profileExists}
          onClick={() => onStepChange(2)}
          className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769D2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            currentStep === 2
              ? "border-[#1769D2] bg-blue-50"
              : "border-transparent bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              stage2Completed
                ? "bg-emerald-100 text-emerald-700"
                : currentStep === 2
                  ? "bg-[#1769D2] text-white"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            {stage2Completed ? <Check size={17} /> : "2"}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102A56]">
              Verification
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Picture, video and identity
            </span>
          </span>
        </button>
        <button
          type="button"
          disabled={!stage2Completed}
          onClick={() => onStepChange(3)}
          className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769D2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            currentStep === 3
              ? "border-[#1769D2] bg-blue-50"
              : "border-transparent bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${currentStep === 3 ? "bg-[#1769D2] text-white" : "bg-slate-200 text-slate-600"}`}
          >
            3
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102A56]">
              Referees
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              At least two referee checks
            </span>
          </span>
        </button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-[#00A99A] transition-all ${
            currentStep === 1 ? "w-1/3" : currentStep === 2 ? "w-2/3" : "w-full"
          }`}
        />
      </div>
    </div>
  );
}

function FileUploadCard({
  title,
  description,
  icon,
  accept,
  fileName,
  busy,
  progress,
  disabled = false,
  actionLabel,
  onChange,
  onRemove,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  accept: string;
  fileName?: string | null;
  busy: boolean;
  progress?: number | null;
  disabled?: boolean;
  actionLabel: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}) {
  const inputId = `upload-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const unavailable = busy || disabled;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#102A56]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">{fileName}</span>
        </div>
      )}

      {disabled && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          Create your tutor profile in Step 1 before uploading this file.
        </p>
      )}

      {busy && progress !== undefined && progress !== null && (
        <div className="mt-4 space-y-2" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Uploading video</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Video upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-[#00A99A] transition-[width] duration-200"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Keep this page open until the upload finishes.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            unavailable
              ? "pointer-events-none cursor-not-allowed bg-slate-200 text-slate-500"
              : "cursor-pointer bg-[#102A56] text-white hover:bg-[#173B72]"
          }`}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {busy ? "Uploading…" : actionLabel}
        </label>

        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={unavailable}
          onChange={onChange}
        />

        {onRemove && fileName && (
          <button
            type="button"
            onClick={onRemove}
            disabled={unavailable}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={15} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function LocationSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogLocation[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || loading}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{loading ? "Loading…" : placeholder}</option>

          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {loading ? (
          <Loader2
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        ) : (
          <ChevronRight
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
          />
        )}
      </div>
    </Field>
  );
}

function BackgroundUploadProgress({
  uploading,
  progress,
  fileName,
  error,
}: {
  uploading: boolean;
  progress: number | undefined;
  fileName: string;
  error?: string;
}) {
  if (error) {
    return (
      <p className="mt-2 text-xs text-rose-700" role="alert">
        {error} Select the file again to retry.
      </p>
    );
  }
  if (uploading) {
    return (
      <div className="mt-2 space-y-1.5" role="status" aria-live="polite">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Loader2 size={13} className="animate-spin" /> Uploading {fileName}…
          </span>
          <span>{progress ?? 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#00AFA0] transition-[width] duration-200"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          Please keep this page open until the upload finishes.
        </p>
      </div>
    );
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function TutorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stage2Completed, setStage2Completed] = useState(false);

  /* Profile fields */
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [education, setEducation] = useState<EducationDraft[]>([]);
  const [certifications, setCertifications] = useState<CertificationDraft[]>(
    [],
  );
  const [workHistory, setWorkHistory] = useState<WorkDraft[]>([]);
  const [institutionOptions, setInstitutionOptions] = useState<
    Record<number, InstitutionOption[]>
  >({});
  const [institutionSearchBusy, setInstitutionSearchBusy] = useState<
    number | null
  >(null);
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("0");
  const [languages, setLanguages] = useState("English");
  const [ages, setAges] = useState<string[]>(["PRIMARY"]);
  const [modes, setModes] = useState<string[]>(["ONLINE"]);
  const [area, setArea] = useState("");

  /* Phone number belongs to the authenticated user, not TutorProfile. */
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [savedPhoneVerified, setSavedPhoneVerified] = useState(false);

  /* Page state */
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<UploadAction[]>([]);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [backgroundUploadProgress, setBackgroundUploadProgress] = useState<
    Record<string, number>
  >({});
  const [backgroundUploading, setBackgroundUploading] = useState<string[]>([]);
  const [backgroundUploadErrors, setBackgroundUploadErrors] = useState<
    Record<string, string>
  >({});

  function startUpload(action: UploadAction) {
    setUploading((current) =>
      current.includes(action) ? current : [...current, action],
    );
  }

  function finishUpload(action: UploadAction) {
    setUploading((current) => current.filter((item) => item !== action));
  }

  /* Catalogue */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [catalogTouched, setCatalogTouched] = useState(false);

  /* Subject picker */
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  /* Location picker */
  const [states, setStates] = useState<CatalogLocation[]>([]);
  const [lgas, setLgas] = useState<CatalogLocation[]>([]);
  const [communities, setCommunities] = useState<CatalogLocation[]>([]);
  const [locationNames, setLocationNames] = useState<Record<string, string>>(
    {},
  );

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedLgaId, setSelectedLgaId] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [newCommunityName, setNewCommunityName] = useState("");

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  /* Upload state */
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null,
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [identityDocumentName, setIdentityDocumentName] = useState<
    string | null
  >(null);

  /* Verification */
  const [identityDocumentType, setIdentityDocumentType] =
    useState<IdentityDocumentType>("NATIONAL_ID");
  const [acceptNda, setAcceptNda] = useState(false);
  const [ndaContent, setNdaContent] = useState("");
  const [ndaVersion, setNdaVersion] = useState("v1");
  const [acceptingNda, setAcceptingNda] = useState(false);
  const [ndaScrolledToEnd, setNdaScrolledToEnd] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null,
  );
  const [referees, setReferees] = useState<TutorReferee[]>([]);
  const [refereeDrafts, setRefereeDrafts] = useState<RefereeDraft[]>([
    { ...EMPTY_REFEREE },
    { ...EMPTY_REFEREE },
  ]);

  const pictureInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                           */
  /* ------------------------------------------------------------------------ */

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => subjectIds.includes(subject.id)),
    [subjects, subjectIds],
  );

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query),
    );
  }, [subjects, subjectSearch]);

  const visibleSubjects = useMemo(
    () =>
      showAllSubjects || subjectSearch.trim()
        ? filteredSubjects
        : filteredSubjects.slice(0, INITIAL_SUBJECT_LIMIT),
    [filteredSubjects, showAllSubjects, subjectSearch],
  );

  const selectedCommunities = useMemo(
    () =>
      locationIds.map((id) => ({
        id,
        name: locationNames[id] ?? "Previously selected community",
      })),
    [locationIds, locationNames],
  );

  const invitationsDispatched =
    referees.filter((referee) => Boolean(referee.invitation_sent_at)).length >=
    2;
  const consentedRefereeCount = referees.filter(
    (referee) => referee.status === "CONSENTED",
  ).length;

  const verificationStatus = verification?.status ?? "NOT_SUBMITTED";

  const verificationIsLocked =
    verificationStatus === "PENDING_REVIEW" ||
    verificationStatus === "APPROVED";

  const verificationStatusClass =
    verificationStatus === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : verificationStatus === "PENDING_REVIEW"
        ? "bg-blue-50 text-blue-700"
        : verificationStatus === "REJECTED" ||
            verificationStatus === "CHANGES_REQUESTED"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";

  /* ------------------------------------------------------------------------ */
  /* Location API                                                             */
  /* ------------------------------------------------------------------------ */

  async function fetchLocations(params: {
    location_type: LocationType;
    parent_id?: string;
  }) {
    const query = new URLSearchParams();
    query.set("location_type", params.location_type);

    if (params.parent_id) {
      query.set("parent_id", params.parent_id);
    }

    const response = await api<LocationListResponse>(
      `/locations?${query.toString()}`,
      {},
      { auth: false },
    );

    return unwrapLocations(response);
  }

  async function fetchLocationById(locationId: string) {
    return await api<CatalogLocation>(
      `/locations/${encodeURIComponent(locationId)}`,
      {},
      { auth: false },
    );
  }

  function rememberLocations(items: CatalogLocation[]) {
    setLocationNames((current) => {
      const next = { ...current };

      for (const item of items) {
        next[item.id] = item.name;
      }

      return next;
    });
  }

  async function hydrateSavedLocations(savedLocationIds: string[]) {
    if (savedLocationIds.length === 0) return;

    try {
      // Each saved tutor location is a NEIGHBORHOOD whose parent is an LGA.
      // Resolve the saved records and walk up the parent chain to recover the
      // State and LGA selectors when the page is revisited.
      const savedCommunities = await Promise.all(
        savedLocationIds.map((id) => fetchLocationById(id)),
      );

      const activeCommunities = savedCommunities.filter(
        (item) =>
          item.is_active !== false &&
          (item.location_type === "NEIGHBORHOOD" ||
            item.location_type === "CITY") &&
          Boolean(item.parent_id),
      );

      rememberLocations(savedCommunities);

      if (activeCommunities.length === 0) {
        toast.error(
          "Some saved communities could not be restored. Please review your service locations.",
        );
        return;
      }

      const parentLgaIds = Array.from(
        new Set(
          activeCommunities.map((community) => community.parent_id as string),
        ),
      );
      const parentLgas = await Promise.all(parentLgaIds.map(fetchLocationById));
      rememberLocations(parentLgas);

      const firstCommunity = activeCommunities[0];
      const firstLga = parentLgas.find(
        (lga) => lga.id === firstCommunity.parent_id,
      );

      if (
        !firstLga ||
        firstLga.location_type !== "LGA" ||
        !firstLga.parent_id
      ) {
        toast.error(
          "Could not restore the State and LGA for your saved community.",
        );
        return;
      }

      const state = await fetchLocationById(firstLga.parent_id);
      if (state.location_type !== "STATE") {
        toast.error("The saved community is linked to an invalid State.");
        return;
      }

      rememberLocations([state]);
      setStates((current) =>
        current.some((item) => item.id === state.id)
          ? current
          : [...current, state].sort((a, b) => a.name.localeCompare(b.name)),
      );

      // Restore the selector context to the first saved community. Other saved
      // communities remain visible in the selected-community list above.
      setSelectedStateId(state.id);
      setSelectedLgaId(firstLga.id);

      const [stateLgas, lgaCommunities] = await Promise.all([
        fetchLocations({ location_type: "LGA", parent_id: state.id }),
        fetchLocations({
          location_type: "NEIGHBORHOOD",
          parent_id: firstLga.id,
        }),
      ]);

      setLgas(
        stateLgas.some((item) => item.id === firstLga.id)
          ? stateLgas
          : [...stateLgas, firstLga].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
      );
      setCommunities(lgaCommunities);
      rememberLocations([
        ...stateLgas,
        firstLga,
        ...lgaCommunities,
        ...parentLgas,
      ]);

      // Resolve the names for every saved community, including communities in
      // other LGAs, so the saved-location chips never show placeholder text.
      if (activeCommunities.length !== savedLocationIds.length) {
        toast.error(
          "One or more saved communities are inactive or unavailable. You can remove them and select another community.",
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Could not restore your saved State, LGA and communities. Please try refreshing the page.",
        ),
      );
    }
  }

  async function loadStates() {
    setLoadingStates(true);

    try {
      const result = await fetchLocations({
        location_type: "STATE",
      });

      setStates(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load states."));
    } finally {
      setLoadingStates(false);
    }
  }

  async function handleStateChange(stateId: string) {
    setSelectedStateId(stateId);
    setSelectedLgaId("");
    setSelectedCommunityId("");
    setNewCommunityName("");
    setLgas([]);
    setCommunities([]);

    if (!stateId) return;

    setLoadingLgas(true);

    try {
      const result = await fetchLocations({
        location_type: "LGA",
        parent_id: stateId,
      });

      setLgas(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not load LGAs for this state."),
      );
    } finally {
      setLoadingLgas(false);
    }
  }

  async function handleLgaChange(lgaId: string) {
    setSelectedLgaId(lgaId);
    setSelectedCommunityId("");
    setNewCommunityName("");
    setCommunities([]);

    if (!lgaId) return;

    setLoadingCommunities(true);

    try {
      let result = await fetchLocations({
        location_type: "NEIGHBORHOOD",
        parent_id: lgaId,
      });

      // Support existing CITY records only as a fallback.
      if (result.length === 0) {
        result = await fetchLocations({
          location_type: "CITY",
          parent_id: lgaId,
        });
      }

      setCommunities(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not load communities for this LGA."),
      );
    } finally {
      setLoadingCommunities(false);
    }
  }

  function addExistingCommunity() {
    if (!selectedCommunityId) {
      toast.error("Select an existing community first.");
      return;
    }

    if (locationIds.includes(selectedCommunityId)) {
      toast.error("This community has already been added.");
      return;
    }

    const selected = communities.find(
      (community) => community.id === selectedCommunityId,
    );

    if (selected) {
      rememberLocations([selected]);
    }

    setLocationIds((current) => [...current, selectedCommunityId]);
    setCatalogTouched(true);
    setSelectedCommunityId("");
    toast.success("Community added to your service locations.");
  }

  async function createOrReuseCommunity() {
    const name = newCommunityName.trim();

    if (!selectedLgaId) {
      toast.error("Select a State and LGA first.");
      return;
    }

    if (name.length < 2) {
      toast.error("Enter a community name with at least two characters.");
      return;
    }

    if (name.length > 150) {
      toast.error("Community names cannot exceed 150 characters.");
      return;
    }

    // Reuse an already-loaded community in the selected LGA.
    const existing = communities.find(
      (community) => community.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (existing) {
      if (locationIds.includes(existing.id)) {
        toast.error("This community is already in your service locations.");
        return;
      }

      setLocationIds((current) => [...current, existing.id]);
      setCatalogTouched(true);
      setNewCommunityName("");
      setSelectedCommunityId("");
      toast.success("Existing community added.");
      return;
    }

    setCreatingCommunity(true);

    try {
      const community = await api<CatalogLocation>("/locations/communities", {
        method: "POST",
        body: JSON.stringify({
          name,
          lga_id: selectedLgaId,
        }),
      });

      // Add the returned record to the current list immediately.
      setCommunities((current) => {
        const alreadyPresent = current.some((item) => item.id === community.id);

        return alreadyPresent ? current : [...current, community];
      });

      rememberLocations([community]);

      // Add the new or reused community to the tutor's catalogue selection.
      setLocationIds((current) =>
        current.includes(community.id) ? current : [...current, community.id],
      );

      setCatalogTouched(true);
      setNewCommunityName("");
      setSelectedCommunityId("");

      toast.success("Community added. It is now available for this LGA.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add this community."));
    } finally {
      setCreatingCommunity(false);
    }
  }

  function removeCommunity(id: string) {
    setLocationIds((current) => current.filter((item) => item !== id));
    setCatalogTouched(true);
  }

  /* ------------------------------------------------------------------------ */
  /* Initial page data                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);

      const results = await Promise.allSettled([
        api<Subject[]>("/subjects", {}, { auth: false }),
        api<TutorProfile>("/tutors/profile"),
        api<VerificationResponse>("/verification/tutor/me"),
        api<TutorReferee[]>("/verification/tutor/referees"),
        fetchLocations({ location_type: "STATE" }),
        api<CurrentUserResponse>("/auth/me"),
        api<BackgroundApiResponse>("/tutors/profile/background"),
        api<{ payload: Record<string, any>; updated_at: string | null }>(
          "/tutors/profile/draft",
        ),
        api<{ version: string; content: string }>("/verification/tutor/nda"),
      ]);

      if (!active) return;

      const [
        subjectResult,
        profileResult,
        verificationResult,
        refereeResult,
        statesResult,
        currentUserResult,
        backgroundResult,
        draftResult,
        ndaResult,
      ] = results;

      if (subjectResult.status === "fulfilled") {
        setSubjects(subjectResult.value);
      } else {
        toast.error("Could not load subjects and learning areas.");
      }

      if (statesResult.status === "fulfilled") {
        setStates(statesResult.value);
        rememberLocations(statesResult.value);
      } else {
        toast.error("Could not load states.");
      }

      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value;

        setExists(true);
        setBio(profile.bio ?? "");
        setQualifications(profile.qualifications ?? "");
        setRate(
          profile.monthly_fee !== null ? String(profile.monthly_fee) : "",
        );
        setYears(String(profile.years_of_experience ?? 0));
        setLanguages((profile.teaching_languages ?? []).join(", "));
        setAges(profile.learner_age_groups ?? []);
        setModes(profile.tutoring_modes ?? ["ONLINE"]);
        setArea(profile.service_area ?? "");
        setProfilePictureUrl(profile.profile_picture_url ?? null);
        setVideoUrl(profile.introduction_video_url ?? null);

        if (Array.isArray(profile.subject_ids)) {
          setSubjectIds(profile.subject_ids);
        }

        if (Array.isArray(profile.location_ids)) {
          setLocationIds(profile.location_ids);
          void hydrateSavedLocations(profile.location_ids);
        }
      }

      if (backgroundResult.status === "fulfilled") {
        const background = backgroundResult.value;
        setEducation(
          (background.education ?? []).map((item) => ({
            institution_id: item.institution_id ?? "",
            institution_name: item.institution_name ?? "",
            country_code: item.country_code ?? "NG",
            course_of_study: item.course_of_study ?? "",
            specialty: item.specialty ?? "",
            qualification_type: item.qualification_type ?? "Other",
            grade: item.grade ?? "",
            start_date: item.start_date ?? "",
            end_date: item.end_date ?? "",
            currently_enrolled: Boolean(item.currently_enrolled),
            document_public_id: item.document_public_id ?? "",
            document_name: item.document_name ?? "",
            document_format: item.document_format ?? "",
          })),
        );
        setCertifications(
          (background.certifications ?? []).map((item) => ({
            name: item.name ?? "",
            issuing_organization: item.issuing_organization ?? "",
            date_obtained: item.date_obtained ?? "",
            expiry_date: item.expiry_date ?? "",
            document_public_id: item.document_public_id ?? "",
            document_name: item.document_name ?? "",
            document_format: item.document_format ?? "",
          })),
        );
        setWorkHistory(
          (background.work_history ?? []).map((item) => ({
            organization: item.organization ?? "",
            job_title: item.job_title ?? "",
            employment_type: item.employment_type ?? "",
            start_date: item.start_date ?? "",
            end_date: item.end_date ?? "",
            currently_working: Boolean(item.currently_working),
            description: item.description ?? "",
          })),
        );
      }

      if (ndaResult.status === "fulfilled") {
        setNdaVersion(ndaResult.value.version);
        setNdaContent(ndaResult.value.content);
        setNdaScrolledToEnd(false);
      } else {
        toast.error("Could not load the current tutor NDA.");
      }

      if (verificationResult.status === "fulfilled") {
        setVerification(verificationResult.value);
        setAcceptNda(
          Boolean(
            verificationResult.value.nda_accepted_at &&
            ndaResult.status === "fulfilled" &&
            verificationResult.value.nda_version === ndaResult.value.version &&
            verificationResult.value.nda_content === ndaResult.value.content,
          ),
        );

        if (
          [
            "PENDING_REVIEW",
            "APPROVED",
            "REJECTED",
            "CHANGES_REQUESTED",
          ].includes(verificationResult.value.status)
        ) {
          setStage2Completed(true);
        }
      }

      if (refereeResult.status === "fulfilled") {
        setReferees(refereeResult.value);
        if (refereeResult.value.length) {
          setRefereeDrafts(
            refereeResult.value.map((item) => ({
              full_name: item.full_name,
              email: item.email,
              job_title: item.job_title,
              relationship_to_tutor: item.relationship_to_tutor,
            })),
          );
        }
      }

      if (currentUserResult.status === "fulfilled") {
        const currentUser = currentUserResult.value;
        const savedPhone = currentUser.phone_number ?? "";
        setPhoneNumber(savedPhone);
        setSavedPhoneNumber(currentUser.phone_number);
        setPhoneVerified(currentUser.is_phone_verified);
        setSavedPhoneVerified(currentUser.is_phone_verified);
      } else {
        toast.error("Could not load your account phone number.");
      }

      if (draftResult.status === "fulfilled" && draftResult.value.payload) {
        const draft = draftResult.value.payload;
        if (typeof draft.bio === "string") setBio(draft.bio);
        if (typeof draft.qualifications === "string")
          setQualifications(draft.qualifications);
        if (Array.isArray(draft.education)) setEducation(draft.education);
        if (Array.isArray(draft.certifications))
          setCertifications(draft.certifications);
        if (Array.isArray(draft.workHistory)) setWorkHistory(draft.workHistory);
        if (typeof draft.rate === "string") setRate(draft.rate);
        if (typeof draft.years === "string") setYears(draft.years);
        if (typeof draft.languages === "string") setLanguages(draft.languages);
        if (Array.isArray(draft.ages)) setAges(draft.ages);
        if (Array.isArray(draft.modes)) setModes(draft.modes);
        if (typeof draft.area === "string") setArea(draft.area);
        if (typeof draft.phoneNumber === "string")
          setPhoneNumber(draft.phoneNumber);
        if (Array.isArray(draft.subjectIds)) setSubjectIds(draft.subjectIds);
        if (Array.isArray(draft.locationIds)) {
          setLocationIds(draft.locationIds);
          void hydrateSavedLocations(draft.locationIds);
        }
        if (typeof draft.selectedStateId === "string")
          setSelectedStateId(draft.selectedStateId);
        if (typeof draft.selectedLgaId === "string")
          setSelectedLgaId(draft.selectedLgaId);
        if (typeof draft.selectedCommunityId === "string")
          setSelectedCommunityId(draft.selectedCommunityId);
        if (typeof draft.newCommunityName === "string")
          setNewCommunityName(draft.newCommunityName);
        if (typeof draft.identityDocumentType === "string")
          setIdentityDocumentType(
            draft.identityDocumentType as IdentityDocumentType,
          );
        if (Array.isArray(draft.refereeDrafts))
          setRefereeDrafts(draft.refereeDrafts);
        if (
          draft.currentStep === 1 ||
          draft.currentStep === 2 ||
          draft.currentStep === 3
        )
          setCurrentStep(draft.currentStep);
        if (typeof draft.stage2Completed === "boolean")
          setStage2Completed(draft.stage2Completed);
      }

      setDraftReady(true);
      setLoading(false);
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!draftReady || loading) return;
    if (
      verification?.status === "PENDING_REVIEW" ||
      verification?.status === "APPROVED"
    )
      return;
    const payload = {
      currentStep,
      stage2Completed,
      bio,
      qualifications,
      education,
      certifications,
      workHistory,
      rate,
      years,
      languages,
      ages,
      modes,
      area,
      phoneNumber,
      subjectIds,
      locationIds,
      selectedStateId,
      selectedLgaId,
      selectedCommunityId,
      newCommunityName,
      identityDocumentType,
      refereeDrafts,
    };
    setDraftSaveStatus("saving");
    const timeout = window.setTimeout(() => {
      void api("/tutors/profile/draft", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
        .then(() => setDraftSaveStatus("saved"))
        .catch(() => setDraftSaveStatus("error"));
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [
    draftReady,
    loading,
    verification?.status,
    currentStep,
    stage2Completed,
    bio,
    qualifications,
    education,
    certifications,
    workHistory,
    rate,
    years,
    languages,
    ages,
    modes,
    area,
    phoneNumber,
    subjectIds,
    locationIds,
    selectedStateId,
    selectedLgaId,
    selectedCommunityId,
    newCommunityName,
    identityDocumentType,
    refereeDrafts,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Selection helpers                                                        */
  /* ------------------------------------------------------------------------ */

  function toggleSelection(
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void,
  ) {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  function toggleSubject(id: string) {
    setSubjectIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

    setCatalogTouched(true);
  }

  /* ------------------------------------------------------------------------ */
  /* Upload helpers                                                           */
  /* ------------------------------------------------------------------------ */

  function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number,
    label: string,
  ) {
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Choose a supported ${label} file.`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${label} must not exceed ${maxSize / (1024 * 1024)} MB.`);
      return false;
    }

    if (file.size === 0) {
      toast.error(`The selected ${label} file is empty.`);
      return false;
    }

    return true;
  }

  async function uploadFile(
    endpoint: string,
    file: File,
    action: Exclude<UploadAction, null>,
  ) {
    if (!exists) {
      throw new Error("Create your tutor profile before uploading files.");
    }

    const formData = new FormData();
    formData.append("file", file);

    startUpload(action);

    try {
      return await api<UploadResponse>(endpoint, {
        method: "POST",
        body: formData,
      });
    } finally {
      finishUpload(action);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Profile picture                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleProfilePicture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!exists) {
      toast.error("Create your tutor profile before uploading a picture.");
      return;
    }

    if (
      !validateFile(
        file,
        ["image/jpeg", "image/png", "image/webp"],
        5 * 1024 * 1024,
        "profile picture",
      )
    ) {
      return;
    }

    try {
      const response = await uploadFile(
        "/tutors/profile/picture",
        file,
        "picture",
      );

      if (response.profile_picture_url) {
        setProfilePictureUrl(response.profile_picture_url);
      } else {
        const profile = await api<TutorProfile>("/tutors/profile");
        setProfilePictureUrl(profile.profile_picture_url ?? null);
      }

      toast.success("Profile picture uploaded.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your profile picture."),
      );
    }
  }

  async function removeProfilePicture() {
    if (!exists) return;

    startUpload("picture-delete");

    try {
      await api("/tutors/profile/picture", {
        method: "DELETE",
      });

      setProfilePictureUrl(null);
      toast.success("Profile picture removed.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not remove your profile picture."),
      );
    } finally {
      finishUpload("picture-delete");
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Introduction video                                                       */
  /* ------------------------------------------------------------------------ */

  async function handleIntroductionVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!exists) {
      toast.error("Create your tutor profile before uploading a video.");
      return;
    }

    if (
      !validateFile(
        file,
        ["video/mp4", "video/webm"],
        100 * 1024 * 1024,
        "introduction video",
      )
    ) {
      return;
    }

    startUpload("video");
    setVideoUploadProgress(0);

    try {
      // Step 1: Request a signed upload with a unique public_id.
      const authorization = await api<VideoUploadSignatureResponse>(
        "/tutors/profile/introduction-video/signature",
        {
          method: "POST",
        },
      );

      if (authorization.overwrite !== false) {
        throw new Error(
          "The video upload signature returned an unexpected overwrite value.",
        );
      }

      // Step 2: Upload directly to Cloudinary.
      const cloudinaryForm = new FormData();

      cloudinaryForm.append("file", file);
      cloudinaryForm.append("api_key", authorization.api_key);
      cloudinaryForm.append("timestamp", String(authorization.timestamp));
      cloudinaryForm.append("public_id", authorization.public_id);
      // The value must match the value signed by the backend. Do not hardcode
      // a different value or append the same parameter more than once.
      cloudinaryForm.append("overwrite", String(authorization.overwrite));
      cloudinaryForm.append("signature", authorization.signature);

      const cloudinaryResult = await new Promise<CloudinaryVideoUploadResponse>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${encodeURIComponent(
              authorization.cloud_name,
            )}/video/upload`,
          );

          xhr.upload.onprogress = (progressEvent) => {
            if (progressEvent.lengthComputable && progressEvent.total > 0) {
              setVideoUploadProgress(
                Math.min(
                  99,
                  (progressEvent.loaded / progressEvent.total) * 100,
                ),
              );
            }
          };

          xhr.onload = () => {
            let result: CloudinaryVideoUploadResponse;
            try {
              result = JSON.parse(
                xhr.responseText,
              ) as CloudinaryVideoUploadResponse;
            } catch {
              reject(
                new Error("Cloudinary returned an unreadable upload response."),
              );
              return;
            }

            if (xhr.status < 200 || xhr.status >= 300) {
              reject(
                new Error(
                  result.error?.message ??
                    "Cloudinary could not upload your introduction video.",
                ),
              );
              return;
            }

            setVideoUploadProgress(100);
            resolve(result);
          };

          xhr.onerror = () =>
            reject(new Error("Network error while uploading your video."));
          xhr.onabort = () => reject(new Error("Video upload was cancelled."));
          xhr.send(cloudinaryForm);
        },
      );

      if (
        !cloudinaryResult.public_id ||
        cloudinaryResult.public_id !== authorization.public_id
      ) {
        throw new Error("The uploaded video could not be verified.");
      }

      // Step 3: Verify the uploaded asset and save its public_id.
      const response = await api<UploadResponse>(
        "/tutors/profile/introduction-video/complete",
        {
          method: "POST",
          body: JSON.stringify({
            public_id: cloudinaryResult.public_id,
          }),
        },
      );

      if (response.introduction_video_url) {
        setVideoUrl(response.introduction_video_url);
      } else {
        const profile = await api<TutorProfile>("/tutors/profile");
        setVideoUrl(profile.introduction_video_url ?? null);
      }

      toast.success("Introduction video uploaded successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your introduction video."),
      );
    } finally {
      finishUpload("video");
    }
  }
  async function removeIntroductionVideo() {
    if (!exists) return;

    startUpload("video-delete");

    try {
      await api("/tutors/profile/introduction-video", {
        method: "DELETE",
      });

      setVideoUrl(null);
      toast.success("Introduction video removed.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not remove your introduction video."),
      );
    } finally {
      finishUpload("video-delete");
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Identity document                                                        */
  /* ------------------------------------------------------------------------ */

  async function handleIdentityDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      !validateFile(
        file,
        ["application/pdf", "image/jpeg", "image/png"],
        10 * 1024 * 1024,
        "identity document",
      )
    ) {
      return;
    }

    try {
      await uploadFile(
        "/verification/tutor/identity-document",
        file,
        "identity",
      );

      // Only the filename is displayed. Private storage URLs and keys
      // are deliberately not exposed in the tutor interface.
      setIdentityDocumentName(file.name);
      toast.success("Identity document uploaded securely.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your identity document."),
      );
    }
  }

  async function searchInstitutions(
    index: number,
    query: string,
    countryCode: string,
  ) {
    if (query.trim().length < 2) {
      setInstitutionOptions((current) => ({ ...current, [index]: [] }));
      return;
    }
    setInstitutionSearchBusy(index);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        country_code: countryCode,
      });
      const options = await api<InstitutionOption[]>(
        `/tutors/profile/institutions?${params.toString()}`,
      );
      setInstitutionOptions((current) => ({ ...current, [index]: options }));
    } catch {
      setInstitutionOptions((current) => ({ ...current, [index]: [] }));
    } finally {
      setInstitutionSearchBusy((current) =>
        current === index ? null : current,
      );
    }
  }

  async function uploadBackgroundDocument(
    file: File,
    uploadKey: string,
  ): Promise<{ public_id: string; file_name: string; format: string }> {
    if (
      !validateFile(
        file,
        ["application/pdf", "image/jpeg", "image/png"],
        10 * 1024 * 1024,
        "document",
      )
    ) {
      throw new Error("Choose a valid document.");
    }
    const form = new FormData();
    form.append("file", file);
    setBackgroundUploading((current) =>
      current.includes(uploadKey) ? current : [...current, uploadKey],
    );
    setBackgroundUploadErrors((current) => ({ ...current, [uploadKey]: "" }));
    setBackgroundUploadProgress((current) => ({ ...current, [uploadKey]: 0 }));
    try {
      const uploaded = await uploadWithProgress<{
        public_id: string;
        file_name: string;
        format: string;
      }>("/tutors/profile/background/documents", form, (percentage) =>
        setBackgroundUploadProgress((current) => ({
          ...current,
          [uploadKey]: percentage,
        })),
      );
      return uploaded;
    } catch (error) {
      const message = getErrorMessage(error, "Upload failed.");
      setBackgroundUploadErrors((current) => ({
        ...current,
        [uploadKey]: message,
      }));
      throw error;
    } finally {
      setBackgroundUploading((current) =>
        current.filter((key) => key !== uploadKey),
      );
    }
  }

  async function suggestInstitution(index: number) {
    const item = education[index];
    if (!item || item.institution_name.trim().length < 2) {
      toast.error("Enter the institution name first.");
      return;
    }
    try {
      const result = await api<{ id: string; status: string; message: string }>(
        "/tutors/profile/institutions/suggest",
        {
          method: "POST",
          body: JSON.stringify({
            name: item.institution_name.trim(),
            country_code: item.country_code,
          }),
        },
      );
      if (result.status === "APPROVED")
        setEducation((current) =>
          current.map((row, i) =>
            i === index ? { ...row, institution_id: result.id } : row,
          ),
        );
      toast.success(result.message);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not submit institution suggestion."),
      );
    }
  }

  async function acceptCurrentNda() {
    if (!ndaContent || !ndaVersion) {
      toast.error(
        "The current NDA could not be loaded. Please refresh and try again.",
      );
      return;
    }
    if (!ndaScrolledToEnd) {
      toast.error("Scroll through the complete NDA before accepting it.");
      return;
    }
    setAcceptingNda(true);
    try {
      const accepted = await api<VerificationResponse>(
        "/verification/tutor/nda/accept",
        {
          method: "POST",
          body: JSON.stringify({ version: ndaVersion }),
        },
      );
      setVerification(accepted);
      setAcceptNda(Boolean(accepted.nda_accepted_at));
      toast.success("Your NDA acceptance has been recorded.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not record your NDA acceptance."),
      );
    } finally {
      setAcceptingNda(false);
    }
  }

  async function saveBackground() {
    // Incomplete entries remain in the server-side onboarding draft. Only
    // complete records are promoted into the persistent background tables.
    const validEducation = education.filter(
      (item) =>
        item.institution_name.trim() &&
        item.course_of_study.trim() &&
        item.start_date &&
        item.qualification_type &&
        (item.currently_enrolled ||
          (item.end_date && item.grade.trim() && item.document_public_id)),
    );
    const validCertifications = certifications.filter((item) =>
      item.name.trim(),
    );
    const validWork = workHistory.filter(
      (item) =>
        item.organization.trim() &&
        item.job_title.trim() &&
        item.start_date &&
        (item.currently_working || item.end_date),
    );
    try {
      await api("/tutors/profile/background", {
        method: "PUT",
        body: JSON.stringify({
          education: validEducation.map((item) => ({
            ...item,
            end_date: item.currently_enrolled ? null : item.end_date,
            specialty: item.specialty || null,
            grade: item.grade || null,
            institution_id: item.institution_id || null,
            document_public_id: item.document_public_id || null,
            document_name: item.document_name || null,
            document_format: item.document_format || null,
          })),
          certifications: validCertifications.map((item) => ({
            ...item,
            issuing_organization: item.issuing_organization || null,
            date_obtained: item.date_obtained || null,
            expiry_date: item.expiry_date || null,
            document_public_id: item.document_public_id || null,
            document_name: item.document_name || null,
            document_format: item.document_format || null,
          })),
          work_history: validWork.map((item) => ({
            ...item,
            end_date: item.currently_working ? null : item.end_date,
            employment_type: item.employment_type || null,
            description: item.description || null,
          })),
        }),
      });
      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Could not save education and professional background.",
        ),
      );
      return false;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Step 1: Save profile                                                     */
  /* ------------------------------------------------------------------------ */

  async function saveProfile(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    // Step 1 is the gate to verification. Validate the complete required
    // profile before allowing either the form button or the step indicator
    // to move the tutor forward. Draft autosaving remains unaffected.
    if (subjectIds.length === 0) {
      toast.error("Select at least one subject or learning area you teach.");
      return;
    }

    if (education.length === 0) {
      toast.error("Add at least one education record before continuing.");
      return;
    }

    for (let index = 0; index < education.length; index += 1) {
      const item = education[index];
      const label = `Education ${index + 1}`;

      if (!item.institution_name.trim()) {
        toast.error(
          `${label}: enter the institution name or suggest it for approval.`,
        );
        return;
      }
      if (!item.country_code.trim()) {
        toast.error(`${label}: select the institution's country.`);
        return;
      }
      if (!item.course_of_study.trim()) {
        toast.error(`${label}: enter your course of study.`);
        return;
      }
      if (!item.qualification_type.trim()) {
        toast.error(`${label}: select your qualification or programme.`);
        return;
      }
      if (!item.start_date) {
        toast.error(`${label}: select the date you started.`);
        return;
      }
      if (!item.currently_enrolled && !item.end_date) {
        toast.error(
          `${label}: select the completion date or mark yourself as currently enrolled.`,
        );
        return;
      }
      if (item.end_date && item.start_date && item.end_date < item.start_date) {
        toast.error(
          `${label}: the end date cannot be earlier than the start date.`,
        );
        return;
      }
      if (!item.currently_enrolled && !item.grade.trim()) {
        toast.error(`${label}: enter your grade or result.`);
        return;
      }
      if (!item.currently_enrolled && !item.document_public_id) {
        toast.error(
          `${label}: upload your certificate of completion or statement of result.`,
        );
        return;
      }
    }

    if (backgroundUploading.length > 0) {
      toast.error(
        "Wait for your education or certification uploads to finish before continuing.",
      );
      return;
    }

    const normalizedPhone = phoneNumber.trim();

    if (
      normalizedPhone &&
      normalizedPhone.replace(/[\s()+.-]/g, "").length < 7
    ) {
      toast.error("Enter a valid phone number or leave the field empty.");
      return;
    }

    if (normalizedPhone.length > 30) {
      toast.error("Phone number cannot exceed 30 characters.");
      return;
    }

    if (modes.length === 0) {
      toast.error("Select at least one teaching mode.");
      return;
    }

    if (ages.length === 0) {
      toast.error("Select at least one learner age group.");
      return;
    }

    if (!rate || !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
      toast.error("Enter a valid monthly tutoring fee.");
      return;
    }

    if (Number(rate) > 10000000) {
      toast.error("Monthly tutoring fee cannot exceed ₦10,000,000.");
      return;
    }

    const experience = Number(years);

    if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
      toast.error("Years of experience must be between 0 and 80.");
      return;
    }

    if (
      (modes.includes("IN_PERSON") || modes.includes("HYBRID")) &&
      locationIds.length === 0
    ) {
      toast.error(
        "Add at least one community for in-person or hybrid tutoring.",
      );
      return;
    }

    const languageList = [
      ...new Set(
        languages
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean),
      ),
    ];

    if (languageList.length === 0) {
      toast.error("Enter at least one teaching language.");
      return;
    }

    if (languageList.length > 20) {
      toast.error("You can enter a maximum of 20 teaching languages.");
      return;
    }

    setBusy(true);

    try {
      await api("/tutors/profile", {
        method: exists ? "PATCH" : "POST",
        body: JSON.stringify({
          bio: bio.trim() || null,
          qualifications: qualifications.trim() || null,
          monthly_fee: Number(rate),
          years_of_experience: experience,
          teaching_languages: languageList,
          learner_age_groups: ages,
          tutoring_modes: modes,
          service_area: area.trim() || null,
        }),
      });

      // Persist the complete catalogue on every save. This also persists
      // deliberate empty selections and prevents stale selections on reload.
      setExists(true);

      await api("/tutors/profile/catalog", {
        method: "PUT",
        body: JSON.stringify({
          subject_ids: subjectIds,
          location_ids: locationIds,
        }),
      });
      setCatalogTouched(false);

      const backgroundSaved = await saveBackground();
      if (!backgroundSaved)
        throw new Error(
          "Please review your education and professional background.",
        );

      // Phone number is stored on the authenticated User, not TutorProfile.
      // Do not call this endpoint when the number has not changed: doing so
      // would unnecessarily reset the phone verification flag.
      if (normalizedPhone !== (savedPhoneNumber ?? "")) {
        const updatedUser = await api<CurrentUserResponse>(
          "/auth/phone-number",
          {
            method: "PATCH",
            body: JSON.stringify({
              phone_number: normalizedPhone || null,
            }),
          },
        );

        const updatedPhone = updatedUser.phone_number ?? "";
        setPhoneNumber(updatedPhone);
        setSavedPhoneNumber(updatedUser.phone_number);
        setPhoneVerified(updatedUser.is_phone_verified);
        setSavedPhoneVerified(updatedUser.is_phone_verified);
      }

      toast.success("Your tutor profile has been saved.");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save your tutor profile."));
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Step 2: Submit verification                                              */
  /* ------------------------------------------------------------------------ */

  async function submitVerification(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!exists) {
      toast.error("Create your tutor profile in Step 1 first.");
      setCurrentStep(1);
      return;
    }

    if (!acceptNda) {
      toast.error("You must accept the tutor NDA before submitting.");
      return;
    }

    if (!invitationsDispatched) {
      toast.error(
        "Send referee invitations to at least two referees before submitting verification.",
      );
      setCurrentStep(3);
      return;
    }

    setBusy(true);

    try {
      const response = await api<VerificationResponse>(
        "/verification/tutor/submit",
        {
          method: "POST",
          body: JSON.stringify({
            identity_document_type: identityDocumentType,
            accept_nda: true,
          }),
        },
      );

      setVerification(response);
      setStage2Completed(true);
      try {
        await api("/tutors/profile/draft", { method: "DELETE" });
        setDraftReady(false);
      } catch {
        // Submission is already complete; a stale draft is harmless and can be overwritten later.
      }
      setAcceptNda(false);
      toast.success("Your verification has been submitted for review.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not submit your verification."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function inviteReferees(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      refereeDrafts.length < 2 ||
      refereeDrafts.some(
        (item) =>
          !item.full_name.trim() ||
          !item.email.trim() ||
          !item.job_title.trim() ||
          !item.relationship_to_tutor.trim(),
      )
    ) {
      toast.error(
        "Enter the full name, email, job title and relationship for at least two referees.",
      );
      return;
    }
    const emails = refereeDrafts.map((item) => item.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      toast.error("Each referee must have a different email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await api<TutorReferee[]>("/verification/tutor/referees", {
        method: "POST",
        body: JSON.stringify({ referees: refereeDrafts }),
      });
      setReferees(result);
      toast.success("Referee consent invitations have been sent.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not send referee invitations."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function refreshReferees() {
    setBusy(true);
    try {
      const result = await api<TutorReferee[]>("/verification/tutor/referees");
      setReferees(result);
      setRefereeDrafts(
        result.length
          ? result.map((item) => ({
              full_name: item.full_name,
              email: item.email,
              job_title: item.job_title,
              relationship_to_tutor: item.relationship_to_tutor,
            }))
          : [{ ...EMPTY_REFEREE }, { ...EMPTY_REFEREE }],
      );
      toast.success("Referee statuses refreshed.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not refresh referee statuses."),
      );
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <AppShell
      title="Tutor onboarding"
      description="Complete your tutor profile, verification and referee checks in three guided stages."
    >
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#1769D2]" size={28} />
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex justify-end">
            <p className="text-xs text-slate-500" aria-live="polite">
              {draftSaveStatus === "saving"
                ? "Saving your progress…"
                : draftSaveStatus === "error"
                  ? "Draft could not be saved. Check your connection."
                  : "Your progress is saved automatically."}
            </p>
          </div>
          <StepIndicator
            currentStep={currentStep}
            onStepChange={(step) => {
              if (step === 2) {
                // Never let the step indicator bypass Step 1 validation or
                // skip saving the latest edits. Reuse the same submit path.
                if (currentStep === 1) {
                  void saveProfile();
                } else if (!exists) {
                  toast.error(
                    "Save your tutor profile before continuing to Stage 2.",
                  );
                  setCurrentStep(1);
                } else {
                  setCurrentStep(2);
                }
                return;
              }
              if (step === 3 && !stage2Completed) {
                toast.error(
                  "Complete Stage 2 before moving to referee details.",
                );
                return;
              }
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            profileExists={exists}
            stage2Completed={stage2Completed}
          />

          {/* ================================================================= */}
          {/* STEP 1: PROFILE CREATION                                         */}
          {/* ================================================================= */}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1769D2]">
                  Stage 1 of 3
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#102A56]">
                  Create your professional profile
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Tell learners what you teach, your experience and where you
                  are available to teach.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Professional details</CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={saveProfile} className="space-y-7">
                    <Field
                      label="Phone number"
                      help="Add a number where learners or the Tutova team can reach you. Leave it empty if you do not want to provide one yet."
                    >
                      <div className="space-y-2">
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={30}
                          value={phoneNumber}
                          onChange={(event) => {
                            const nextPhone = event.target.value;
                            setPhoneNumber(nextPhone);
                            setPhoneVerified(
                              nextPhone.trim() === (savedPhoneNumber ?? "")
                                ? savedPhoneVerified
                                : false,
                            );
                          }}
                          placeholder="e.g. +234 801 234 5678"
                        />
                        {phoneNumber.trim() ? (
                          <p
                            className={`text-xs font-medium ${
                              phoneVerified
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {phoneVerified
                              ? "Phone number verified"
                              : "Phone number not verified"}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500">
                            No phone number added.
                          </p>
                        )}
                      </div>
                    </Field>

                    <Field label="Professional bio">
                      <Textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={5}
                        maxLength={5000}
                        placeholder="Tell learners about your background, teaching approach and what makes your lessons valuable."
                      />
                    </Field>

                    <Field label="Qualifications and expertise">
                      <Textarea
                        value={qualifications}
                        onChange={(event) =>
                          setQualifications(event.target.value)
                        }
                        rows={4}
                        maxLength={5000}
                        placeholder="A short summary of your qualifications and areas of expertise."
                      />
                    </Field>

                    <section className="space-y-4 border-t border-slate-100 pt-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#102A56]">
                            Education history{" "}
                            <span className="text-red-600">*</span>
                          </h3>
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Required to continue
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Add at least one institution and programme. For
                          completed qualifications, upload a certificate of
                          completion or statement of result. If you are still
                          enrolled, select “Currently enrolled”.
                        </p>
                      </div>
                      {education.map((item, index) => (
                        <div
                          key={index}
                          className="space-y-3 rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-800">
                              Education {index + 1}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={backgroundUploading.some((key) =>
                                key.startsWith("education-"),
                              )}
                              onClick={() =>
                                setEducation((rows) =>
                                  rows.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 size={15} /> Remove
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Institution name *">
                              <Input
                                value={item.institution_name}
                                placeholder="Search or enter institution"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            institution_name: value,
                                            institution_id: "",
                                          }
                                        : r,
                                    ),
                                  );
                                  void searchInstitutions(
                                    index,
                                    value,
                                    item.country_code,
                                  );
                                }}
                              />
                              {institutionSearchBusy === index && (
                                <p className="text-xs text-slate-500">
                                  Searching institutions…
                                </p>
                              )}
                              {(institutionOptions[index] ?? []).length > 0 && (
                                <div className="max-h-36 overflow-auto rounded-md border border-slate-200">
                                  {institutionOptions[index].map((option) => (
                                    <button
                                      type="button"
                                      key={option.id}
                                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                                      onClick={() => {
                                        setEducation((rows) =>
                                          rows.map((r, i) =>
                                            i === index
                                              ? {
                                                  ...r,
                                                  institution_id: option.id,
                                                  institution_name: option.name,
                                                  country_code:
                                                    option.country_code,
                                                }
                                              : r,
                                          ),
                                        );
                                        setInstitutionOptions((rows) => ({
                                          ...rows,
                                          [index]: [],
                                        }));
                                      }}
                                    >
                                      {option.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <button
                                type="button"
                                className="mt-1 text-xs font-medium text-[#1769D2]"
                                onClick={() => void suggestInstitution(index)}
                              >
                                Can’t find it? Suggest this institution
                              </button>
                            </Field>
                            <Field label="Country *">
                              <select
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                value={item.country_code}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            country_code: e.target.value,
                                            institution_id: "",
                                          }
                                        : r,
                                    ),
                                  )
                                }
                              >
                                {COUNTRIES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Course of study *">
                              <Input
                                value={item.course_of_study}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            course_of_study: e.target.value,
                                          }
                                        : r,
                                    ),
                                  )
                                }
                                placeholder="e.g. Mathematics"
                              />
                            </Field>
                            <Field label="Specialty / area of focus">
                              <Input
                                value={item.specialty}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, specialty: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                                placeholder="Optional"
                              />
                            </Field>
                            <Field label="Qualification / programme *">
                              <div className="space-y-2">
                                <select
                                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                  value={
                                    QUALIFICATION_TYPES.includes(
                                      item.qualification_type,
                                    )
                                      ? item.qualification_type
                                      : "Other"
                                  }
                                  onChange={(e) =>
                                    setEducation((rows) =>
                                      rows.map((r, i) =>
                                        i === index
                                          ? {
                                              ...r,
                                              qualification_type:
                                                e.target.value,
                                            }
                                          : r,
                                      ),
                                    )
                                  }
                                >
                                  {QUALIFICATION_TYPES.map((q) => (
                                    <option key={q}>{q}</option>
                                  ))}
                                </select>
                                {item.qualification_type === "Other" && (
                                  <Input
                                    value={
                                      item.qualification_type === "Other"
                                        ? ""
                                        : item.qualification_type
                                    }
                                    placeholder="Specify qualification or programme"
                                    onChange={(e) =>
                                      setEducation((rows) =>
                                        rows.map((r, i) =>
                                          i === index
                                            ? {
                                                ...r,
                                                qualification_type:
                                                  e.target.value || "Other",
                                              }
                                            : r,
                                        ),
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </Field>
                            <Field
                              label={
                                item.currently_enrolled
                                  ? "Grade / result (if available)"
                                  : "Grade / result *"
                              }
                            >
                              <Input
                                value={item.grade}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, grade: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                                placeholder="e.g. Second Class Upper, 4.2/5.0"
                              />
                            </Field>
                            <Field label="From *">
                              <Input
                                type="date"
                                value={item.start_date}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, start_date: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field
                              label={
                                item.currently_enrolled
                                  ? "To (if completed)"
                                  : "To *"
                              }
                            >
                              <Input
                                type="date"
                                disabled={item.currently_enrolled}
                                value={item.end_date}
                                onChange={(e) =>
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, end_date: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.currently_enrolled}
                              onChange={(e) =>
                                setEducation((rows) =>
                                  rows.map((r, i) =>
                                    i === index
                                      ? {
                                          ...r,
                                          currently_enrolled: e.target.checked,
                                          end_date: e.target.checked
                                            ? ""
                                            : r.end_date,
                                        }
                                      : r,
                                  ),
                                )
                              }
                            />{" "}
                            Currently enrolled
                          </label>
                          <Field
                            label={
                              item.currently_enrolled
                                ? "Certificate / statement of result (if available)"
                                : "Certificate of completion / statement of result *"
                            }
                          >
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={backgroundUploading.includes(
                                `education-${index}`,
                              )}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;
                                try {
                                  const uploaded =
                                    await uploadBackgroundDocument(
                                      file,
                                      `education-${index}`,
                                    );
                                  setEducation((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            document_public_id:
                                              uploaded.public_id,
                                            document_name: uploaded.file_name,
                                            document_format: uploaded.format,
                                          }
                                        : r,
                                    ),
                                  );
                                  toast.success(
                                    "Education document uploaded securely.",
                                  );
                                } catch (err) {
                                  toast.error(
                                    getErrorMessage(
                                      err,
                                      "Could not upload document.",
                                    ),
                                  );
                                }
                              }}
                            />
                            <BackgroundUploadProgress
                              uploading={backgroundUploading.includes(
                                `education-${index}`,
                              )}
                              progress={
                                backgroundUploadProgress[`education-${index}`]
                              }
                              fileName={
                                item.document_name || "education document"
                              }
                              error={
                                backgroundUploadErrors[`education-${index}`]
                              }
                            />
                            {item.document_name &&
                              !backgroundUploading.includes(
                                `education-${index}`,
                              ) && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                                  <CheckCircle2 size={13} /> Uploaded:{" "}
                                  {item.document_name}
                                </p>
                              )}
                          </Field>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setEducation((rows) => [
                            ...rows,
                            { ...EMPTY_EDUCATION },
                          ])
                        }
                      >
                        <Plus size={15} /> Add institution
                      </Button>
                    </section>

                    <section className="space-y-4 border-t border-slate-100 pt-6">
                      <div>
                        <h3 className="font-semibold text-[#102A56]">
                          Professional certifications{" "}
                          <span className="text-xs font-normal text-slate-400">
                            Optional
                          </span>
                        </h3>
                        <p className="text-sm text-slate-500">
                          Add relevant professional or teaching certifications
                          to strengthen your profile.
                        </p>
                      </div>
                      {certifications.map((item, index) => (
                        <div
                          key={index}
                          className="space-y-3 rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex justify-between">
                            <p className="font-medium">
                              Certification {index + 1}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={backgroundUploading.some((key) =>
                                key.startsWith("certification-"),
                              )}
                              onClick={() =>
                                setCertifications((rows) =>
                                  rows.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 size={15} /> Remove
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Certification name">
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  setCertifications((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, name: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Issuing organisation">
                              <Input
                                value={item.issuing_organization}
                                onChange={(e) =>
                                  setCertifications((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            issuing_organization:
                                              e.target.value,
                                          }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Date obtained">
                              <Input
                                type="date"
                                value={item.date_obtained}
                                onChange={(e) =>
                                  setCertifications((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            date_obtained: e.target.value,
                                          }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Expiry date (if applicable)">
                              <Input
                                type="date"
                                value={item.expiry_date}
                                onChange={(e) =>
                                  setCertifications((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, expiry_date: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          </div>
                          <Field label="Certificate upload (optional)">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={backgroundUploading.includes(
                                `certification-${index}`,
                              )}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;
                                try {
                                  const uploaded =
                                    await uploadBackgroundDocument(
                                      file,
                                      `certification-${index}`,
                                    );
                                  setCertifications((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            document_public_id:
                                              uploaded.public_id,
                                            document_name: uploaded.file_name,
                                            document_format: uploaded.format,
                                          }
                                        : r,
                                    ),
                                  );
                                  toast.success("Certification uploaded.");
                                } catch (err) {
                                  toast.error(
                                    getErrorMessage(
                                      err,
                                      "Could not upload certification.",
                                    ),
                                  );
                                }
                              }}
                            />
                            <BackgroundUploadProgress
                              uploading={backgroundUploading.includes(
                                `certification-${index}`,
                              )}
                              progress={
                                backgroundUploadProgress[
                                  `certification-${index}`
                                ]
                              }
                              fileName={item.document_name || "certification"}
                              error={
                                backgroundUploadErrors[`certification-${index}`]
                              }
                            />
                            {item.document_name &&
                              !backgroundUploading.includes(
                                `certification-${index}`,
                              ) && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                                  <CheckCircle2 size={13} /> Uploaded:{" "}
                                  {item.document_name}
                                </p>
                              )}
                          </Field>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCertifications((rows) => [
                            ...rows,
                            { ...EMPTY_CERTIFICATION },
                          ])
                        }
                      >
                        <Plus size={15} /> Add certification
                      </Button>
                    </section>

                    <section className="space-y-4 border-t border-slate-100 pt-6">
                      <div>
                        <h3 className="font-semibold text-[#102A56]">
                          Work history{" "}
                          <span className="text-xs font-normal text-slate-400">
                            Optional
                          </span>
                        </h3>
                        <p className="text-sm text-slate-500">
                          Include previous teaching or professional experience,
                          if any. You can skip this section.
                        </p>
                      </div>
                      {workHistory.map((item, index) => (
                        <div
                          key={index}
                          className="space-y-3 rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex justify-between">
                            <p className="font-medium">
                              Work experience {index + 1}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setWorkHistory((rows) =>
                                  rows.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 size={15} /> Remove
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Organisation / employer">
                              <Input
                                value={item.organization}
                                onChange={(e) =>
                                  setWorkHistory((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, organization: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Job title">
                              <Input
                                value={item.job_title}
                                onChange={(e) =>
                                  setWorkHistory((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, job_title: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="Employment type">
                              <Input
                                value={item.employment_type}
                                onChange={(e) =>
                                  setWorkHistory((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? {
                                            ...r,
                                            employment_type: e.target.value,
                                          }
                                        : r,
                                    ),
                                  )
                                }
                                placeholder="e.g. Full-time, Part-time, Contract"
                              />
                            </Field>
                            <Field label="From">
                              <Input
                                type="date"
                                value={item.start_date}
                                onChange={(e) =>
                                  setWorkHistory((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, start_date: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                            <Field label="To">
                              <Input
                                type="date"
                                disabled={item.currently_working}
                                value={item.end_date}
                                onChange={(e) =>
                                  setWorkHistory((rows) =>
                                    rows.map((r, i) =>
                                      i === index
                                        ? { ...r, end_date: e.target.value }
                                        : r,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.currently_working}
                              onChange={(e) =>
                                setWorkHistory((rows) =>
                                  rows.map((r, i) =>
                                    i === index
                                      ? {
                                          ...r,
                                          currently_working: e.target.checked,
                                          end_date: e.target.checked
                                            ? ""
                                            : r.end_date,
                                        }
                                      : r,
                                  ),
                                )
                              }
                            />{" "}
                            Currently working here
                          </label>
                          <Field label="Responsibilities / description">
                            <Textarea
                              rows={3}
                              value={item.description}
                              onChange={(e) =>
                                setWorkHistory((rows) =>
                                  rows.map((r, i) =>
                                    i === index
                                      ? { ...r, description: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </Field>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setWorkHistory((rows) => [...rows, { ...EMPTY_WORK }])
                        }
                      >
                        <Plus size={15} /> Add work history
                      </Button>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Monthly tutoring fee (₦)">
                        <Input
                          type="number"
                          min="1"
                          max="10000000"
                          step="0.01"
                          required
                          value={rate}
                          onChange={(event) => setRate(event.target.value)}
                          placeholder="e.g. 5000"
                        />
                      </Field>

                      <Field label="Years of experience">
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          step="1"
                          required
                          value={years}
                          onChange={(event) => setYears(event.target.value)}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Teaching languages"
                      help="Separate multiple languages with commas."
                    >
                      <Input
                        value={languages}
                        onChange={(event) => setLanguages(event.target.value)}
                        placeholder="English, Igbo, Yoruba"
                      />
                    </Field>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#102A56]">
                        Learner age groups
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {AGE_GROUPS.map((item) => (
                          <SelectionButton
                            key={item.value}
                            selected={ages.includes(item.value)}
                            onClick={() =>
                              toggleSelection(item.value, ages, setAges)
                            }
                          >
                            {item.label}
                          </SelectionButton>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#102A56]">
                        Teaching modes
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {TEACHING_MODES.map((item) => (
                          <SelectionButton
                            key={item.value}
                            selected={modes.includes(item.value)}
                            onClick={() =>
                              toggleSelection(item.value, modes, setModes)
                            }
                          >
                            {item.label}
                          </SelectionButton>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Select every mode you offer: online, in person or
                        hybrid.
                      </p>
                    </div>

                    <Field
                      label="Service area"
                      help="A general description of the areas you serve."
                    >
                      <Input
                        value={area}
                        onChange={(event) => setArea(event.target.value)}
                        maxLength={255}
                        placeholder="e.g. Owerri and surrounding areas"
                      />
                    </Field>

                    {/* Subjects */}

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-[#102A56]">
                            What can you teach?
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Search and select the subjects, skills or learning
                            areas you offer. At least one selection is required.
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1769D2]">
                          {subjectIds.length} selected
                        </span>
                      </div>

                      {selectedSubjects.length > 0 && (
                        <div className="mt-4 rounded-xl border border-[#BCE8E1] bg-[#F2FBF9] p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#087E75]">
                              Selected learning areas
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setSubjectIds([]);
                                setCatalogTouched(true);
                              }}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Clear all
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {selectedSubjects.map((subject) => (
                              <span
                                key={subject.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#BCE8E1] bg-white px-3 py-1.5 text-xs font-medium text-[#087E75]"
                              >
                                {subject.name}
                                <button
                                  type="button"
                                  aria-label={`Remove ${subject.name}`}
                                  onClick={() => toggleSubject(subject.id)}
                                  className="rounded-full hover:text-red-600"
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative mt-4">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Input
                          value={subjectSearch}
                          onChange={(event) => {
                            setSubjectSearch(event.target.value);
                            setShowAllSubjects(false);
                          }}
                          placeholder="Search for a subject or skill..."
                          className="pl-10"
                        />
                      </div>

                      {subjects.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No active subjects or learning areas are currently
                          available.
                        </p>
                      ) : filteredSubjects.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No matching subjects found. Try another search.
                        </p>
                      ) : (
                        <>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleSubjects.map((subject) => {
                              const selected = subjectIds.includes(subject.id);

                              return (
                                <button
                                  key={subject.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => toggleSubject(subject.id)}
                                  className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                                    selected
                                      ? "border-[#8AD6CB] bg-[#F0FAF8]"
                                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                      selected
                                        ? "border-[#00A99A] bg-[#00A99A] text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {selected && <Check size={13} />}
                                  </span>

                                  <span
                                    className={`min-w-0 flex-1 text-sm ${
                                      selected
                                        ? "font-semibold text-[#087E75]"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {subject.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {!subjectSearch.trim() &&
                            filteredSubjects.length > INITIAL_SUBJECT_LIMIT && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAllSubjects((current) => !current)
                                }
                                className="mt-4 text-sm font-semibold text-[#1769D2] hover:text-[#102A56]"
                              >
                                {showAllSubjects
                                  ? "Show fewer subjects"
                                  : `Show all ${filteredSubjects.length} learning areas`}
                              </button>
                            )}
                        </>
                      )}
                    </div>

                    {/* Locations */}

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
                          <MapPin size={19} />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#102A56]">
                            Where can you teach in person?
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Select a State and LGA, then choose an existing
                            community or add one yourself.
                          </p>
                        </div>
                      </div>

                      {states.length === 0 && !loadingStates ? (
                        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                          No states were returned by the location service.
                          Please check that your seeded State records are
                          active.
                        </p>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <LocationSelect
                              label="1. State"
                              value={selectedStateId}
                              onChange={handleStateChange}
                              options={states}
                              placeholder="Select state"
                              loading={loadingStates}
                            />

                            <LocationSelect
                              label="2. Local Government Area"
                              value={selectedLgaId}
                              onChange={handleLgaChange}
                              options={lgas}
                              placeholder={
                                selectedStateId
                                  ? "Select LGA"
                                  : "Select a state first"
                              }
                              disabled={!selectedStateId}
                              loading={loadingLgas}
                            />
                          </div>

                          <div className="mt-5 border-t border-slate-200 pt-5">
                            <p className="text-sm font-semibold text-[#102A56]">
                              3. Community
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Choose an existing community or enter a new one.
                              New communities are saved under the selected LGA
                              and become available to other tutors.
                            </p>

                            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                              <LocationSelect
                                label="Existing community"
                                value={selectedCommunityId}
                                onChange={setSelectedCommunityId}
                                options={communities}
                                placeholder={
                                  !selectedLgaId
                                    ? "Select an LGA first"
                                    : communities.length
                                      ? "Select community"
                                      : "No existing communities"
                                }
                                disabled={!selectedLgaId}
                                loading={loadingCommunities}
                              />

                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={
                                    !selectedCommunityId ||
                                    creatingCommunity ||
                                    loadingCommunities
                                  }
                                  onClick={addExistingCommunity}
                                  className="w-full sm:w-auto"
                                >
                                  <Plus size={15} className="mr-2" />
                                  Add selected
                                </Button>
                              </div>
                            </div>

                            <div className="my-4 flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-200" />
                              <span className="text-xs font-medium text-slate-400">
                                OR ADD A NEW COMMUNITY
                              </span>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                              <Field label="Community name">
                                <Input
                                  value={newCommunityName}
                                  onChange={(event) =>
                                    setNewCommunityName(event.target.value)
                                  }
                                  maxLength={150}
                                  disabled={!selectedLgaId || creatingCommunity}
                                  placeholder={
                                    selectedLgaId
                                      ? "Enter community name"
                                      : "Select an LGA first"
                                  }
                                />
                              </Field>

                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  disabled={
                                    !selectedLgaId ||
                                    newCommunityName.trim().length < 2 ||
                                    creatingCommunity
                                  }
                                  onClick={createOrReuseCommunity}
                                  className="w-full sm:w-auto"
                                >
                                  {creatingCommunity ? (
                                    <Loader2
                                      size={15}
                                      className="mr-2 animate-spin"
                                    />
                                  ) : (
                                    <Plus size={15} className="mr-2" />
                                  )}
                                  {creatingCommunity
                                    ? "Adding…"
                                    : "Add community"}
                                </Button>
                              </div>
                            </div>

                            {!selectedLgaId && (
                              <p className="mt-3 text-xs text-slate-500">
                                Select a State and LGA before choosing or
                                creating a community.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[#102A56]">
                            Your service communities
                          </p>

                          <span className="text-xs text-slate-500">
                            {locationIds.length} selected
                          </span>
                        </div>

                        {selectedCommunities.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            No communities added yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedCommunities.map((location) => (
                              <span
                                key={location.id}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-[#1769D2]"
                              >
                                <MapPin size={14} />
                                {location.name}

                                <button
                                  type="button"
                                  aria-label={`Remove ${location.name}`}
                                  onClick={() => removeCommunity(location.id)}
                                  className="rounded-full hover:text-red-600"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Online-only tutors can leave the location section empty.
                        In-person and hybrid tutors should add the communities
                        they serve.
                      </p>
                    </div>

                    {/* Save and continue */}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-5 text-slate-500">
                        Your profile must be saved before you can proceed to
                        verification.
                      </p>

                      <Button
                        type="submit"
                        disabled={
                          busy ||
                          uploading.length > 0 ||
                          backgroundUploading.length > 0 ||
                          creatingCommunity
                        }
                        className="w-full sm:w-auto"
                      >
                        {busy ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} className="mr-2" />
                        )}
                        {busy
                          ? "Saving profile…"
                          : exists
                            ? "Save and continue"
                            : "Create profile and continue"}
                        {!busy && <ChevronRight size={16} className="ml-2" />}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: VERIFICATION                                              */}
          {/* ================================================================= */}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1769D2]">
                  Stage 2 of 3
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#102A56]">
                  Verify your tutor account
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add your profile picture, introduce yourself, upload an
                  identity document and agree to the tutor NDA.
                </p>
              </div>

              {!exists && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Your profile has not been created yet.
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Complete Step 1 before continuing with verification.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Return to profile creation
                  </Button>
                </div>
              )}

              {/* Profile picture */}

              <Card>
                <CardHeader>
                  <CardTitle>Profile picture</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profilePictureUrl}
                          alt="Your tutor profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera size={34} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#102A56]">
                        Make your profile recognisable
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Use a clear, professional photograph. JPEG, PNG or WebP,
                        maximum 5 MB.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          disabled={
                            !exists ||
                            uploading.includes("picture") ||
                            uploading.includes("picture-delete")
                          }
                          onClick={() => pictureInputRef.current?.click()}
                        >
                          {uploading.includes("picture") ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Upload size={16} className="mr-2" />
                          )}
                          {!exists
                            ? "Create profile first"
                            : profilePictureUrl
                              ? "Change picture"
                              : "Upload picture"}
                        </Button>

                        {profilePictureUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              uploading.includes("picture") ||
                              uploading.includes("picture-delete")
                            }
                            onClick={removeProfilePicture}
                          >
                            {uploading.includes("picture-delete") ? (
                              <Loader2
                                size={16}
                                className="mr-2 animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} className="mr-2" />
                            )}
                            Remove
                          </Button>
                        )}
                      </div>

                      <input
                        ref={pictureInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={
                          !exists ||
                          uploading.includes("picture") ||
                          uploading.includes("picture-delete")
                        }
                        onChange={handleProfilePicture}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification status */}

              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Verification status</CardTitle>

                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${verificationStatusClass}`}
                    >
                      {formatStatus(verificationStatus)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {verification?.review_notes && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        Feedback from the review team
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-800">
                        {verification.review_notes}
                      </p>
                    </div>
                  )}

                  {verificationIsLocked && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-[#102A56]">
                        {verificationStatus === "APPROVED"
                          ? "Your tutor verification has been approved."
                          : "Your verification is awaiting review."}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {verificationStatus === "APPROVED"
                          ? "Your verification has been approved. You do not need to submit it again."
                          : "Your documents are being reviewed. You will be able to respond if the review team requests changes."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Introduction video */}

              {!verificationIsLocked && (
                <Card>
                  <CardHeader>
                    <CardTitle>Introduction video</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-slate-500">
                      Help learners get to know you. Introduce yourself, explain
                      what you teach and describe how you help learners make
                      progress.
                    </p>

                    {videoUrl && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          className="max-h-[420px] w-full"
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}

                    <FileUploadCard
                      title="Tutor introduction"
                      description="MP4 or WebM video, maximum 100 MB and 2 minutes. Uploading another video replaces the existing introduction."
                      icon={<Video size={21} />}
                      accept="video/mp4,video/webm"
                      fileName={videoUrl ? "Introduction video uploaded" : null}
                      busy={
                        uploading.includes("video") ||
                        uploading.includes("video-delete")
                      }
                      progress={
                        uploading.includes("video") ? videoUploadProgress : null
                      }
                      disabled={!exists}
                      actionLabel={videoUrl ? "Replace video" : "Upload video"}
                      onChange={handleIntroductionVideo}
                      onRemove={videoUrl ? removeIntroductionVideo : undefined}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Identity document and NDA */}

              {!verificationIsLocked && (
                <Card>
                  <CardHeader>
                    <CardTitle>Identity document and agreement</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-[#1769D2]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-[#102A56]">
                          Your identity document is private
                        </p>

                        <p className="mt-1 text-sm leading-6 text-blue-900/80">
                          Identity documents are uploaded to private storage and
                          are made available only through the authorised
                          verification process. They are not displayed on your
                          public tutor profile.
                        </p>
                      </div>
                    </div>

                    <FileUploadCard
                      title="Identity document"
                      description="Upload a valid National ID, international passport, driver's licence or other approved identity document. PDF, JPEG or PNG, maximum 10 MB."
                      icon={<FileText size={21} />}
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      fileName={identityDocumentName}
                      busy={uploading.includes("identity")}
                      disabled={!exists}
                      actionLabel={
                        identityDocumentName
                          ? "Replace document"
                          : "Upload document"
                      }
                      onChange={handleIdentityDocument}
                    />

                    <Field label="Identity document type">
                      <select
                        value={identityDocumentType}
                        onChange={(event) =>
                          setIdentityDocumentType(
                            event.target.value as IdentityDocumentType,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100"
                      >
                        {IDENTITY_DOCUMENT_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!acceptNda) {
                          toast.error(
                            "Accept the tutor NDA before continuing.",
                          );
                          return;
                        }
                        setStage2Completed(true);
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-[#102A56]">
                            Tutova Tutor Confidentiality and Safeguarding
                            Agreement
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            Version {ndaVersion}
                          </span>
                        </div>
                        <div
                          onScroll={(event) => {
                            const element = event.currentTarget;
                            if (
                              element.scrollTop + element.clientHeight >=
                              element.scrollHeight - 8
                            ) {
                              setNdaScrolledToEnd(true);
                            }
                          }}
                          className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap"
                        >
                          {ndaContent || "Loading the current agreement…"}
                        </div>
                        {acceptNda ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <p className="font-semibold inline-flex items-center gap-2">
                              <CheckCircle2 size={16} /> NDA accepted
                            </p>
                            <p className="mt-1">
                              Your acceptance has been recorded
                              {verification?.nda_accepted_at
                                ? ` on ${new Date(verification.nda_accepted_at).toLocaleString()}`
                                : ""}
                              . You can continue to the referee section.
                            </p>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => void acceptCurrentNda()}
                            disabled={
                              acceptingNda || !ndaContent || !ndaScrolledToEnd
                            }
                          >
                            {acceptingNda ? (
                              <Loader2
                                size={16}
                                className="mr-2 animate-spin"
                              />
                            ) : (
                              <ShieldCheck size={16} className="mr-2" />
                            )}
                            {ndaScrolledToEnd
                              ? "I have read and agree to the NDA"
                              : "Scroll to the end to agree"}
                          </Button>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-[#102A56]">
                          Before submitting
                        </p>

                        <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
                          <li>Your professional profile must be saved.</li>
                          <li>Your introduction video must be uploaded.</li>
                          <li>Your identity document must be uploaded.</li>
                          <li>You must accept the tutor NDA.</li>
                          <li>
                            Provide at least two referees in Stage 3. Their
                            responses are reviewed by Tutova before approval.
                          </li>
                        </ul>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          The server checks that the required uploads are stored
                          before accepting your verification submission.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          busy || uploading.length > 0 || !acceptNda || !exists
                        }
                        className="w-full sm:w-auto"
                      >
                        {busy ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <ShieldCheck size={16} className="mr-2" />
                        )}
                        Continue to Stage 3
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step navigation */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Back to Stage 1
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs leading-5 text-slate-500">
                    You can return to Stage 1 to update your professional
                    details.
                  </p>
                  {stage2Completed && (
                    <Button
                      type="button"
                      onClick={() => {
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Continue to Stage 3{" "}
                      <ChevronRight size={16} className="ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1769D2]">
                  Stage 3 of 3
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#102A56]">
                  Provide at least two referees
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Provide at least two people who can verify your professional
                  or personal background. Tutova emails each referee a unique,
                  secure link. They do not need a Tutova account. Your
                  application remains pending while Tutova reviews the
                  responses.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Referee details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={inviteReferees} className="space-y-5">
                    {refereeDrafts.map((referee, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2"
                      >
                        <div className="md:col-span-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#102A56]">
                            Referee {index + 1}
                          </p>
                          {refereeDrafts.length > 2 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={busy || verificationIsLocked}
                              onClick={() =>
                                setRefereeDrafts((current) =>
                                  current.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <Field label="Full name">
                          <Input
                            required
                            value={referee.full_name}
                            disabled={verificationIsLocked}
                            onChange={(event) =>
                              setRefereeDrafts((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? { ...item, full_name: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="Referee's full name"
                          />
                        </Field>
                        <Field label="Email address">
                          <Input
                            required
                            type="email"
                            value={referee.email}
                            disabled={verificationIsLocked}
                            onChange={(event) =>
                              setRefereeDrafts((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? { ...item, email: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="name@example.com"
                          />
                        </Field>
                        <Field label="Job title / occupation">
                          <Input
                            required
                            value={referee.job_title}
                            disabled={verificationIsLocked}
                            onChange={(event) =>
                              setRefereeDrafts((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? { ...item, job_title: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="e.g. School Principal"
                          />
                        </Field>
                        <Field label="Relationship to you">
                          <Input
                            required
                            value={referee.relationship_to_tutor}
                            disabled={verificationIsLocked}
                            onChange={(event) =>
                              setRefereeDrafts((current) =>
                                current.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        relationship_to_tutor:
                                          event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            placeholder="e.g. Former supervisor"
                          />
                        </Field>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy || verificationIsLocked}
                        onClick={() =>
                          setRefereeDrafts((current) => [
                            ...current,
                            { ...EMPTY_REFEREE },
                          ])
                        }
                      >
                        <Plus size={15} className="mr-2" />
                        Add another referee
                      </Button>
                      <Button
                        type="submit"
                        disabled={busy || verificationIsLocked}
                      >
                        {busy
                          ? "Sending invitations…"
                          : "Save referees and send email links"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void refreshReferees()}
                      >
                        Refresh referee statuses
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referee response status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {referees.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No referee invitations have been submitted yet.
                    </p>
                  ) : (
                    referees.map((referee) => (
                      <div
                        key={referee.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                      >
                        <div>
                          <p className="font-semibold text-[#102A56]">
                            {referee.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {referee.email} · {referee.job_title} ·{" "}
                            {referee.relationship_to_tutor}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${referee.status === "CONSENTED" ? "bg-emerald-50 text-emerald-700" : referee.status === "DECLINED" || referee.status === "EXPIRED" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          {referee.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    ))
                  )}
                  <p className="text-xs text-slate-500">
                    At least two referee invitations must be sent before you
                    submit. Referee links expire after 14 days. Your application
                    stays pending until an administrator completes the review;
                    sending invitations does not mean you are approved.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      disabled={
                        busy ||
                        !invitationsDispatched ||
                        !acceptNda ||
                        verificationIsLocked
                      }
                      onClick={() => void submitVerification()}
                      className="w-full sm:w-auto"
                    >
                      {busy ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <ShieldCheck size={16} className="mr-2" />
                      )}
                      Submit tutor application for review
                    </Button>
                    {consentedRefereeCount > 0 && (
                      <span className="text-xs text-slate-500">
                        {consentedRefereeCount} referee response(s) received
                      </span>
                    )}
                  </div>
                  {verificationIsLocked && (
                    <p className="text-sm text-blue-700">
                      Your application is pending administrator review. You will
                      be notified when a decision is made.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Back to Stage 2
                </Button>
                <p className="text-xs leading-5 text-slate-500">
                  You can return to earlier stages to review your information.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
