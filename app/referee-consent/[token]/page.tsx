"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ClipboardCheck,
  UserRound,
  BriefcaseBusiness,
  HeartHandshake,
  ShieldAlert,
} from "lucide-react";

type ConsentPage = {
  referee_name: string;
  referee_email: string;
  tutor_name: string;
  status: "PENDING" | "CONSENTED" | "DECLINED" | "EXPIRED";
  token_expires_at: string;
};

type Rating = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNABLE_TO_JUDGE";

type ReferenceFormAnswers = {
  relationship: string;
  relationship_other: string;
  duration_known: string;
  observed_capacity: string;

  reliability: Rating | "";
  patience_empathy: Rating | "";
  communication: Rating | "";
  honesty_integrity: Rating | "";
  professionalism: Rating | "";

  strengths: string;

  safeguarding_concern: "NO" | "YES" | "";
  misconduct_history: "NO" | "YES" | "NOT_APPLICABLE" | "";
  safeguarding_details: string;

  recommendation:
    | "YES_WITHOUT_RESERVATION"
    | "YES_WITH_MINOR_RESERVATIONS"
    | "NO"
    | "";

  declaration: boolean;
  phone_number: string;
};

const initialAnswers: ReferenceFormAnswers = {
  relationship: "",
  relationship_other: "",
  duration_known: "",
  observed_capacity: "",

  reliability: "",
  patience_empathy: "",
  communication: "",
  honesty_integrity: "",
  professionalism: "",

  strengths: "",

  safeguarding_concern: "",
  misconduct_history: "",
  safeguarding_details: "",

  recommendation: "",

  declaration: false,
  phone_number: "",
};

const relationshipOptions = [
  "Former or current employer / line manager",
  "Colleague or fellow educator",
  "School administrator / principal",
  "Academic supervisor / lecturer",
  "Community or religious leader",
  "Character reference",
  "Other",
];

const durationOptions = [
  "Less than 1 year",
  "1 – 3 years",
  "3 – 5 years",
  "More than 5 years",
];

const ratingOptions = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "UNABLE_TO_JUDGE",
] as const;

const ratingLabels: Record<Rating, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  UNABLE_TO_JUDGE: "Unable to judge",
};

const ratingQuestions: {
  key: keyof Pick<
    ReferenceFormAnswers,
    | "reliability"
    | "patience_empathy"
    | "communication"
    | "honesty_integrity"
    | "professionalism"
  >;
  label: string;
}[] = [
  {
    key: "reliability",
    label: "Reliability & Punctuality",
  },
  {
    key: "patience_empathy",
    label: "Patience & Empathy with Learners",
  },
  {
    key: "communication",
    label: "Communication Skills",
  },
  {
    key: "honesty_integrity",
    label: "Honesty & Integrity",
  },
  {
    key: "professionalism",
    label: "Professionalism & Accountability",
  },
];

const recommendationOptions = [
  {
    value: "YES_WITHOUT_RESERVATION",
    label: "Yes, without reservation",
  },
  {
    value: "YES_WITH_MINOR_RESERVATIONS",
    label: "Yes, with minor reservations",
  },
  {
    value: "NO",
    label: "No, I would not recommend them",
  },
];

