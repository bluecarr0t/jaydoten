export const navLinks = [
  { href: "#exhibition", label: "Exhibition" },
  { href: "#collection", label: "Collection" },
  { href: "#studio", label: "Studio" },
  { href: "#visit", label: "Visit" },
] as const;

export const featuredExhibition = {
  number: "2026.01",
  title: "Thresholds of Light",
  dates: "March 14 — June 28, 2026",
  location: "Main Gallery",
  description:
    "An inquiry into luminosity, surface, and the slow choreography of perception. Works on paper, moving image, and spatial installation converge in a single durational field.",
};

export const collectionWorks = [
  {
    id: "I",
    title: "Afterimage (No. 7)",
    medium: "Pigment and resin on linen",
    year: "2025",
    dimensions: "72 × 96 in.",
    tone: "from-[#c8c2b4] via-[#9a9488] to-[#6e6860]",
  },
  {
    id: "II",
    title: "Study for a Horizon",
    medium: "Charcoal, gesso, graphite",
    year: "2024",
    dimensions: "48 × 60 in.",
    tone: "from-[#e8e4dc] via-[#b8b2a6] to-[#8a8478]",
  },
  {
    id: "III",
    title: "Field Recording III",
    medium: "Two-channel video, sound",
    year: "2025",
    duration: "18 min loop",
    tone: "from-[#2a2a2a] via-[#4a4844] to-[#7a7570]",
  },
  {
    id: "IV",
    title: "Assembly (Fragments)",
    medium: "Steel, plaster, found textile",
    year: "2023",
    dimensions: "Variable",
    tone: "from-[#d0ccc4] via-[#a09890] to-[#706a62]",
  },
  {
    id: "V",
    title: "Negative Space Suite",
    medium: "Archival inkjet, museum board",
    year: "2024",
    dimensions: "24 × 36 in. each",
    tone: "from-[#f0ece4] via-[#d8d2c8] to-[#b0aaa0]",
  },
  {
    id: "VI",
    title: "Resonance Chamber",
    medium: "Installation, ambient light",
    year: "2026",
    dimensions: "Site-specific",
    tone: "from-[#1a1a1a] via-[#3d3a36] to-[#6b6560]",
  },
] as const;

export const studioStatement = [
  "Jaydoten is a contemporary art and creative studio devoted to material inquiry, image-making, and collaborative spatial practice. Founded as an independent atelier, the studio operates at the intersection of exhibition, commission, and research.",
  "Work emerges through extended processes of drawing, casting, recording, and assembly. Each project is treated as a provisional architecture—open to revision, dialogue, and the contingencies of site.",
  "The studio maintains an active program of exhibitions, residencies, and cross-disciplinary partnerships with architects, musicians, and cultural institutions.",
];

export const visitInfo = {
  address: ["Jaydoten Studio", "124 Mercer Street, 4th Floor", "New York, NY 10012"],
  hours: [
    { day: "Tuesday — Friday", time: "11:00 — 18:00" },
    { day: "Saturday", time: "12:00 — 17:00" },
    { day: "Sunday — Monday", time: "By appointment" },
  ],
  contact: {
    email: "studio@jaydoten.com",
    press: "press@jaydoten.com",
  },
};
