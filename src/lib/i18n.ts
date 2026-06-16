// Shared (client + server) i18n dictionaries. No next/headers here so it can be
// imported from client components. Server reads the locale via lib/locale.ts.

export type Locale = "en" | "fr" | "es";
export const LOCALES: Locale[] = ["en", "fr", "es"];
export const LOCALE_LABELS: Record<Locale, string> = { en: "EN", fr: "FR", es: "ES" };

export interface Step {
  title: string;
  text: string;
}

export interface Dict {
  nav: { home: string; book: string; how: string; reviews: string; contact: string; bookNow: string };
  footer: {
    tagline: string;
    explore: string;
    consultations: string;
    bournemouth: string;
    onlineWorldwide: string;
    getInTouch: string;
    securePayments: string;
    rights: string;
    privacy: string;
    terms: string;
  };
  home: {
    rating: string;
    headline: string;
    sub: string;
    cta: string;
    howLink: string;
    faceBournemouth: string;
    onlineWorldwide: string;
  };
  how: {
    kicker: string;
    title: string;
    sub: string;
    feeNotePre: string;
    feeNoteBold: string;
    feeNotePost: string;
    steps: Step[];
    cta: string;
    ctaNote: string;
  };
  reviews: { kicker: string; title: string; sub: string; items: { name: string; place: string; text: string }[] };
  contact: {
    kicker: string;
    title: string;
    sub: string;
    email: string;
    emailSub: string;
    call: string;
    callSub: string;
    whatsapp: string;
    whatsappSub: string;
  };
  book: {
    steps: [string, string, string, string];
    chooseTitle: string;
    chooseSub: string;
    feePre: string;
    feeBold: string;
    feePost: string;
    minutes: string;
    types: { "face-to-face": { label: string; blurb: string }; online: { label: string; blurb: string } };
    pickTitle: string;
    availOnline: string;
    availF2f: string;
    selectDay: string;
    tzOnlinePre: string;
    tzOnlinePost: string;
    tzF2f: string;
    noTimes: string;
    booked: string;
    ukShort: string;
    detailsTitle: string;
    detailsSub: string;
    fullName: string;
    emailLabel: string;
    phoneLabel: string;
    countryLabel: string;
    notesLabel: string;
    phHint: string;
    phName: string;
    phEmail: string;
    phCountry: string;
    phPhone: string;
    phNotes: string;
    consentPre: string;
    consentMid: string;
    consentEnd: string;
    emailInvalid: string;
    reviewTitle: string;
    reviewSub: string;
    rConsultation: string;
    rDate: string;
    rTime: string;
    rName: string;
    rEmail: string;
    rPhone: string;
    rCountry: string;
    rNotes: string;
    rTotal: string;
    reviewFeeNote: string;
    minShort: string;
    ukParen: string;
    yourTime: string;
    back: string;
    continueBtn: string;
    toPayment: string;
    redirecting: string;
    pageKicker: string;
    pageTitle: string;
    pageSub: string;
  };
}

