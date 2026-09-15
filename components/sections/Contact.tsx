"use client";

import { useRef, useState } from "react";
import Script from "next/script";
import { PlusIcon } from "lucide-react";
import { contact, form, site } from "@/lib/content";
import { briefSchema, keepAllowed, LIMITS, TIMELINES, type LimitedField } from "@/lib/brief-schema";
import MagneticButton from "@/components/ui/MagneticButton";
import Plate from "@/components/ui/Plate";

type Status = "idle" | "sending" | "sent" | "error";
type Issue = { path: readonly PropertyKey[]; message: string };

const CARD =
  "rounded-xl border border-paper/20 bg-ink/50 p-6 shadow-2xl shadow-black/70 sm:p-8 backdrop-blur-xl";

const CHECK_FIELDS = "Some details need a look before this can send.";
const PHONE_INVALID = "Enter a valid phone number with its country code, like +91 98765 43210.";
const NETWORK_FAILED = "That did not send. Try again, or email us directly and we will pick it up.";
/** What a refused send says, by status. Anything else reads as a network problem. */
const SEND_FAILED: Record<number, string> = {
  403: "We couldn't confirm this came from a real browser. Please try again.",
  413: "That brief is too long to send. Please shorten the project details.",
  429: "Too many attempts in a row. Wait a minute, then try again.",
};

/**
 * Label is visually hidden and the placeholder carries it, so the card stays as
 * dense as the reference without leaving the field unnamed to a screen reader.
 */
