// The app's hobby catalogue, as the app ships it.
//
// GENERATED from the mobile repo (aspect-niche-mobile, src/data/activities.ts
// and src/graph/iconKits.ts, commit e437868) — do not edit by hand. The map on
// the landing page draws exactly what the app holds: the same 47 hobbies, the
// same 11 clusters, the same Obsidian pictograms, and the cluster hues the
// app's Midnight theme draws them in. Re-export it when the catalogue changes.

export type Tags = {
  environment: "indoors" | "outdoors" | "both";
  social: "solo" | "social" | "either";
  difficulty: "beginner" | "intermediate" | "advanced";
  cost: "free" | "low" | "medium" | "high";
  timeCommitment: "quick" | "moderate" | "deep";
};

export type Hobby = {
  id: string;
  label: string;
  blurb: string;
  tip: string | null;
  tags: Tags;
};

export type Cluster = {
  id: string;
  label: string;
  hue: string;
  hobbyIds: string[];
};

/** A pictogram in the app's Obsidian kit: a path and its lit vertices, drawn
 *  in a box centred on 0,0 about 20 units across. */
export type Glyph = { d: string; dots: [number, number, number][] };

/** The app's short labels for the hobby card's facts (src/components/ui.tsx). */
export const TAG_LABELS = {
  environment: { indoors: "Indoors", outdoors: "Outdoors", both: "In or out" },
  timeCommitment: { quick: "Quick", moderate: "Regular", deep: "Deep dive" },
  difficulty: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
  social: { solo: "Solo", social: "Social", either: "Solo or social" },
  cost: {
    free: "Free",
    low: "Low cost",
    medium: "Some gear",
    high: "Investment",
  },
} as const;

export const KIT_STROKE = 1.35;