const en: Dict = {
  nav: { home: "Home", book: "Book Consultation", how: "How It Works", reviews: "Reviews", contact: "Contact", bookNow: "Book Now" },
  footer: {
    tagline: "Your new smile starts with one consultation.",
    explore: "Explore",
    consultations: "Consultations",
    bournemouth: "Bournemouth, United Kingdom",
    onlineWorldwide: "Online worldwide",
    getInTouch: "Get in touch",
    securePayments: "Secure payments",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms",
  },
  home: {
    rating: "Rated 4.9/5 by 2,700+ patients",
    headline: "Your new life is one consultation away.",
    sub: "Book a face-to-face or online video consultation with our specialists. Simple, secure, and tailored to you, wherever you are in the world.",
    cta: "Get Started Now",
    howLink: "How it works",
    faceBournemouth: "Face-to-face in Bournemouth",
    onlineWorldwide: "Online worldwide",
  },
  how: {
    kicker: "How it works",
    title: "From consultation to new smile",
    sub: "A simple, guided journey. We handle the details so you can focus on your new smile.",
    feeNotePre: "Good to know: the fee you pay for your consultation is fully ",
    feeNoteBold: "deducted from your total treatment price",
    feeNotePost: " if you decide to go ahead.",
    steps: [
      { title: "Book your consultation", text: "Choose a face-to-face or online video consultation and speak with one of our professionals." },
      { title: "Get your offer within 48 hours", text: "After your consultation, we come back to you within 48 hours with a personalised treatment offer and quote." },
      { title: "We arrange your trip", text: "If you decide to go ahead, your coordinator checks your availability and books your flights. You travel to Turkey, looked after every step of the way." },
      { title: "Fly home with a new smile", text: "Your treatment is completed during your stay and you return home, usually about a week later, with a brand-new smile." },
    ],
    cta: "Book your consultation",
    ctaNote: "Your consultation fee comes off your treatment total if you proceed.",
  },
  reviews: {
    kicker: "Reviews",
    title: "Loved by patients across the UK",
    sub: "Real stories from people who started their journey with us.",
    items: [
      { name: "Sarah Thompson", place: "Manchester, UK", text: "From the very first consultation I felt completely looked after. Everything was explained clearly, there was no pressure at all, and my veneers look incredible. Honestly worth every penny." },
      { name: "James Carter", place: "London, UK", text: "I was nervous about going abroad for dental work but they made the whole thing so easy. Flights and hotel were sorted for me and the clinic was spotless. My implants are perfect." },
      { name: "Liam B.", place: "Birmingham, UK", text: "Honestly everything was top notch mate, couldn't ask for anything better. The lads sorted me flights an all, came home buzzing with a proper smile. Cheers guys, made my year." },
      { name: "Emma Wilkinson", place: "Leeds, UK", text: "Booked an online consultation on a Thursday evening and had my full quote within two days. Flew out the following month and I could not be happier with how I was treated." },
      { name: "Charlotte Evans", place: "Bristol, UK", text: "The consultation fee coming off my final treatment price was a lovely surprise. Professional, warm and the results genuinely speak for themselves. I keep recommending them to friends." },
      { name: "David Reynolds", place: "Glasgow, UK", text: "A first-class experience from start to finish. Travelled to Turkey, treatment was done within the week, and I came home with a smile I am really proud of. Thank you to the whole team." },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Get in touch",
    sub: "Have a question before booking? Reach us any way you like.",
    email: "Email",
    emailSub: "We usually reply within a few hours",
    call: "Call us",
    callSub: "Landline, UK office hours",
    whatsapp: "WhatsApp",
    whatsappSub: "Chat with us directly",
  },
  book: {
    steps: ["Type", "Date & Time", "Your details", "Review"],
    chooseTitle: "Choose your consultation",
    chooseSub: "Select the option that suits you best.",
    feePre: "Your consultation fee is fully ",
    feeBold: "deducted from your treatment total",
    feePost: " if you decide to go ahead.",
    minutes: "minutes",
    types: {
      "face-to-face": { label: "Face-to-Face Consultation", blurb: "Meet our specialist in person in Bournemouth for a thorough assessment." },
      online: { label: "Online Video Consultation", blurb: "Speak with our specialist by video, from anywhere in the world." },
    },
    pickTitle: "Pick a date & time",
    availOnline: "Online consultations are available most days.",
    availF2f: "Face-to-face consultations are on Thursdays & Fridays.",
    selectDay: "Select an available day to see times.",
    tzOnlinePre: "Times shown in your timezone ",
    tzOnlinePost: ".",
    tzF2f: "Times are in UK time. Your appointment takes place in Bournemouth.",
    noTimes: "No times available on this day.",
    booked: "Booked",
    ukShort: "UK",
    detailsTitle: "Your details",
    detailsSub: "We'll use these to confirm your appointment.",
    fullName: "Full name",
    emailLabel: "Email",
    phoneLabel: "Phone number",
    countryLabel: "Country",
    notesLabel: "Notes (optional)",
    phHint: "UK numbers: type without the leading 0 (e.g. 7700 900123).",
    phName: "Jane Doe",
    phEmail: "jane@email.com",
    phCountry: "Start typing...",
    phPhone: "Enter phone number",
    phNotes: "Anything we should know?",
    consentPre: "I agree to the ",
    consentMid: " and ",
    consentEnd: ".",
    emailInvalid: "Please enter a valid email address.",
    reviewTitle: "Review & confirm",
    reviewSub: "Please check everything is correct before paying.",
    rConsultation: "Consultation",
    rDate: "Date",
    rTime: "Time",
    rName: "Name",
    rEmail: "Email",
    rPhone: "Phone",
    rCountry: "Country",
    rNotes: "Notes",
    rTotal: "Total to pay",
    reviewFeeNote: "This fee is deducted from your treatment total if you proceed.",
    minShort: "min",
    ukParen: "(UK)",
    yourTime: "(your time)",
    back: "Back",
    continueBtn: "Continue",
    toPayment: "Continue to Payment",
    redirecting: "Redirecting…",
    pageKicker: "Book a consultation",
    pageTitle: "Reserve your appointment",
    pageSub: "A few quick steps and you're done.",
  },
};

const fr: Dict = {
  nav: { home: "Accueil", book: "Réserver une consultation", how: "Comment ça marche", reviews: "Avis", contact: "Contact", bookNow: "Réserver" },
  footer: {
    tagline: "Votre nouveau sourire commence par une consultation.",
    explore: "Explorer",
    consultations: "Consultations",
    bournemouth: "Bournemouth, Royaume-Uni",
    onlineWorldwide: "En ligne, partout dans le monde",
    getInTouch: "Nous contacter",
    securePayments: "Paiements sécurisés",
    rights: "Tous droits réservés.",
    privacy: "Politique de confidentialité",
    terms: "Conditions",
  },
  home: {
    rating: "Note de 4,9/5 par plus de 2 700 patients",
    headline: "Votre nouvelle vie est à une consultation près.",
    sub: "Réservez une consultation en personne ou en vidéo avec nos spécialistes. Simple, sécurisé et adapté à vous, où que vous soyez dans le monde.",
    cta: "Commencer maintenant",
    howLink: "Comment ça marche",
    faceBournemouth: "En personne à Bournemouth",
    onlineWorldwide: "En ligne, partout dans le monde",
  },
  how: {
    kicker: "Comment ça marche",
    title: "De la consultation à votre nouveau sourire",
    sub: "Un parcours simple et accompagné. Nous gérons les détails pour que vous puissiez vous concentrer sur votre nouveau sourire.",
    feeNotePre: "Bon à savoir : les frais de votre consultation sont entièrement ",
    feeNoteBold: "déduits du prix total de votre traitement",
    feeNotePost: " si vous décidez de poursuivre.",
    steps: [
      { title: "Réservez votre consultation", text: "Choisissez une consultation en personne ou en vidéo et échangez avec l'un de nos professionnels." },
      { title: "Recevez votre offre sous 48 heures", text: "Après votre consultation, nous revenons vers vous sous 48 heures avec une offre de traitement personnalisée et un devis." },
      { title: "Nous organisons votre voyage", text: "Si vous décidez de poursuivre, votre coordinateur vérifie vos disponibilités et réserve vos vols. Vous voyagez en Turquie, accompagné à chaque étape." },
      { title: "Rentrez avec un nouveau sourire", text: "Votre traitement est réalisé pendant votre séjour et vous rentrez chez vous, généralement une semaine plus tard, avec un sourire tout neuf." },
    ],
    cta: "Réserver votre consultation",
    ctaNote: "Les frais de consultation sont déduits du total de votre traitement si vous poursuivez.",
  },
  reviews: {
    kicker: "Avis",
    title: "La confiance de nos patients",
    sub: "Des histoires vraies de personnes qui ont commencé leur parcours avec nous.",
    items: [
      { name: "Camille Laurent", place: "Toulouse, France", text: "Dès la première consultation, tout était clair et sans pression. Mes facettes sont magnifiques et l'équipe a été aux petits soins du début à la fin." },
      { name: "Julien Moreau", place: "Lyon, France", text: "J'appréhendais de me faire soigner à l'étranger, mais tout a été organisé pour moi, vols et hôtel compris. La clinique était impeccable et mes implants sont parfaits." },
      { name: "Hélène Garnier", place: "Bordeaux, France", text: "Le devis est arrivé en moins de deux jours après ma consultation en ligne. Accueil chaleureux, résultat superbe, je recommande les yeux fermés." },
      { name: "Marc Tremblay", place: "Montréal, Canada", text: "Service vraiment haut de gamme. Mon coordinateur a tout géré et je suis rentré à Montréal avec un sourire éclatant. Merci à toute l'équipe !" },
      { name: "Sophie Dubois", place: "Bruxelles, Belgique", text: "Que les frais de consultation soient déduits du traitement final a été une belle surprise. Professionnels et humains, le résultat parle de lui-même." },
      { name: "Luc Weber", place: "Luxembourg", text: "Une expérience de premier ordre du début à la fin. Tout s'est fait en une semaine et je suis revenu au Luxembourg ravi de mon nouveau sourire." },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Contactez-nous",
    sub: "Une question avant de réserver ? Joignez-nous comme vous le souhaitez.",
    email: "E-mail",
    emailSub: "Nous répondons généralement en quelques heures",
    call: "Appelez-nous",
    callSub: "Ligne fixe, horaires de bureau (R-U)",
    whatsapp: "WhatsApp",
    whatsappSub: "Discutez directement avec nous",
  },
  book: {
    steps: ["Type", "Date et heure", "Vos coordonnées", "Récapitulatif"],
    chooseTitle: "Choisissez votre consultation",
    chooseSub: "Sélectionnez l'option qui vous convient le mieux.",
    feePre: "Les frais de votre consultation sont entièrement ",
    feeBold: "déduits du total de votre traitement",
    feePost: " si vous décidez de poursuivre.",
    minutes: "minutes",
    types: {
      "face-to-face": { label: "Consultation en personne", blurb: "Rencontrez notre spécialiste en personne à Bournemouth pour un bilan complet." },
      online: { label: "Consultation vidéo en ligne", blurb: "Échangez avec notre spécialiste par vidéo, où que vous soyez dans le monde." },
    },
    pickTitle: "Choisissez une date et une heure",
    availOnline: "Les consultations en ligne sont disponibles presque tous les jours.",
    availF2f: "Les consultations en personne ont lieu les jeudis et vendredis.",
    selectDay: "Sélectionnez un jour disponible pour voir les horaires.",
    tzOnlinePre: "Horaires affichés dans votre fuseau horaire ",
    tzOnlinePost: ".",
    tzF2f: "Les horaires sont en heure britannique. Votre rendez-vous a lieu à Bournemouth.",
    noTimes: "Aucun horaire disponible ce jour-là.",
    booked: "Réservé",
    ukShort: "UK",
    detailsTitle: "Vos coordonnées",
    detailsSub: "Nous les utiliserons pour confirmer votre rendez-vous.",
    fullName: "Nom complet",
    emailLabel: "E-mail",
    phoneLabel: "Numéro de téléphone",
    countryLabel: "Pays",
    notesLabel: "Remarques (facultatif)",
    phHint: "Numéros britanniques : tapez sans le 0 initial (ex. 7700 900123).",
    phName: "Jean Dupont",
    phEmail: "jean@email.com",
    phCountry: "Commencez à taper...",
    phPhone: "Saisissez le numéro",
    phNotes: "Quelque chose à nous signaler ?",
    consentPre: "J'accepte la ",
    consentMid: " et les ",
    consentEnd: ".",
    emailInvalid: "Veuillez saisir une adresse e-mail valide.",
    reviewTitle: "Récapitulatif et confirmation",
    reviewSub: "Vérifiez que tout est correct avant de payer.",
    rConsultation: "Consultation",
    rDate: "Date",
    rTime: "Heure",
    rName: "Nom",
    rEmail: "E-mail",
    rPhone: "Téléphone",
    rCountry: "Pays",
    rNotes: "Remarques",
    rTotal: "Total à payer",
    reviewFeeNote: "Ces frais sont déduits du total de votre traitement si vous poursuivez.",
    minShort: "min",
    ukParen: "(UK)",
    yourTime: "(votre heure)",
    back: "Retour",
    continueBtn: "Continuer",
    toPayment: "Continuer vers le paiement",
    redirecting: "Redirection…",
    pageKicker: "Réserver une consultation",
    pageTitle: "Réservez votre rendez-vous",
    pageSub: "Quelques étapes rapides et c'est fait.",
  },
};

const es: Dict = {
  nav: { home: "Inicio", book: "Reservar consulta", how: "Cómo funciona", reviews: "Opiniones", contact: "Contacto", bookNow: "Reservar" },
  footer: {
    tagline: "Tu nueva sonrisa empieza con una consulta.",
    explore: "Explorar",
    consultations: "Consultas",
    bournemouth: "Bournemouth, Reino Unido",
    onlineWorldwide: "En línea en todo el mundo",
    getInTouch: "Contáctanos",
    securePayments: "Pagos seguros",
    rights: "Todos los derechos reservados.",
    privacy: "Política de privacidad",
    terms: "Términos",
  },
  home: {
    rating: "Valorado 4,9/5 por más de 2.700 pacientes",
    headline: "Tu nueva vida está a una consulta de distancia.",
    sub: "Reserva una consulta presencial o por videollamada con nuestros especialistas. Sencillo, seguro y adaptado a ti, estés donde estés.",
    cta: "Empezar ahora",
    howLink: "Cómo funciona",
    faceBournemouth: "Presencial en Bournemouth",
    onlineWorldwide: "En línea en todo el mundo",
  },
  how: {
    kicker: "Cómo funciona",
    title: "De la consulta a tu nueva sonrisa",
    sub: "Un recorrido sencillo y acompañado. Nos ocupamos de los detalles para que tú solo pienses en tu nueva sonrisa.",
    feeNotePre: "Bueno saberlo: el importe de tu consulta se ",
    feeNoteBold: "descuenta íntegramente del precio total de tu tratamiento",
    feeNotePost: " si decides seguir adelante.",
    steps: [
      { title: "Reserva tu consulta", text: "Elige una consulta presencial o por videollamada y habla con uno de nuestros profesionales." },
      { title: "Recibe tu oferta en 48 horas", text: "Tras tu consulta, te respondemos en un plazo de 48 horas con una oferta de tratamiento personalizada y un presupuesto." },
      { title: "Organizamos tu viaje", text: "Si decides seguir adelante, tu coordinador comprueba tu disponibilidad y reserva tus vuelos. Viajas a Turquía, acompañado en cada paso." },
      { title: "Vuelve a casa con una nueva sonrisa", text: "Tu tratamiento se completa durante tu estancia y vuelves a casa, normalmente una semana después, con una sonrisa totalmente nueva." },
    ],
    cta: "Reserva tu consulta",
    ctaNote: "El importe de tu consulta se descuenta del total de tu tratamiento si continúas.",
  },
  reviews: {
    kicker: "Opiniones",
    title: "La confianza de nuestros pacientes",
    sub: "Historias reales de personas que comenzaron su recorrido con nosotros.",
    items: [
      { name: "Lucía Fernández", place: "Zaragoza, España", text: "Desde la primera consulta todo fue claro y sin presión. Mis carillas quedaron preciosas y el equipo me cuidó en cada momento." },
      { name: "Javier Ruiz", place: "Bilbao, España", text: "Me daba respeto operarme fuera, pero me lo organizaron todo, vuelos y hotel incluidos. La clínica impecable y mis implantes perfectos." },
      { name: "Carmen Ortega", place: "Valladolid, España", text: "Tras la consulta online tuve el presupuesto en dos días. Trato cercano y un resultado espectacular. Lo recomiendo sin dudar." },
      { name: "Pablo Serrano", place: "Murcia, España", text: "Una atención de primera. Mi coordinador se encargó de todo y volví a casa con una sonrisa increíble. ¡Gracias al equipo!" },
      { name: "Valentina Rojas", place: "Buenos Aires, Argentina", text: "Que el importe de la consulta se descontara del tratamiento final fue una grata sorpresa. Profesionales y muy cercanos." },
      { name: "Marta Gil", place: "A Coruña, España", text: "Una experiencia excelente de principio a fin. Todo se hizo en una semana y volví a casa orgullosa de mi nueva sonrisa." },
    ],
  },
  contact: {
    kicker: "Contacto",
    title: "Contáctanos",
    sub: "¿Tienes alguna duda antes de reservar? Escríbenos como prefieras.",
    email: "Correo",
    emailSub: "Normalmente respondemos en unas horas",
    call: "Llámanos",
    callSub: "Fijo, horario de oficina (R. Unido)",
    whatsapp: "WhatsApp",
    whatsappSub: "Chatea con nosotros directamente",
  },
  book: {
    steps: ["Tipo", "Fecha y hora", "Tus datos", "Resumen"],
    chooseTitle: "Elige tu consulta",
    chooseSub: "Selecciona la opción que mejor te convenga.",
    feePre: "El importe de tu consulta se ",
    feeBold: "descuenta íntegramente del total de tu tratamiento",
    feePost: " si decides seguir adelante.",
    minutes: "minutos",
    types: {
      "face-to-face": { label: "Consulta presencial", blurb: "Conoce a nuestro especialista en persona en Bournemouth para una evaluación completa." },
      online: { label: "Consulta por videollamada", blurb: "Habla con nuestro especialista por vídeo, estés donde estés." },
    },
    pickTitle: "Elige una fecha y hora",
    availOnline: "Las consultas en línea están disponibles casi todos los días.",
    availF2f: "Las consultas presenciales son los jueves y viernes.",
    selectDay: "Selecciona un día disponible para ver los horarios.",
    tzOnlinePre: "Horarios mostrados en tu zona horaria ",
    tzOnlinePost: ".",
    tzF2f: "Los horarios están en hora del Reino Unido. Tu cita es en Bournemouth.",
    noTimes: "No hay horarios disponibles ese día.",
    booked: "Reservado",
    ukShort: "UK",
    detailsTitle: "Tus datos",
    detailsSub: "Los usaremos para confirmar tu cita.",
    fullName: "Nombre completo",
    emailLabel: "Correo electrónico",
    phoneLabel: "Número de teléfono",
    countryLabel: "País",
    notesLabel: "Notas (opcional)",
    phHint: "Números del Reino Unido: escribe sin el 0 inicial (p. ej. 7700 900123).",
    phName: "Juan Pérez",
    phEmail: "juan@email.com",
    phCountry: "Empieza a escribir...",
    phPhone: "Introduce el número",
    phNotes: "¿Algo que debamos saber?",
    consentPre: "Acepto la ",
    consentMid: " y los ",
    consentEnd: ".",
    emailInvalid: "Introduce una dirección de correo válida.",
    reviewTitle: "Resumen y confirmación",
    reviewSub: "Comprueba que todo es correcto antes de pagar.",
    rConsultation: "Consulta",
    rDate: "Fecha",
    rTime: "Hora",
    rName: "Nombre",
    rEmail: "Correo",
    rPhone: "Teléfono",
    rCountry: "País",
    rNotes: "Notas",
    rTotal: "Total a pagar",
    reviewFeeNote: "Este importe se descuenta del total de tu tratamiento si continúas.",
    minShort: "min",
    ukParen: "(UK)",
    yourTime: "(tu hora)",
    back: "Atrás",
    continueBtn: "Continuar",
    toPayment: "Continuar al pago",
    redirecting: "Redirigiendo…",
    pageKicker: "Reservar una consulta",
    pageTitle: "Reserva tu cita",
    pageSub: "Unos pasos rápidos y listo.",
  },
};

const DICTS: Record<Locale, Dict> = { en, fr, es };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? en;
}