function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
  autoComplete,
  textarea,
  options,
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  /** Renders a select of these values, with the placeholder as its empty choice. */
  options?: readonly string[];
  error?: string;
}) {
  const id = `f-${name}`;
  const cls =
    "w-full rounded-md border border-paper/15 bg-paper/[0.04] px-3.5 py-2.5 text-sm text-paper placeholder:text-muted-dark/70 transition-colors duration-300 focus:border-paper focus:bg-paper/[0.07] focus:outline-none aria-invalid:border-paper";
  const aria = {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-err` : undefined,
  };
  const limited = name in LIMITS ? (name as LimitedField) : null;
  // maxLength stops typing and pasting at the field's cap.
  const limit = { maxLength: limited ? LIMITS[limited].max : undefined, onInput };

  /** Drops characters the field doesn't allow as they are typed or pasted, and
      keeps the caret where it was. Skipped mid-composition, so IME keyboards
      can finish a character before it is judged. */
  function onInput(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (!limited || (e.nativeEvent as InputEvent).isComposing) return;
    const kept = keepAllowed(limited, el.value);
    if (kept === el.value) return;
    const caret = Math.max(0, (el.selectionStart ?? el.value.length) - (el.value.length - kept.length));
    el.value = kept;
    try {
      el.setSelectionRange(caret, caret);
    } catch {
      // Email inputs expose no selection; the caret just lands at the end.
    }
  }

  // No reserved label height: fields stack in one column on a phone, and every
  // label fits on one line in the two-column card, so there is nothing to align.
  return (
    <p className="flex flex-col gap-1">
      <label htmlFor={id} className="u-meta leading-[1.4] text-muted-dark">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          required={required}
          placeholder={placeholder}
          {...aria}
          {...limit}
          className={`${cls} resize-y`}
        />
      ) : options ? (
        <select
          id={id}
          name={name}
          required={required}
          defaultValue=""
          {...aria}
          className={`${cls} invalid:text-muted-dark/70`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...aria}
          {...limit}
          className={cls}
        />
      )}
      {error && (
        <span id={`${id}-err`} className="u-meta text-paper">
          {error}
        </span>
      )}
    </p>
  );
}

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  // A double click lands before React has re-rendered the button as disabled.
  const busy = useRef(false);

  function showErrors(issues: readonly Issue[]) {
    const next: Record<string, string> = {};
    for (const issue of issues) next[String(issue.path[0])] ??= issue.message;
    setErrors(next);
    setFormError(CHECK_FIELDS);
  }

  /** A field showing an error is re-checked as it changes, so fixing it clears
      that one message and leaves the others alone. */
  function onFieldChange(e: React.FormEvent<HTMLFormElement>) {
    const { name, value } = e.target as HTMLInputElement;
    if (!errors[name] || !(name in briefSchema.shape)) return;
    const result = briefSchema.shape[name as keyof typeof briefSchema.shape].safeParse(value);
    const next = { ...errors };
    if (result.success) delete next[name];
    else next[name] = result.error.issues[0].message;
    setErrors(next);
    if (!Object.keys(next).length) setFormError("");
  }

  async function send(formEl: HTMLFormElement) {
    setErrors({});
    setFormError("");

    const fd = new FormData(formEl);
    const parsed = briefSchema.safeParse({
      name: String(fd.get("name") ?? ""),
      company: String(fd.get("company") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      needs: String(fd.get("needs") ?? ""),
      details: String(fd.get("details") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      website: String(fd.get("website") ?? ""),
    });
    if (!parsed.success) return showErrors(parsed.error.issues);

    // Every country's numbering plan: fetched on the first submit, not with the page.
    const { formatPhone } = await import("@/lib/phone");
    if (!formatPhone(parsed.data.phone)) return showErrors([{ path: ["phone"], message: PHONE_INVALID }]);

    // Turnstile writes this hidden field once it has checked the browser.
    const token = site.turnstile ? String(fd.get("cf-turnstile-response") ?? "") : undefined;
    if (site.turnstile && !token) {
      setFormError("One moment — we are still checking this is a real browser. Try again.");
      return;
    }

    setStatus("sending");
    // Tokens are single-use, so any retry needs a fresh one.
    const resetCheck = () =>
      (window as Window & { turnstile?: { reset: () => void } }).turnstile?.reset();
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, token }),
      });
      if (res.ok) return setStatus("sent");

      resetCheck();
      setStatus("error");
      if (res.status === 422) {
        const data = (await res.json().catch(() => null)) as { issues?: Issue[] } | null;
        return data?.issues?.length ? showErrors(data.issues) : setFormError(CHECK_FIELDS);
      }
      setFormError(SEND_FAILED[res.status] ?? NETWORK_FAILED);
    } catch {
      resetCheck();
      setStatus("error");
      setFormError(NETWORK_FAILED);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    // currentTarget is gone once the handler awaits, so hand the form over now.
    const formEl = e.currentTarget;
    try {
      await send(formEl);
    } finally {
      busy.current = false;
    }
  }

  // min-h, not h: the card grows when validation errors appear, and the
  // section has to grow with it rather than clip.
  return (
    <section
      id="contact"
      data-frame
      className="grain relative flex min-h-[100svh] items-center bg-ink"
    >
      {/* Stock plate behind the glass. Flat scrim, then edge fades only — a
          single top-to-bottom gradient buries the plate where the card sits. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Plate
          src={contact.bg}
          alt=""
          reveal={false}
          sizes="100vw"
          className="h-full w-full opacity-70"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink),transparent_10%,transparent_90%,var(--color-ink))]" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl px-gutter py-14 sm:py-16">
        <h2 className="u-display text-center text-h2" style={{ ["--wdth" as string]: 104 }}>
          {contact.headline}
        </h2>

        <div className="relative mt-6">
          {/* Registration marks — the card is a plate on the production floor. */}
          <PlusIcon aria-hidden="true" className="absolute -top-2.5 -left-2.5 h-5 w-5" />
          <PlusIcon aria-hidden="true" className="absolute -top-2.5 -right-2.5 h-5 w-5" />
          <PlusIcon aria-hidden="true" className="absolute -bottom-2.5 -left-2.5 h-5 w-5" />
          <PlusIcon aria-hidden="true" className="absolute -right-2.5 -bottom-2.5 h-5 w-5" />

          {status === "sent" ? (
            <div
              role="status"
              className={`${CARD} py-6 text-center`}
            >
              <h3 className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
                Brief received.
              </h3>
              <p className="mt-4 text-base text-muted-dark">
                We read every one properly. Expect a considered reply within two working
                days.
              </p>
            </div>
          ) : (
            // method and action only matter with JavaScript off: the brief then
            // posts to the route, which validates it all the same, instead of
            // landing in the address bar as a query string.
            <form
              onSubmit={onSubmit}
              onChange={onFieldChange}
              method="post"
              action="/api/brief"
              noValidate
              className={CARD}
            >
              {/* Fields pair up two to a row so the card stays short; the
                  textarea and the button run the full width. */}
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  error={errors.name}
                />
                <Field
                  label="Company"
                  name="company"
                  placeholder="Where you work"
                  required
                  autoComplete="organization"
                  error={errors.company}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  error={errors.email}
                />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  required
                  autoComplete="tel"
                  error={errors.phone}
                />
                <Field
                  label="Requirements?"
                  name="needs"
                  placeholder="Brand film, event coverage, social…"
                  required
                  error={errors.needs}
                />
                <Field
                  label="Timeline"
                  name="timeline"
                  placeholder="Select a timeline"
                  options={TIMELINES}
                  required
                  error={errors.timeline}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Project details"
                    name="details"
                    textarea
                    placeholder="What are we making, and where does it need to run?"
                    required
                    error={errors.details}
                  />
                </div>
              </div>

              {/* Padding, not margin: the global `p { margin: 0 }` is unlayered
                  and outranks margin utilities. */}
              {formError && (
                <p role="alert" className="pt-3 u-meta text-paper">
                  {formError}
                </p>
              )}

              {/* Cloudflare Turnstile. `interaction-only` keeps it invisible
                  unless Cloudflare actually needs a click. Loaded after the
                  page so it costs nothing up front. */}
              {site.turnstile && (
                <>
                  <div
                    className="cf-turnstile"
                    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || site.turnstileSiteKey}
                    data-theme="dark"
                    data-size="flexible"
                    data-appearance="interaction-only"
                  />
                  <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="lazyOnload"
                  />
                </>
              )}

              <div className="mt-7">
                <MagneticButton
                  type="submit"
                  fullWidth
                  className="rounded-md px-5! py-4!"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending" : form.submit}
                </MagneticButton>
              </div>

              {/* Notice at the point of collection (DPDP). Padding for the gap,
                  as above; size, case and tracking carry `!` because .u-meta is
                  unlayered and outranks the utilities. */}
              <p className="pt-5 text-center u-meta normal-case! tracking-[0.04em]! text-[0.625rem]! max-phone:text-[0.6875rem]! text-muted-dark">
                We use these details only to reply to your brief. See our{" "}
                <a href="/privacy" className="text-paper underline! underline-offset-4">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Honeypot — off-screen, not display:none, and never announced. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-px w-px"
              />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
