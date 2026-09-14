"use client";

import { useState } from "react";
import Script from "next/script";
import { PlusIcon } from "lucide-react";
import { contact, form, site } from "@/lib/content";
import { briefSchema } from "@/lib/brief-schema";
import MagneticButton from "@/components/ui/MagneticButton";
import Plate from "@/components/ui/Plate";

type Status = "idle" | "sending" | "sent" | "error";

const CARD =
  "rounded-xl border border-paper/20 bg-ink/50 p-6 shadow-2xl shadow-black/70 sm:p-8 backdrop-blur-xl";

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
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  error?: string;
}) {
  const id = `f-${name}`;
  const cls =
    "w-full rounded-md border border-paper/15 bg-paper/[0.04] px-3.5 py-2.5 text-sm text-paper placeholder:text-muted-dark/70 transition-colors duration-300 focus:border-paper focus:bg-paper/[0.07] focus:outline-none aria-invalid:border-paper";

  return (
    <p className="flex flex-col gap-1.5">
      {/* Two lines reserved, with the line-height pinned so the arithmetic is
          local rather than inherited. A label that wraps would otherwise push
          its own input below its neighbour's and the row would read as a
          diagonal. At phone width every one of these wraps, so the reserved
          space is space that gets used. */}
      <label
        htmlFor={id}
        className="u-meta min-h-[2.8em] leading-[1.4] text-muted-dark"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          required={required}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      company: String(fd.get("company") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      needs: String(fd.get("needs") ?? ""),
      details: String(fd.get("details") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    const parsed = briefSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      setFormError("Some details need a look before this can send.");
      return;
    }

    // Turnstile writes this hidden field once it has checked the browser.
    const token = String(fd.get("cf-turnstile-response") ?? "");
    if (!token) {
      setFormError("One moment — we are still checking this is a real browser. Try again.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, token }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
      // Tokens are single-use, so a retry needs a fresh one.
      (window as Window & { turnstile?: { reset: () => void } }).turnstile?.reset();
      setFormError(
        "That did not send. Try again, or email us directly and we will pick it up.",
      );
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
                days — not a calendar link.
              </p>
              <p className="mt-5 u-meta text-muted-dark">
                Something urgent?{" "}
                <a href={`https://wa.me/${site.whatsapp}`} className="cut-link text-paper">
                  WhatsApp us
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className={CARD}>
              {/* Fields pair up two to a row so the card stays short; the
                  textarea and the button run the full width. */}
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Field
                  label="Your name"
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
                  autoComplete="organization"
                />
                <Field
                  label="Your email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  error={errors.email}
                />
                <Field
                  label="Phone / WhatsApp"
                  name="phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  autoComplete="tel"
                />
                <Field
                  label="What do you need?"
                  name="needs"
                  placeholder="Brand film, event coverage, social…"
                  required
                  error={errors.needs}
                />
                <Field
                  label="Timeline"
                  name="timeline"
                  placeholder="ASAP, this month, still exploring…"
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

              {formError && (
                <p role="alert" className="mt-3 u-meta text-paper">
                  {formError}
                </p>
              )}

              {/* Cloudflare Turnstile. `interaction-only` keeps it invisible
                  unless Cloudflare actually needs a click. Loaded after the
                  page so it costs nothing up front. */}
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-theme="dark"
                data-size="flexible"
                data-appearance="interaction-only"
              />
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
              />

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

              {/* Notice at the point of collection (DPDP). normal-case and
                  tracking with `!`: .u-meta is unlayered and outranks utilities. */}
              <p className="mt-4 text-center u-meta normal-case! tracking-[0.04em]! text-muted-dark">
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
