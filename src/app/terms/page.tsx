import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

const sections: { h: string; body: string[] }[] = [
  {
    h: "What we provide",
    body: [
      "Luxury Dental Turkey offers paid consultations to discuss your dental treatment options, either online by video call or face to face in Bournemouth, United Kingdom. A consultation is advisory. No dental treatment is carried out at the consultation.",
    ],
  },
  {
    h: "Booking and payment",
    body: [
      "Your consultation fee is paid at the time of booking through our secure payment provider. The price and length of each consultation type are shown on the booking page before you pay.",
      "If you decide to go ahead with treatment, the consultation fee is fully deducted from your treatment total.",
    ],
  },
  {
    h: "Online consultations",
    body: [
      "Online consultations take place by WhatsApp video call at the scheduled UK time. Please make sure you are reachable on the phone number you provided at your appointment time.",
    ],
  },
  {
    h: "Face to face consultations",
    body: [
      "The full address for a face to face consultation is sent to you once your booking is confirmed. Please arrive on time. If you are running late, contact us as soon as possible.",
    ],
  },
  {
    h: "Rescheduling and cancellations",
    body: [
      "If you need to change or cancel your appointment, please contact us as early as you can so we can offer the slot to someone else and arrange a new time for you.",
    ],
  },
  {
    h: "Our responsibility",
    body: [
      "A consultation gives you information and guidance to help you make a decision. It is not a substitute for in person clinical examination, diagnosis or emergency care. If you have a dental emergency, please contact a local dentist or emergency service.",
    ],
  },
  {
    h: "Governing law",
    body: [
      "These terms are governed by the law of England and Wales.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-20">
      <h1 className="font-heading text-4xl font-extrabold text-ink">Terms</h1>
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
