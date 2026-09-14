import type { Metadata } from "next";
import Image from "next/image";
import { footer, site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Privacy Policy | ${site.name}`,
  description: `How ${site.legalName} collects, uses, shares and protects personal data, and how to exercise your rights.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "14 September 2026";
const PHONE = `+${site.whatsapp.slice(0, 2)} ${site.whatsapp.slice(2, 7)} ${site.whatsapp.slice(7)}`;
const EMAIL = <a href={`mailto:${site.email}`} className="text-paper underline! underline-offset-4">{site.email}</a>;

/** Numbered block. Spacing is grid gap throughout: globals.css zeroes every
    <p> margin with an unlayered rule, which outranks margin utilities. */
function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-[var(--rule-on-dark)] pt-8">
      <h2 className="flex items-baseline gap-4">
        <span className="u-meta text-muted-dark">{n}</span>
        <span className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
          {title}
        </span>
      </h2>
      <div className="grid gap-4 text-muted-dark">{children}</div>
    </section>
  );
}

const List = ({ children }: { children: React.ReactNode }) => (
  <ul className="grid list-disc gap-2 pl-5 marker:text-muted-dark">{children}</ul>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <span className="text-paper">{children}</span>
);

/**
 * Written for India's Digital Personal Data Protection Act, 2023 and its 2025
 * Rules, and for the privacy-policy requirement in the IT (Reasonable Security
 * Practices) Rules, 2011: an itemised list of what is collected and why, who
 * processes it, retention, rights, and a named grievance officer.
 */
