"use client";

import { useState } from "react";
import { finalCta, form, site } from "@/lib/content";
import { briefSchema } from "@/lib/brief-schema";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

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
  defaultChecked,
}: {
  name: string;
  value: string;
  type: "checkbox" | "radio";
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="block border border-[var(--rule-on-dark)] px-4 py-3 u-meta text-muted-dark transition-colors duration-300 hover:border-paper/50 hover:text-paper peer-checked:border-paper peer-checked:bg-paper peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper">
        {value}
      </span>
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  textarea,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  error?: string;
}) {
  const id = `f-${name}`;
  const cls =
    "w-full border-0 border-b border-[var(--rule-on-dark)] bg-transparent py-4 text-body text-paper placeholder:text-muted-dark/60 focus:border-paper focus:outline-none transition-colors duration-300";

  return (
    <p className="flex flex-col gap-2">
      <label htmlFor={id} className="u-meta text-muted-dark">
        {label}
        {!required && <span className="ml-2 normal-case tracking-normal opacity-60">optional</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={required}
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

  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".cta-line"), {
      yPercent: 110,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 70%" },
    });
  }, []);

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
      budget: (String(fd.get("budget") ?? "") || undefined) as string | undefined,
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
    <section ref={scope} id="contact" className="grain relative bg-ink">
      {/* Final CTA */}
      <div className="px-gutter pt-section-lg pb-section">
        <h2 className="u-display text-display max-w-[14ch]">
          {finalCta.headline.split(" ").reduce<string[][]>((rows, word, i) => {
            const r = Math.floor(i / 2);
            (rows[r] ??= []).push(word);
            return rows;
          }, []).map((row, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <span className="cta-line block">{row.join(" ")}</span>
            </span>
          ))}
        </h2>
        <p className="u-measure mt-8 text-body text-muted-dark">{finalCta.support}</p>
      </div>

      {/* Brief */}
      <div className="border-t border-[var(--rule-on-dark)] px-gutter py-section">
        {status === "sent" ? (
          <div role="status" className="max-w-[52ch]">
            <h3 className="u-display text-h2" style={{ ["--wdth" as string]: 100 }}>
              Brief received.
            </h3>
            <p className="mt-6 text-body text-muted-dark">
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
          <form onSubmit={onSubmit} noValidate className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div className="md:col-span-5">
              <h3 className="u-display text-h2" style={{ ["--wdth" as string]: 100 }}>
                Send a project brief.
              </h3>
              <p className="u-measure mt-5 text-body text-muted-dark">
                The more you tell us here, the more useful the first reply is.
              </p>
              <ul className="mt-10 flex flex-col gap-3 u-meta text-muted-dark">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="cut-link tracking-[0.06em] break-words"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${site.whatsapp}`} className="cut-link">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-10 md:col-span-7">
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Name" name="name" required autoComplete="name" error={errors.name} />
                <Field label="Company" name="company" autoComplete="organization" />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  error={errors.email}
                />
                <Field label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" />
              </div>

              <fieldset>
                <legend className="u-meta text-muted-dark">What do you need?</legend>
                <div className="mt-4 flex flex-wrap gap-2">
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
                required
                error={errors.details}
              />

              <fieldset>
                <legend className="u-meta text-muted-dark">Timeline</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {form.timelines.map((t) => (
                    <Chip key={t} name="timeline" value={t} type="radio" />
                  ))}
                </div>
                {errors.timeline && <p className="mt-3 u-meta text-paper">{errors.timeline}</p>}
              </fieldset>

              <fieldset>
                <legend className="u-meta text-muted-dark">
                  Approximate budget
                  <span className="ml-2 normal-case tracking-normal opacity-60">optional</span>
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {form.budgets.map((b) => (
                    <Chip key={b} name="budget" value={b} type="radio" />
                  ))}
                </div>
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

              <div>
                <MagneticButton type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending" : form.submit}
                </MagneticButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