export const CLUSTERS: Cluster[] = [
  {
    id: "fitness",
    label: "Fitness",
    hue: "#E07CF6",
    hobbyIds: [
      "rock-climbing",
      "zumba",
      "cycling",
      "yoga",
      "running",
      "surfing",
      "skateboarding",
      "archery",
      "fencing",
      "parkour",
    ],
  },
  {
    id: "creative",
    label: "Creative",
    hue: "#8B7CF6",
    hobbyIds: [
      "photography",
      "drawing",
      "music",
      "pottery",
      "calligraphy",
      "bookbinding",
      "glassblowing",
      "leatherwork",
      "weaving",
      "blacksmithing",
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor",
    hue: "#7CCFF6",
    hobbyIds: [
      "hiking",
      "rock-climbing",
      "cycling",
      "kayaking",
      "foraging",
      "birdwatching",
      "geology",
      "mycology",
      "urban-exploration",
      "surfing",
    ],
  },
  {
    id: "tech",
    label: "Tech",
    hue: "#7CA6F6",
    hobbyIds: [
      "coding",
      "3d-printing",
      "electronics",
      "astronomy",
      "marine-biology",
    ],
  },
  {
    id: "social",
    label: "Social",
    hue: "#F67CDB",
    hobbyIds: [
      "board-games",
      "improv",
      "cooking-club",
      "zumba",
      "volunteering",
      "chess",
    ],
  },
  {
    id: "culinary",
    label: "Culinary",
    hue: "#F67C9E",
    hobbyIds: ["cooking", "baking", "coffee", "fermentation", "cooking-club"],
  },
  {
    id: "adventure",
    label: "Adventure",
    hue: "#F67C7D",
    hobbyIds: [
      "surfing",
      "skateboarding",
      "parkour",
      "archery",
      "fencing",
      "kayaking",
      "urban-exploration",
      "rock-climbing",
    ],
  },
  {
    id: "nature",
    label: "Nature",
    hue: "#7CEFF6",
    hobbyIds: [
      "birdwatching",
      "foraging",
      "geology",
      "mycology",
      "marine-biology",
      "astronomy",
      "hiking",
    ],
  },
  {
    id: "craft",
    label: "Craft",
    hue: "#BC7CF6",
    hobbyIds: [
      "pottery",
      "calligraphy",
      "bookbinding",
      "glassblowing",
      "leatherwork",
      "weaving",
      "blacksmithing",
      "drawing",
    ],
  },
  {
    id: "mind",
    label: "Mind",
    hue: "#7C85F6",
    hobbyIds: [
      "chess",
      "philosophy",
      "language-learning",
      "journaling",
      "meditation",
      "investing",
      "genealogy",
    ],
  },
  {
    id: "community",
    label: "Community",
    hue: "#F67CBE",
    hobbyIds: [
      "volunteering",
      "improv",
      "board-games",
      "cooking-club",
      "language-learning",
    ],
  },
];

export const HOBBIES: Hobby[] = [
  {
    id: "rock-climbing",
    label: "Rock Climbing",
    blurb:
      "A full-body workout combining strength, problem-solving, and community.",
    tip: "Most gyms offer a free intro class. Start with bouldering, which needs no ropes.",
    tags: {
      environment: "both",
      social: "social",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "zumba",
    label: "Zumba",
    blurb:
      "A high-energy dance workout that feels more like a party than exercise.",
    tip: "Wear comfortable shoes and follow the rhythm, not perfect technique.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "cycling",
    label: "Cycling",
    blurb: "A flexible hobby for fitness, commuting, and outdoor exploration.",
    tip: "Start with a short flat route and get comfortable with braking before hills.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "yoga",
    label: "Yoga",
    blurb: "Build flexibility, strength, and mindfulness through movement.",
    tip: "YouTube has hundreds of free beginner flows, 20 minutes is plenty.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "running",
    label: "Running",
    blurb: "A simple, accessible cardio workout you can do anywhere.",
    tip: "Start with a 20-min walk/run mix 3x a week.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "surfing",
    label: "Surfing",
    blurb: "Physical, meditative and completely addictive once it clicks.",
    tip: "Take a 2-hour lesson at a local surf school, soft-top boards are safest to start.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "skateboarding",
    label: "Skateboarding",
    blurb:
      "Street, park, or vert. Skating is creative self-expression on wheels.",
    tip: "Start on flat ground mastering your stance and pushing before attempting any tricks.",
    tags: {
      environment: "outdoors",
      social: "social",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "archery",
    label: "Archery",
    blurb:
      "Meditative focus meets physical skill, one of the oldest sports alive.",
    tip: "Most archery ranges rent equipment and offer beginner clinics for under $30.",
    tags: {
      environment: "both",
      social: "either",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "fencing",
    label: "Fencing",
    blurb: "Fast, tactical, and surprisingly fun. The chess of combat sports.",
    tip: "Most fencing clubs provide loaner gear for intro classes.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "parkour",
    label: "Parkour",
    blurb: "Move through your environment fluidly, jumps, vaults, climbs.",
    tip: "Learn basic safety rolls and precision jumps first, never skip fundamentals.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "photography",
    label: "Photography",
    blurb:
      "Capture the world around you, your phone camera is enough to start.",
    tip: "Start with the rule of thirds, instantly makes photos look intentional.",
    tags: {
      environment: "both",
      social: "solo",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "quick",
    },
  },
  {
    id: "drawing",
    label: "Drawing",
    blurb: "A meditative skill that changes how you see the world.",
    tip: "Draw objects around your home for 10 minutes a day.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "quick",
    },
  },
  {
    id: "music",
    label: "Music",
    blurb: "Learn an instrument, produce beats, or just explore sound.",
    tip: "Ukulele or keyboard are the most beginner-friendly first instruments.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "deep",
    },
  },
  {
    id: "pottery",
    label: "Pottery",
    blurb:
      "Get your hands in clay. Slow, tactile work that turns out to be surprisingly social.",
    tip: "Most studios offer a beginner's wheel class for under $50.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "calligraphy",
    label: "Calligraphy",
    blurb:
      "Turn writing into art. Slow, deliberate work that rewards patience.",
    tip: "Start with a brush pen, easier than a nib and more forgiving on paper.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "quick",
    },
  },
  {
    id: "bookbinding",
    label: "Bookbinding",
    blurb: "Craft books by hand, covers, signatures, and stitching.",
    tip: "A Coptic stitch journal is the perfect first project, exposed spine, no glue needed.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "glassblowing",
    label: "Glassblowing",
    blurb: "Shape molten glass into art, one of the most dramatic crafts.",
    tip: "Book a studio intro session, most places let you make a paperweight or ornament.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "advanced",
      cost: "high",
      timeCommitment: "moderate",
    },
  },
  {
    id: "leatherwork",
    label: "Leatherwork",
    blurb: "Cut, stamp, and stitch leather into bags, wallets, and belts.",
    tip: "A leather card wallet is a great first project, small, useful, and forgiving.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "weaving",
    label: "Weaving",
    blurb: "Make cloth on a loom. Rhythmic, tactile, and quietly absorbing.",
    tip: "A small frame loom lets you weave wall art without a full floor loom.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "deep",
    },
  },
  {
    id: "blacksmithing",
    label: "Blacksmithing",
    blurb: "Shape metal with heat and hammer, ancient craft, timeless skill.",
    tip: "Find a local smithing guild or maker space with open forge nights.",
    tags: {
      environment: "both",
      social: "social",
      difficulty: "advanced",
      cost: "high",
      timeCommitment: "deep",
    },
  },
  {
    id: "hiking",
    label: "Hiking",
    blurb: "Explore trails at your own pace, from easy walks to serious treks.",
    tip: "AllTrails shows rated trails near you with photos and reviews.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "kayaking",
    label: "Kayaking",
    blurb: "Explore waterways at your own pace, rivers, lakes, coastlines.",
    tip: "Rent before you buy, most outfitters offer half-day rentals.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "foraging",
    label: "Foraging",
    blurb: "Find edible plants, mushrooms, and berries in the wild.",
    tip: "Go with an experienced forager the first time, never eat anything unidentified.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "birdwatching",
    label: "Birdwatching",
    blurb:
      "Discover the surprisingly rich world of birds in your backyard and beyond.",
    tip: "Merlin Bird ID app is free and instantly identifies birds by sound or photo.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "quick",
    },
  },
  {
    id: "geology",
    label: "Geology",
    blurb: "Read the Earth's history in rocks, minerals, and formations.",
    tip: "Get a field guide for your region and start at road cuts or riverbeds.",
    tags: {
      environment: "outdoors",
      social: "solo",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "mycology",
    label: "Mycology",
    blurb:
      "The hunt for fungi, foraging, identifying, and marveling at mushrooms.",
    tip: "iNaturalist and a regional mushroom guide are your two essential tools.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "intermediate",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "urban-exploration",
    label: "Urban Exploration",
    blurb: "Document abandoned and hidden spaces, history through decay.",
    tip: "Start with legal locations like rooftop bars or open industrial heritage sites.",
    tags: {
      environment: "outdoors",
      social: "social",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "coding",
    label: "Coding",
    blurb: "Build things with software, from simple scripts to full apps.",
    tip: "Start with Python or JavaScript, both have massive free learning resources.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "deep",
    },
  },
  {
    id: "3d-printing",
    label: "3D Printing",
    blurb: "Design and print physical objects from your imagination.",
    tip: "Thingiverse has thousands of free models to print before you start designing.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "electronics",
    label: "Electronics",
    blurb: "Build circuits, tinker with Arduinos, and make things that blink.",
    tip: "An Arduino starter kit is the best $30 you can spend to get hooked.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "astronomy",
    label: "Astronomy",
    blurb: "Explore galaxies, nebulae, and planets from your backyard.",
    tip: "Stellarium is a free app that shows exactly what's in the sky tonight.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "marine-biology",
    label: "Marine Biology",
    blurb:
      "Discover the ocean's biodiversity through snorkeling, diving, or study.",
    tip: "iNaturalist's ocean projects let you contribute real observations to science.",
    tags: {
      environment: "outdoors",
      social: "either",
      difficulty: "intermediate",
      cost: "medium",
      timeCommitment: "deep",
    },
  },
  {
    id: "board-games",
    label: "Board Games",
    blurb:
      "Strategy, storytelling, and laughter. Games for every kind of group.",
    tip: "Ticket to Ride and Catan are perfect gateway games for new players.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "moderate",
    },
  },
  {
    id: "improv",
    label: "Improv",
    blurb: "Say yes and figure it out, comedy and confidence building in one.",
    tip: "Most improv theaters offer drop-in beginner workshops for under $20.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "volunteering",
    label: "Volunteering",
    blurb: "Give time to causes you care about and build real community.",
    tip: "VolunteerMatch and Idealist list hundreds of local opportunities near you.",
    tags: {
      environment: "both",
      social: "social",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "chess",
    label: "Chess",
    blurb: "Infinite depth in a 64-square world, the ultimate strategy game.",
    tip: "Chess.com's free lessons teach you tactics through puzzles, not just theory.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "cooking",
    label: "Cooking",
    blurb:
      "Transform ingredients into meals, endlessly learnable, always useful.",
    tip: "Master 5 techniques (sauté, roast, braise, simmer, bake) and you can cook almost anything.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "baking",
    label: "Baking",
    blurb: "The chemistry of flour, sugar, and heat. Precise, satisfying.",
    tip: "Banana bread is the perfect first bake, forgiving and always impressive.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "coffee",
    label: "Coffee",
    blurb:
      "From pour-over to espresso, coffee is a surprisingly deep rabbit hole.",
    tip: "A hand grinder and V60 are all you need to brew better than most cafes.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "medium",
      timeCommitment: "quick",
    },
  },
  {
    id: "fermentation",
    label: "Fermentation",
    blurb: "Make kombucha, kimchi, sourdough, and more with live cultures.",
    tip: "Start with yogurt or simple sauerkraut, both are nearly impossible to mess up.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "low",
      timeCommitment: "deep",
    },
  },
  {
    id: "cooking-club",
    label: "Cooking Club",
    blurb: "Cook together, eat together. Social cooking at its best.",
    tip: "Assign each person a dish from the same cuisine, keeps it cohesive and fun.",
    tags: {
      environment: "indoors",
      social: "social",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "language-learning",
    label: "Language Learning",
    blurb:
      "Open entire cultures through their language, one of the best long-term hobbies.",
    tip: "Duolingo for vocabulary + Language Transfer for grammar is a powerful free combo.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "deep",
    },
  },
  {
    id: "philosophy",
    label: "Philosophy",
    blurb:
      "Think more carefully about everything, ancient questions, modern relevance.",
    tip: "Start with Plato's Republic or Marcus Aurelius's Meditations, both are short and readable.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "intermediate",
      cost: "free",
      timeCommitment: "moderate",
    },
  },
  {
    id: "journaling",
    label: "Journaling",
    blurb:
      "Write to think, daily pages build clarity, memory, and self-knowledge.",
    tip: "Three pages longhand every morning, don't edit, just write whatever comes.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "quick",
    },
  },
  {
    id: "meditation",
    label: "Meditation",
    blurb:
      "Train your attention, the simplest and most underrated mental skill.",
    tip: "10 minutes a day with Insight Timer (free) is genuinely enough to notice results.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "beginner",
      cost: "free",
      timeCommitment: "quick",
    },
  },
  {
    id: "investing",
    label: "Investing",
    blurb:
      "Grow wealth through markets, real estate, or other assets over time.",
    tip: "Start with index funds, JL Collins's 'The Simple Path to Wealth' is the clearest intro.",
    tags: {
      environment: "indoors",
      social: "solo",
      difficulty: "intermediate",
      cost: "low",
      timeCommitment: "moderate",
    },
  },
  {
    id: "genealogy",
    label: "Genealogy",
    blurb: "Trace your family's history through records, DNA, and stories.",
    tip: "Ancestry and FamilySearch both have free tiers, start with what you already know.",
    tags: {
      environment: "indoors",
      social: "either",
      difficulty: "beginner",
      cost: "low",
      timeCommitment: "deep",
    },
  },
];