export default function PrivacyPage() {
  return (
    <>
      <header className="px-gutter pt-8">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full
            load on purpose: the home page's pinned scroll scenes measure on load. */}
        <a href="/" aria-label={`${site.name} — home`} className="inline-block">
          <Image
            src="/logo-white.png"
            alt=""
            width={1000}
            height={182}
            sizes="180px"
            loading="eager"
            className="h-auto w-[clamp(7rem,12vw,11rem)]"
          />
        </a>
      </header>

      <main id="main" className="px-gutter py-section">
        <article className="mx-auto grid max-w-3xl gap-10">
          <div className="grid gap-4">
            <h1 className="u-display text-h1" style={{ ["--wdth" as string]: 104 }}>
              Privacy Policy
            </h1>
            <p className="u-meta text-muted-dark">Last updated {UPDATED}</p>
            <p className="text-muted-dark">
              This policy explains what personal data <Em>{site.legalName}</Em> (&ldquo;Kickstart&rdquo;,
              &ldquo;we&rdquo;) collects through {site.url.replace("https://", "")}, why we collect it, who
              handles it, how long we keep it, and the rights you have under India&rsquo;s Digital Personal
              Data Protection Act, 2023 and the Information Technology Act, 2000.
            </p>
          </div>

          <Section n="01" title="Who we are">
            <p>
              {site.legalName}, Tirunelveli, Tamil Nadu, India. You can reach us at {EMAIL} or on{" "}
              <Em>{PHONE}</Em>.
            </p>
          </Section>

          <Section n="02" title="What we collect">
            <List>
              <li>
                <Em>When you send a brief through our contact form:</Em> your name and email address and,
                if you choose to give them, your company and phone or WhatsApp number, along with what you
                need, your timeline and your project details.
              </li>
              <li>
                <Em>When you email, call or WhatsApp us:</Em> your contact details and whatever you share in
                the conversation.
              </li>
              <li>
                <Em>When you visit the site:</Em> technical data needed to deliver the site and keep it
                secure, such as your IP address, browser and device details, and request logs. This is
                handled by our hosting provider, Cloudflare.
              </li>
            </List>
            <p>
              We don&rsquo;t ask for sensitive information such as financial, health or government ID
              details. Please don&rsquo;t include it in a brief.
            </p>
          </Section>

          <Section n="03" title="Why we use it">
            <List>
              <li>To read and reply to your enquiry, prepare a quote and, if you hire us, deliver the project.</li>
              <li>To send you an email confirming we received your brief.</li>
              <li>To keep the site secure and block spam and automated abuse of the contact form.</li>
            </List>
            <p>
              You give us these details voluntarily so that we can respond to you, and we use them only for
              that. We don&rsquo;t sell your data, use it for advertising, or add you to a mailing list.
            </p>
          </Section>

          <Section n="04" title="Who handles it">
            <p>We share your data only with the service providers that run the site and the contact form:</p>
            <List>
              <li>
                <Em>Cloudflare</Em> — hosting, delivery and security, including Cloudflare Turnstile, the
                bot check on our contact form. Turnstile checks signals such as your IP address, browser
                user agent and connection fingerprint, and may use a strictly necessary cookie, to tell
                people from bots.
              </li>
              <li>
                <Em>Resend</Em> — sends the emails the contact form produces, to us and to you.
              </li>
              <li>
                <Em>Our email provider</Em> — stores your enquiry and our replies in our business inbox.
              </li>
              <li>
                <Em>WhatsApp</Em> — only if you choose to message us there, under WhatsApp&rsquo;s own
                privacy policy.
              </li>
            </List>
            <p>
              These providers may process data outside India, including in the United States, as Indian law
              permits. We will otherwise disclose personal data only when the law requires it.
            </p>
          </Section>

          <Section n="05" title="Cookies">
            <p>
              We don&rsquo;t use analytics, advertising or tracking cookies, and the site sets no cookies of
              its own. Cloudflare Turnstile may set a cookie that is strictly necessary to protect the
              contact form, which is why there is no cookie banner. If we ever add analytics, we will update
              this policy and ask for your consent first where the law requires it.
            </p>
          </Section>

          <Section n="06" title="How long we keep it">
            <List>
              <li>
                <Em>Enquiries that don&rsquo;t become a project:</Em> up to one year after our last
                conversation, then deleted.
              </li>
              <li>
                <Em>If you become a client:</Em> for the length of the project, and business records such as
                quotes, contracts and invoices for up to eight years, as Indian company and tax law require.
              </li>
              <li>
                <Em>Technical and security logs:</Em> kept by Cloudflare under its own retention policies.
              </li>
            </List>
            <p>We will delete your data sooner if you ask, unless the law requires us to keep it.</p>
          </Section>

          <Section n="07" title="How we protect it">
            <p>
              The site is served only over encrypted HTTPS, the contact form is protected against bots and
              abuse, and access to enquiries is limited to our team. No system is perfectly secure, but if a
              breach ever affects your data we will tell you and the authorities as the law requires.
            </p>
          </Section>

          <Section n="08" title="Your rights">
            <p>You can ask us to:</p>
            <List>
              <li>tell you what personal data we hold about you and who we have shared it with;</li>
              <li>correct, complete or update it;</li>
              <li>erase it;</li>
              <li>withdraw any consent you have given, as easily as you gave it;</li>
              <li>let someone you nominate exercise these rights for you if you die or are unable to.</li>
            </List>
            <p>
              Email {EMAIL} with your request. We will reply within 30 days. If you are not satisfied with
              how we handle a complaint, you can complain to the Data Protection Board of India.
            </p>
          </Section>

          <Section n="09" title="Children">
            <p>
              Our services are for businesses, and this site is not meant for anyone under 18. We don&rsquo;t
              knowingly collect children&rsquo;s data; if we learn that we have, we will delete it.
            </p>
          </Section>

          <Section n="10" title="Grievance officer">
            <address className="grid gap-1 not-italic">
              <Em>Jerry Joshan</Em>
              <span>Founder, {site.legalName}</span>
              <span>Tirunelveli, Tamil Nadu, India</span>
              <span>Email: {EMAIL}</span>
              <span>Phone / WhatsApp: {PHONE}</span>
            </address>
          </Section>

          <Section n="11" title="Changes to this policy">
            <p>
              When we change this policy we will update this page and the date at the top. If a change
              affects how we use data you have already given us, we will tell you.
            </p>
          </Section>
        </article>
      </main>

      <footer className="border-t border-[var(--rule-on-dark)] px-gutter py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-baseline justify-between gap-3">
          <p className="u-meta text-muted-dark">{footer.copyright}</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load, as above. */}
          <a href="/" className="cut-link u-meta">
            Back to site
          </a>
        </div>
      </footer>
    </>
  );
}