function FormSection({
  number,
  title,
  description,
  icon,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00AFA0]/10 text-[#008F84]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#00AFA0]">
            Part {number}
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#102A56]">{title}</h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Question({
  number,
  title,
  description,
  children,
}: {
  number?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold leading-6 text-[#102A56]">
        {number && <span className="mr-1">{number}.</span>}
        {title}
      </legend>

      {description && (
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      )}

      {children}
    </fieldset>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  required = false,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option, index) => {
        const id = `${name}-${index}`;

        return (
          <label
            key={option}
            htmlFor={id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all ${
              value === option
                ? "border-[#00AFA0] bg-[#00AFA0]/5 text-[#102A56]"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#00AFA0]/50"
            }`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              required={required && index === 0}
              className="h-4 w-4 shrink-0 accent-[#00AFA0]"
            />

            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function RefereeConsentPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [page, setPage] = useState<ConsentPage | null>(null);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<ReferenceFormAnswers>(initialAnswers);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    api<ConsentPage>(
      `/verification/referee/${encodeURIComponent(token)}`,
      {},
      { auth: false },
    )
      .then((result) => {
        if (!active) return;

        setPage(result);
        setName(result.referee_name);
        setSubmitted(result.status === "CONSENTED");
      })
      .catch((error) => {
        if (!active) return;

        toast.error(
          error instanceof Error
            ? error.message
            : "This invitation is unavailable.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function updateAnswer<K extends keyof ReferenceFormAnswers>(
    key: K,
    value: ReferenceFormAnswers[K],
  ) {
    setAnswers((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  const showSafeguardingDetails =
    answers.safeguarding_concern === "YES" ||
    answers.misconduct_history === "YES" ||
    answers.recommendation === "YES_WITH_MINOR_RESERVATIONS" ||
    answers.recommendation === "NO";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!answers.declaration) {
      toast.error("Please accept the declaration before submitting.");
      return;
    }

    setBusy(true);

    try {
      const result = await api<ConsentPage>(
        `/verification/referee/${encodeURIComponent(token)}/consent`,
        {
          method: "POST",
          body: JSON.stringify({
            consented_name: name.trim(),
            consent: true,
            reference_form: {
              ...answers,
              relationship_other:
                answers.relationship === "Other"
                  ? answers.relationship_other.trim()
                  : null,
              observed_capacity: answers.observed_capacity.trim() || null,
              strengths: answers.strengths.trim() || null,
              safeguarding_details: answers.safeguarding_details.trim() || null,
              phone_number: answers.phone_number.trim(),
            },
          }),
        },
        { auth: false },
      );

      setPage(result);
      setSubmitted(true);

      toast.success("Your reference has been submitted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your reference.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F8FB] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        {/* Tutova branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt="Tutova"
            width={180}
            height={60}
            priority
            className="h-14 w-auto object-contain"
          />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Tutor Reference Check
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Online Referee Verification & Safeguarding Form
          </p>
        </div>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <div className="h-1.5 bg-[#00AFA0]" />

          <CardHeader className="border-b border-slate-100 bg-white px-5 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#102A56]/5 text-[#102A56]">
                <ClipboardCheck size={22} />
              </div>

              <div>
                <CardTitle className="text-xl font-bold text-[#102A56]">
                  Tutova Tutor Reference Check
                </CardTitle>

                <p className="mt-1 text-xs text-slate-500">
                  Confidential safeguarding document
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 py-7 sm:px-8 sm:py-9">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#00AFA0]" />
                Loading secure invitation…
              </div>
            ) : !page ? (
              <div className="py-12 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-slate-400" />

                <h1 className="mt-4 text-lg font-bold text-[#102A56]">
                  Invitation unavailable
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  This invitation is invalid or has expired. Please contact the
                  tutor who nominated you.
                </p>
              </div>
            ) : submitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-[#00AFA0]" />

                <h1 className="mt-5 text-xl font-bold text-[#102A56]">
                  Reference submitted
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                  Thank you for completing the reference check for{" "}
                  <strong>{page.tutor_name}</strong>. Your response has been
                  recorded for Tutova&apos;s verification and safeguarding
                  review.
                </p>

                <p className="mt-5 text-xs text-slate-400">
                  You can safely close this page.
                </p>
              </div>
            ) : page.status !== "PENDING" ? (
              <div className="py-12 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-slate-400" />

                <h1 className="mt-4 text-lg font-bold text-[#102A56]">
                  Invitation no longer active
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This invitation is no longer awaiting a response. Please
                  contact the tutor who nominated you if you need assistance.
                </p>
              </div>
            ) : (
              <>
                {/* Introduction */}
                <div className="mb-8 rounded-xl border border-[#00AFA0]/15 bg-[#00AFA0]/5 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#008F84]" />

                    <p className="text-sm leading-6 text-slate-600">
                      Thank you for taking a few moments to help us. At Tutova,
                      child safety and educational excellence come first. Your
                      honest feedback helps ensure every learner is supported by
                      trustworthy mentors. All responses are kept strictly
                      confidential.
                    </p>
                  </div>
                </div>

                {/* Applicant and referee details */}
                <div className="mb-9 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Applicant name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#102A56]">
                      {page.tutor_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Referee name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#102A56]">
                      {page.referee_name}
                    </p>
                  </div>
                </div>

                <form onSubmit={submit} className="space-y-10">
                  {/* Part 1 */}
                  <FormSection
                    number="1"
                    title="Your Relationship with the Applicant"
                    icon={<UserRound size={20} />}
                  >
                    <Question number="1" title="How do you know the applicant?">
                      <RadioGroup
                        name="relationship"
                        options={relationshipOptions}
                        value={answers.relationship}
                        onChange={(value) =>
                          updateAnswer("relationship", value)
                        }
                        required
                      />

                      {answers.relationship === "Other" && (
                        <div className="pt-2">
                          <Input
                            value={answers.relationship_other}
                            onChange={(event) =>
                              updateAnswer(
                                "relationship_other",
                                event.target.value,
                              )
                            }
                            placeholder="Please specify your relationship"
                            maxLength={160}
                          />
                        </div>
                      )}
                    </Question>

                    <Question number="2" title="How long have you known them?">
                      <RadioGroup
                        name="duration_known"
                        options={durationOptions}
                        value={answers.duration_known}
                        onChange={(value) =>
                          updateAnswer("duration_known", value)
                        }
                        required
                      />
                    </Question>

                    <Question
                      number="3"
                      title="In what capacity have you observed their work or character?"
                      description="Optional"
                    >
                      <textarea
                        value={answers.observed_capacity}
                        onChange={(event) =>
                          updateAnswer("observed_capacity", event.target.value)
                        }
                        rows={3}
                        maxLength={2000}
                        placeholder='E.g. "I supervised them for two years while they taught secondary school mathematics."'
                        className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm leading-6 text-[#102A56] outline-none transition-all placeholder:text-slate-400 focus:border-[#0077E6] focus:ring-2 focus:ring-[#0077E6]/15"
                      />
                    </Question>
                  </FormSection>

                  <div className="border-t border-slate-100" />

                  {/* Part 2 */}
                  <FormSection
                    number="2"
                    title="Character & Professional Assessment"
                    description="Please select the rating that best describes the applicant for each area."
                    icon={<BriefcaseBusiness size={20} />}
                  >
                    {ratingQuestions.map((question, index) => (
                      <Question
                        key={question.key}
                        number={String(index + 1)}
                        title={question.label}
                      >
                        <RadioGroup
                          name={question.key}
                          options={ratingOptions}
                          value={answers[question.key]}
                          onChange={(value) =>
                            updateAnswer(question.key, value as Rating)
                          }
                          required
                        />
                      </Question>
                    ))}

                    <Question
                      number="4"
                      title="What are their greatest strengths as an educator, mentor, or professional?"
                      description="Optional"
                    >
                      <textarea
                        value={answers.strengths}
                        onChange={(event) =>
                          updateAnswer("strengths", event.target.value)
                        }
                        rows={4}
                        maxLength={3000}
                        placeholder="Describe the applicant's strengths..."
                        className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm leading-6 text-[#102A56] outline-none transition-all placeholder:text-slate-400 focus:border-[#0077E6] focus:ring-2 focus:ring-[#0077E6]/15"
                      />
                    </Question>
                  </FormSection>

                  <div className="border-t border-slate-100" />

                  {/* Part 3 */}
                  <FormSection
                    number="3"
                    title="Safeguarding & Child Protection"
                    description="Because Tutova serves children and young learners, we take safety seriously."
                    icon={<ShieldAlert size={20} />}
                  >
                    <Question
                      number="5"
                      title="Do you have any reason to doubt the applicant's suitability to work closely with children or young people?"
                    >
                      <RadioGroup
                        name="safeguarding_concern"
                        options={["NO", "YES"]}
                        value={answers.safeguarding_concern}
                        onChange={(value) =>
                          updateAnswer(
                            "safeguarding_concern",
                            value as "NO" | "YES",
                          )
                        }
                        required
                      />

                      <p className="text-xs text-slate-500">
                        {answers.safeguarding_concern === "NO"
                          ? "You have indicated that you have no concerns."
                          : answers.safeguarding_concern === "YES"
                            ? "Please provide relevant details in the confidential section below."
                            : "Select the option that best reflects your knowledge."}
                      </p>
                    </Question>

                    <Question
                      number="6"
                      title="To your knowledge, has the applicant ever been the subject of any disciplinary action, investigation, or complaint regarding misconduct or child safety?"
                    >
                      <RadioGroup
                        name="misconduct_history"
                        options={["NO", "YES", "NOT_APPLICABLE"]}
                        value={answers.misconduct_history}
                        onChange={(value) =>
                          updateAnswer(
                            "misconduct_history",
                            value as "NO" | "YES" | "NOT_APPLICABLE",
                          )
                        }
                        required
                      />

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>No</span>
                        <span>Yes</span>
                        <span>
                          Not applicable / I do not have workplace knowledge of
                          this
                        </span>
                      </div>
                    </Question>

                    {showSafeguardingDetails && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="mb-3 flex items-start gap-2">
                          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                          <div>
                            <h3 className="text-sm font-bold text-amber-900">
                              Confidential safeguarding details
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-amber-800">
                              If you answered Yes to either safeguarding
                              question, selected a recommendation with
                              reservations, or do not recommend the applicant,
                              please share any relevant details for
                              Tutova&apos;s Safeguarding Team.
                            </p>
                          </div>
                        </div>

                        <textarea
                          value={answers.safeguarding_details}
                          onChange={(event) =>
                            updateAnswer(
                              "safeguarding_details",
                              event.target.value,
                            )
                          }
                          rows={5}
                          maxLength={5000}
                          placeholder="Provide confidential details for the Tutova Safeguarding Team..."
                          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm leading-6 text-[#102A56] outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                        />
                      </div>
                    )}
                  </FormSection>

                  <div className="border-t border-slate-100" />

                  {/* Part 4 */}
                  <FormSection
                    number="4"
                    title="Final Recommendation & Declaration"
                    icon={<HeartHandshake size={20} />}
                  >
                    <Question
                      number="8"
                      title="Would you recommend this applicant to tutor learners on Tutova?"
                    >
                      <RadioGroup
                        name="recommendation"
                        options={recommendationOptions.map(
                          (option) => option.value,
                        )}
                        value={answers.recommendation}
                        onChange={(value) =>
                          updateAnswer(
                            "recommendation",
                            value as ReferenceFormAnswers["recommendation"],
                          )
                        }
                        required
                      />

                      <div className="space-y-2 text-xs text-slate-500">
                        {recommendationOptions.map((option) => (
                          <p key={option.value}>
                            <span className="font-semibold text-[#102A56]">
                              {option.value === "YES_WITHOUT_RESERVATION"
                                ? "Yes, without reservation:"
                                : option.value === "YES_WITH_MINOR_RESERVATIONS"
                                  ? "Yes, with minor reservations:"
                                  : "No:"}
                            </span>{" "}
                            {option.value === "YES_WITHOUT_RESERVATION"
                              ? "You recommend the applicant without reservations."
                              : option.value === "YES_WITH_MINOR_RESERVATIONS"
                                ? "You recommend the applicant but have some reservations."
                                : "You do not recommend the applicant."}
                          </p>
                        ))}
                      </div>
                    </Question>

                    <Question number="9" title="Declaration">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 transition-colors hover:border-[#00AFA0]/50">
                        <input
                          type="checkbox"
                          checked={answers.declaration}
                          onChange={(event) =>
                            updateAnswer("declaration", event.target.checked)
                          }
                          required
                          className="mt-1 h-4 w-4 shrink-0 accent-[#00AFA0]"
                        />

                        <span>
                          I confirm that the information provided above is
                          accurate and honest to the best of my knowledge, and I
                          consent to Tutova contacting me if clarification is
                          required.
                        </span>
                      </label>
                    </Question>

                    <Question
                      title="Phone Number"
                      description="For verification purposes only. Required."
                    >
                      <Input
                        type="tel"
                        required
                        value={answers.phone_number}
                        onChange={(event) =>
                          updateAnswer("phone_number", event.target.value)
                        }
                        placeholder="+234 800 000 0000"
                        maxLength={30}
                        autoComplete="tel"
                      />
                    </Question>
                  </FormSection>

                  {/* Referee identity confirmation */}
                  <div className="border-t border-slate-100 pt-7">
                    <label
                      htmlFor="referee-name"
                      className="mb-2 block text-sm font-semibold text-[#102A56]"
                    >
                      Your full name
                    </label>

                    <Input
                      id="referee-name"
                      required
                      minLength={2}
                      maxLength={160}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Invitation sent to: {page.referee_email}
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="space-y-4 border-t border-slate-100 pt-7">
                    <Button
                      type="submit"
                      disabled={busy}
                      className="h-12 w-full bg-[#102A56] text-white hover:bg-[#0B2044]"
                    >
                      {busy ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                      )}

                      {busy ? "Submitting reference…" : "Submit Reference"}
                    </Button>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      This secure link expires{" "}
                      {new Date(page.token_expires_at).toLocaleString()}.
                    </p>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      Tutova Learning Community · Confidential Safeguarding
                      Document
                    </p>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          If you did not expect this request, you may ignore this email.
        </p>
      </div>
    </main>
  );
}