export const HOBBY_GLYPHS: Record<string, Glyph> = {
  "3d-printing": {
    d: "M-9 7V-8H9V7M-6 -5H6M0 -5V-2L-2 0H2ZM-4 4L0 2 4 4V8L0 10-4 8ZM-4 4L0 6 4 4M0 6V10",
    dots: [
      [-9, 7, 1.15],
      [9, 7, 1.15],
    ],
  },
  archery: {
    d: "M-5 -9L2 -4 4 0 2 4-5 9ZM-9 0H10M6 -4L10 0 6 4",
    dots: [
      [-5, -9, 1.15],
      [-5, 9, 1.15],
    ],
  },
  astronomy: {
    d: "M-9 -1L4 -7 7 -1-6 5ZM-3 3L0 5 4 9M0 5L-4 10M4 -7L7 -8 10 -2 7 -1M-10 0L-8 4-6 5",
    dots: [
      [0, 5, 1.15],
      [8, -8, 1.15],
    ],
  },
  baking: {
    d: "M-8 6L-10 1-8 -5-3 -8H3L8 -5 10 1 8 6ZM-8 6V9H8V6M-4 -4L-6 0M1 -5L-1 -1M6 -3L4 1",
    dots: [
      [-3, -8, 1.15],
      [8, 6, 1.15],
    ],
  },
  birdwatching: {
    d: "M-10 4L-8 -7H-3L-1 4-4 9H-8ZM1 4L3 -7H8L10 4 8 9H4ZM-1 1H1M-9 3H-2M2 3H9",
    dots: [
      [-6, 6, 1.15],
      [6, 6, 1.15],
    ],
  },
  blacksmithing: {
    d: "M-10 -1H10L5 3H0L2 7H6V9H-7V7H-3L-2 3-8 2ZM-5 -9L-2 -10 3 -5 0 -2ZM0 -5L5 -10",
    dots: [
      [-10, -1, 1.15],
      [10, -1, 1.15],
    ],
  },
  "board-games": {
    d: "M-8 -8H6L10 -4V8H-4L-8 4ZM-8 -8L-4 -4H10M-4 -4V8",
    dots: [
      [0, 0, 1.15],
      [6, 4, 1.15],
      [-5, -5, 1.15],
    ],
  },
  bookbinding: {
    d: "M-8 -9H6L9 -6V9H-8ZM-4 -9V9M6 -9V-6H9M-10 -5H-6M-10 0H-6M-10 5H-6",
    dots: [
      [2, -3, 1.15],
      [2, 4, 1.15],
    ],
  },
  calligraphy: {
    d: "M0 -10L7 2 0 10-7 2ZM0 -10V1M-7 2L0 5 7 2",
    dots: [
      [0, 1, 1.15],
      [0, 10, 1.15],
    ],
  },
  chess: {
    d: "M-7 9V5L-2 1-3 -2-7 -2-5 -6 1 -9 5 -5 6 3 8 9ZM-5 -6H1M-7 6H7",
    dots: [
      [1, -5, 1.15],
      [1, -9, 1.15],
    ],
  },
  coding: {
    d: "M-10 -7H10V9H-10ZM-10 -3H10M-6 1L-3 4-6 7M0 7H5",
    dots: [
      [-7, -5, 1.15],
      [-4, -5, 1.15],
    ],
  },
  coffee: {
    d: "M-8 -4H5V3L1 7H-4L-8 3ZM5 -2H9V2L5 4M-10 10H7M-4 -8L-2 -10M1 -8L3 -10",
    dots: [
      [-8, -4, 1.15],
      [1, 7, 1.15],
    ],
  },
  cooking: {
    d: "M-8 -2H8V5L4 9H-4L-8 5ZM-10 0H-8M8 0H10M-6 -5H6M0 -5V-7M-3 -10H3",
    dots: [
      [-8, -2, 1.15],
      [8, -2, 1.15],
    ],
  },
  "cooking-club": {
    d: "M-7 -1L-5 -5H5L7 -1 5 5H-5ZM-10 7H10M-8 -9V-5M-10 -7H-6M8 -9V-5M6 -7H10",
    dots: [
      [-7, -1, 1.15],
      [7, -1, 1.15],
    ],
  },
  cycling: {
    d: "M-10 3L-7 -1-3 0-2 5-6 8-10 3ZM2 3L5 -1 9 0 10 5 6 8 2 3ZM-6 3L-1 -4 3 3H-6M-1 -4H4L6 3M-3 -7H0M4 -4L5 -8H8",
    dots: [
      [-6, 3, 1.15],
      [6, 3, 1.15],
    ],
  },
  drawing: {
    d: "M-9 9L-7 2 4 -9 9 -4-2 7-9 9ZM-7 2L-2 7M1 -6L6 -1M-9 9L-6 8",
    dots: [
      [-7, 2, 1.15],
      [9, -4, 1.15],
    ],
  },
  electronics: {
    d: "M-10 -7H-4V-2H2V5H10M-10 6H-4V1H-1M5 -8V-3H10M-7 -9V-5M-2 -4V0",
    dots: [
      [-10, -7, 1.15],
      [10, 5, 1.15],
      [5, -8, 1.15],
      [-10, 6, 1.15],
    ],
  },
  fencing: {
    d: "M-8 9L6 -6 9 -9 8 -5-5 7M8 9L-6 -6-9 -9-8 -5 5 7M-9 3L-3 9M9 3L3 9",
    dots: [[0, 0, 1.15]],
  },
  fermentation: {
    d: "M-5 -10H5V-7L8 -3V8L5 10H-5L-8 8V-3L-5 -7ZM-8 0H8M-5 -7H5",
    dots: [
      [-4, 4, 1.15],
      [2, 2, 1.15],
      [4, 7, 1.15],
    ],
  },
  foraging: {
    d: "M-9 0H9L6 9H-6ZM-5 0V-4L0 -7 5 -4V0M-3 3V6M3 3V6M0 -7L2 -10 7 -9 5 -6Z",
    dots: [
      [-9, 0, 1.15],
      [9, 0, 1.15],
    ],
  },
  genealogy: {
    d: "M0 -7V-2M-7 -2H7M-7 -2V3M7 -2V3M-7 3V7M-10 7H-4M-10 7V10M-4 7V10M7 3V9",
    dots: [
      [0, -7, 1.15],
      [-7, 3, 1.15],
      [7, 3, 1.15],
      [-10, 10, 1.15],
      [-4, 10, 1.15],
      [7, 9, 1.15],
    ],
  },
  geology: {
    d: "M-7 9L-10 -2-4 -8 2 -6 6 -10 10 -1 7 9ZM-4 -8L-3 2-7 9M2 -6L3 1 7 9M-10 -2L-3 2 3 1 10 -1",
    dots: [
      [-3, 2, 1.15],
      [3, 1, 1.15],
    ],
  },
  glassblowing: {
    d: "M-10 -8L1 1M1 1L5 -1 9 2 9 7 5 10 1 7-1 3 1 1ZM3 3L6 2M-8 5L-6 1-4 5-6 8Z",
    dots: [
      [1, 1, 1.15],
      [9, 7, 1.15],
    ],
  },
  hiking: {
    d: "M-8 -9H-2V-2L2 1 7 2 10 6V9H-8ZM-8 5H9M-2 -2L-5 0M2 1L0 3M5 2L3 4",
    dots: [
      [-8, -9, 1.15],
      [10, 6, 1.15],
    ],
  },
  improv: {
    d: "M-10 -8L-1 -6V1L-5 5-10 1ZM0 -4L10 -6V5L5 9 0 5ZM-7 -1L-4 0M3 4L5 2 8 3",
    dots: [
      [-7, -4, 1.15],
      [-3, -3, 1.15],
      [3, -1, 1.15],
      [7, -2, 1.15],
    ],
  },
  investing: {
    d: "M-9 9H10M-7 5V1M-2 5V-3M3 5V-1M8 5V-7M-9 -2L-3 -7 2 -4 9 -10M5 -10H9V-6",
    dots: [
      [-3, -7, 1.15],
      [2, -4, 1.15],
    ],
  },
  journaling: {
    d: "M-9 -10H5V10H-9ZM-5 -10V10M-2 -6H2M-2 -2H2M1 7L3 2 8 -3 11 0 6 5 1 7ZM3 2L6 5",
    dots: [
      [-9, -10, 1.15],
      [5, 10, 1.15],
    ],
  },
  kayaking: {
    d: "M-10 2L0 -1 10 2 5 6H-5ZM-8 -8L8 8M-8 -8L-5 -8-8 -5ZM8 8L5 8 8 5Z",
    dots: [
      [0, -1, 1.15],
      [5, 6, 1.15],
    ],
  },
  "language-learning": {
    d: "M-10 -8H4V3H-4L-8 7V3H-10ZM7 -4H10V8H4L1 10V7M-6 -1L-3 -6 0 -1M-5 -3H-1",
    dots: [
      [4, -8, 1.15],
      [10, 8, 1.15],
    ],
  },
  leatherwork: {
    d: "M-8 -8L-2 -9 3 -6 9 -7 8 2 5 9-3 8-9 3ZM-5 -4L-3 -5M2 -3L4 -2M5 3L4 5M-2 5L-4 4",
    dots: [
      [9, -7, 1.15],
      [-9, 3, 1.15],
    ],
  },
  "marine-biology": {
    d: "M-9 0L-4 -5H3L9 0 3 5H-4ZM-9 0L-11 -4V4ZM-3 -4L-1 0-3 4M-2 8L2 7 6 8",
    dots: [
      [5, -1, 1.15],
      [-1, 0, 1.15],
    ],
  },
  meditation: {
    d: "M0 9L-4 2-3 -5 0 -10 3 -5 4 2 0 9ZM0 9L-7 5-10 -3-4 0M0 9L7 5 10 -3 4 0",
    dots: [
      [0, -10, 1.15],
      [0, 9, 1.15],
    ],
  },
  music: {
    d: "M-4 5V-7L8 -9V3M-4 -3L8 -5M-4 5L-7 4-10 6-9 9-6 9-4 7ZM8 3L5 2 2 4 3 7 6 7 8 5Z",
    dots: [
      [-4, -7, 1.15],
      [8, -9, 1.15],
    ],
  },
  mycology: {
    d: "M-10 0L-7 -6 0 -9 7 -6 10 0ZM-3 0V7L0 9 3 7V0M-8 0L0 -3 8 0",
    dots: [
      [0, -9, 1.15],
      [-5, -4, 1.15],
      [5, -4, 1.15],
    ],
  },
  parkour: {
    d: "M0 -4L-3 -1-7 -2M-2 -1L2 1 6 -3M2 1L6 5 9 4M2 1L-1 6-6 6M-9 10V4H-5",
    dots: [
      [2, -7, 1.15],
      [6, -3, 1.15],
    ],
  },
  philosophy: {
    d: "M-9 -5L0 -10 9 -5ZM-7 -2V6M-2 -2V6M3 -2V6M8 -2V6M-10 9H10M-8 6H9",
    dots: [
      [0, -10, 1.15],
      [-10, 9, 1.15],
    ],
  },
  photography: {
    d: "M-10 -4H-6L-4 -8H3L5 -4H10V8H-10ZM0 -2L4 1V5L0 7-4 5V1ZM6 -1H8",
    dots: [
      [0, 2, 1.15],
      [-10, 8, 1.15],
    ],
  },
  pottery: {
    d: "M-5 -9H5L4 -5 8 1 6 8H-6L-8 1-4 -5ZM-8 1L0 5 8 1M-6 8H6",
    dots: [
      [0, 5, 1.15],
      [-5, -9, 1.15],
    ],
  },
  "rock-climbing": {
    d: "M-9 9L-5 -2 1 -9 9 9ZM-4 8L-1 3 3 1 1 -3 3 -5",
    dots: [
      [3, -5, 1.15],
      [-1, 3, 1.15],
    ],
  },
  running: {
    d: "M2 -4L-1 0 3 4 1 9M-1 0L-5 5-9 4M0 -3L-5 -5-8 -2M0 -2L5 0 8 -3",
    dots: [
      [4, -7, 1.15],
      [1, 9, 1.15],
    ],
  },
  skateboarding: {
    d: "M-10 -1L-7 3H7L10 -1M-7 3L-6 7M7 3L6 7M-8 -5L7 -7",
    dots: [
      [-6, 7, 1.15],
      [6, 7, 1.15],
    ],
  },
  surfing: {
    d: "M-10 7L-6 -1-1 -6H5L9 -2 8 2 4 4 1 1 3 -1M-10 9H8M-4 5L-1 2",
    dots: [
      [-1, -6, 1.15],
      [4, 4, 1.15],
    ],
  },
  "urban-exploration": {
    d: "M-9 9V-5L-3 -8V9M-3 9V-2L4 -5 9 -2V9M-9 9H9M1 9V3H5V9M-7 -3H-5M-7 1H-5",
    dots: [
      [-3, -8, 1.15],
      [9, -2, 1.15],
    ],
  },
  volunteering: {
    d: "M-10 3L-6 2-2 5H4L7 3 10 4 5 9H-2L-8 6M0 1L-5 -4-4 -8-1 -9 2 -6 5 -9 8 -7 8 -4 2 2",
    dots: [
      [-10, 3, 1.15],
      [5, 9, 1.15],
    ],
  },
  weaving: {
    d: "M-8 -8H8V8H-8ZM-4 -8V-3M-4 1V8M0 -8V1M0 5V8M4 -8V-3M4 1V8M-8 -4H8M-8 0H8M-8 4H8",
    dots: [
      [-8, -8, 1.15],
      [8, 8, 1.15],
    ],
  },
  yoga: {
    d: "M0 -4V1L-5 5-9 7 0 9 9 7 5 5 0 1M-6 -1L-3 2H3L6 -1",
    dots: [
      [0, -7, 1.15],
      [-9, 7, 1.15],
      [9, 7, 1.15],
    ],
  },
  zumba: {
    d: "M0 -4L-2 1 1 5-4 9M1 5L6 8M-2 0L-7 -2-9 -6M-1 -2L5 -4 7 -8",
    dots: [
      [1, -7, 1.15],
      [-9, -6, 1.15],
      [7, -8, 1.15],
    ],
  },
};

