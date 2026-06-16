import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const sections: { h: string; body: string[] }[] = [
  {
    h: "Who we are",
    body: [
      "Luxury Dental Turkey provides paid consultations to discuss dental treatment options, online by video or face to face in Bournemouth, United Kingdom. For any privacy question you can reach us at info@luxurydentalturkey.com.",
    ],
  },
  {
    h: "What we collect",
    body: [
      "When you book a consultation we collect your name, email address, phone number, country, the appointment details you choose, and any notes you add. Payments are handled by our payment provider (Stripe); we never see or store your full card details.",
    ],
  },
  {
    h: "Why we use it",
    body: [
      "We use your information only to arrange and manage your consultation, to send you confirmations, updates and reminders, and to answer any message you send us. We do not sell your data and we do not use it for unrelated marketing without your consent.",
    ],
  },
  {
    h: "Who we share it with",
    body: [
      "We share the minimum necessary with trusted service providers that help us run the booking: Stripe (to take your payment) and Brevo (to deliver our emails). They act on our instructions and are not allowed to use your data for their own purposes.",
    ],
  },
  {
    h: "How long we keep it",
    body: [
      "We keep your booking information only for as long as needed to provide your consultation and to meet our legal and accounting obligations, after which it is deleted.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "You can ask us to show you the data we hold about you, to correct it, or to delete it. To exercise any of these rights, email info@luxurydentalturkey.com and we will respond promptly.",
    ],
  },
  {
    h: "Cookies",
    body: [
      "Our site uses only the essential cookies needed for it to work. We do not use advertising trackers.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-20">
      <h1 className="font-heading text-4xl font-extrabold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: 16 June 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-heading text-xl font-bold text-ink">{s.h}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-2 text-[15px] leading-relaxed text-zinc-600">{p}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
