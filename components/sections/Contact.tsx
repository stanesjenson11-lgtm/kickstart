"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { contact, form, site } from "@/lib/content";
import { briefSchema } from "@/lib/brief-schema";
import MagneticButton from "@/components/ui/MagneticButton";
import Plate from "@/components/ui/Plate";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Chips are real checkboxes and radios with the input visually hidden, so
 * keyboard navigation, grouping and screen-reader announcement come for free.
 * A <select> in this palette is the one element that would look like a template.
 */
function Chip({
  name,
  value,
  type,
}: {
  name: string;
  value: string;
  type: "checkbox" | "radio";
}) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} className="peer sr-only" />
      <span className="block border border-paper/15 px-3.5 py-2.5 u-meta text-muted-dark transition-colors duration-300 hover:border-paper/50 hover:text-paper peer-checked:border-paper peer-checked:bg-paper peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper">
        {value}
      </span>
    </label>
  );
}

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
    "w-full border border-paper/15 bg-paper/[0.04] px-4 py-4 text-body text-paper placeholder:text-muted-dark/70 transition-colors duration-300 focus:border-paper focus:bg-paper/[0.07] focus:outline-none aria-invalid:border-paper";

  return (
    <p className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={4}
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
      needs: fd.getAll("needs").map(String),
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

    setStatus("sending");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
      setFormError(
        "That did not send. Try again, or email us directly and we will pick it up.",
      );
    }
  }

  return (
    <section id="contact" className="grain relative bg-ink">
      {/* Stock plate behind the glass. Flat scrim, then edge fades only — a
          single top-to-bottom gradient buries the plate where the card sits. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Plate
          src={contact.bg}
          alt=""
          reveal={false}
          sizes="100vw"
          className="h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink),transparent_18%,transparent_82%,var(--color-ink))]" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl px-gutter py-section-lg">
        <h2 className="u-display text-center text-h1" style={{ ["--wdth" as string]: 104 }}>
          {contact.headline}
        </h2>
        <p className="mx-auto mt-6 text-center text-body text-muted-dark">{contact.body}</p>

        <div className="relative mt-12 border border-paper/20 bg-ink/50 p-6 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-8">
          {/* Registration marks — the card is a plate on the production floor. */}
          <PlusIcon aria-hidden="true" className="absolute -top-3 -left-3 h-6 w-6" />
          <PlusIcon aria-hidden="true" className="absolute -top-3 -right-3 h-6 w-6" />
          <PlusIcon aria-hidden="true" className="absolute -bottom-3 -left-3 h-6 w-6" />
          <PlusIcon aria-hidden="true" className="absolute -right-3 -bottom-3 h-6 w-6" />

          {status === "sent" ? (
            <div role="status" className="py-6 text-center">
              <h3 className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
                Brief received.
              </h3>
              <p className="mt-5 text-body text-muted-dark">
                We read every one properly. Expect a considered reply within two working
                days — not a calendar link.
              </p>
              <p className="mt-8 u-meta text-muted-dark">
                Something urgent?{" "}
                <a href={`https://wa.me/${site.whatsapp}`} className="cut-link text-paper">
                  WhatsApp us
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <Field
                label="Your name"
                name="name"
                placeholder="Your name"
                required
                autoComplete="name"
                error={errors.name}
              />
              <Field
                label="Company"
                name="company"
                placeholder="Company (optional)"
                autoComplete="organization"
              />
              <Field
                label="Your email"
                name="email"
                type="email"
                placeholder="Your email"
                required
                autoComplete="email"
                error={errors.email}
              />
              <Field
                label="Phone or WhatsApp"
                name="phone"
                type="tel"
                placeholder="Phone / WhatsApp (optional)"
                autoComplete="tel"
              />

              <fieldset>
                <legend className="u-meta text-muted-dark">What do you need?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.needs.map((n) => (
                    <Chip key={n} name="needs" value={n} type="checkbox" />
                  ))}
                </div>
                {errors.needs && <p className="mt-3 u-meta text-paper">{errors.needs}</p>}
              </fieldset>

              <Field
                label="Project details"
                name="details"
                textarea
                placeholder="What are we making, and where does it need to run?"
                required
                error={errors.details}
              />

              <fieldset>
                <legend className="u-meta text-muted-dark">Timeline</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.timelines.map((t) => (
                    <Chip key={t} name="timeline" value={t} type="radio" />
                  ))}
                </div>
                {errors.timeline && <p className="mt-3 u-meta text-paper">{errors.timeline}</p>}
              </fieldset>

              {/* Honeypot — off-screen, not display:none, and never announced. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-px w-px"
              />

              {formError && (
                <p role="alert" className="u-meta text-paper">
                  {formError}
                </p>
              )}

              <div className="mt-2">
                <MagneticButton type="submit" fullWidth disabled={status === "sending"}>
                  {status === "sending" ? "Sending" : form.submit}
                </MagneticButton>
              </div>
            </form>
          )}
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 u-meta text-muted-dark">
          <li>
            <a href={`mailto:${site.email}`} className="cut-link tracking-[0.06em]">
              {site.email}
            </a>
          </li>
          <li>
            <a href={`https://wa.me/${site.whatsapp}`} className="cut-link">
              WhatsApp
            </a>
          </li>
          <li>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="cut-link">
              {site.phone}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