export const CLUSTER_GLYPHS: Record<string, Glyph> = {
  adventure: {
    d: "M0 -10L9 -4 7 6 0 10-7 6-9 -4ZM0 -6L3 3-3 1 0 -6M0 10V5",
    dots: [
      [0, -10, 1.15],
      [0, 10, 1.15],
    ],
  },
  community: {
    d: "M-10 7L-9 3-6 1-3 3M3 3L6 1 9 3 10 7M-5 9L-4 5 0 3 4 5 5 9Z",
    dots: [
      [-6, -3, 1.15],
      [6, -3, 1.15],
      [0, -1, 1.15],
    ],
  },
  craft: {
    d: "M-8 -7L8 7M-8 7L8 -7M-9 -9L-5 -7-7 -5ZM5 7L7 5 9 9ZM-9 9L-5 7-7 5Z",
    dots: [
      [-8, 7, 1.15],
      [8, -7, 1.15],
    ],
  },
  creative: {
    d: "M-8 -8H0M-8 -8V8H8V0M-4 4L-2 -2 6 -10 10 -6 2 2-4 4ZM-2 -2L2 2",
    dots: [
      [-8, 8, 1.15],
      [6, -10, 1.15],
    ],
  },
  culinary: {
    d: "M-9 2H9L6 8H-6ZM-7 2L-4 -4H4L7 2M-2 -8H2M0 -8V-4",
    dots: [
      [-9, 2, 1.15],
      [9, 2, 1.15],
    ],
  },
  fitness: {
    d: "M-5 -3V-7L-2 -10H2L5 -7V-3M-5 -3L-9 2-7 9H7L9 2 5 -3ZM-2 -6H2",
    dots: [
      [-5, -3, 1.15],
      [5, -3, 1.15],
    ],
  },
  mind: {
    d: "M-5 7V3L-8 -2-5 -8H3L8 -3V3L4 6V9M-5 7H1M-3 -2L0 -5 4 -2 1 2-3 -2",
    dots: [
      [-3, -2, 1.15],
      [4, -2, 1.15],
    ],
  },
  nature: {
    d: "M-8 8L-7 -1 0 -7 9 -8 8 1 1 7-8 8ZM-8 8L5 -5M-2 2V-3M2 -2H6",
    dots: [
      [-8, 8, 1.15],
      [9, -8, 1.15],
    ],
  },
  outdoor: {
    d: "M-10 7L-4 -6 0 1 4 -3 10 7H-10M-6 -2L-4 0-2 -2",
    dots: [
      [6, -7, 1.15],
      [-4, -6, 1.15],
    ],
  },
  social: {
    d: "M-10 -7H3V1H-3L-6 4V1H-10ZM6 -2H10V7H5L2 10V7H-1V4",
    dots: [
      [3, -7, 1.15],
      [10, 7, 1.15],
    ],
  },
  tech: {
    d: "M-7 -7H7V7H-7ZM-3 -3H3V3H-3ZM-10 0H-7M7 0H10M0 -10V-7M0 7V10",
    dots: [
      [-7, -7, 1.15],
      [7, 7, 1.15],
    ],
  },
};
