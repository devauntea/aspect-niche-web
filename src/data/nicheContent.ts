export type NicheContent = {
  nicheLabel: string; // e.g. "Bioacoustic Birding"
  description: string; // the deep-cut angle
  rabbitHoles: string[]; // 3 specific things to go deep on
  insiderTerm: string; // one piece of jargon that signals expertise
  insiderDefinition: string; // what it means
};

export const nicheContent: Record<string, NicheContent> = {
  "rock-climbing": {
    nicheLabel: "Route Projection & Systems Climbing",
    description:
      "Beyond the gym lies a world of outdoor sport climbing, trad gear placements, and the obsessive pursuit of projecting a single route for months. Climbers grade routes on the Yosemite Decimal System or V-scale, debate heel hooks vs toe hooks, and study beta like film.",
    rabbitHoles: [
      "The V-scale grading system and what V10 actually means",
      "Trad climbing gear placement — nuts, cams, and building anchors",
      "The Dawn Wall — Tommy Caldwell's 19-day free climb of El Capitan",
    ],
    insiderTerm: "Redpoint",
    insiderDefinition:
      "Successfully climbing a route from bottom to top without falling, after having practiced it.",
  },
  zumba: {
    nicheLabel: "Latin Dance Rhythms & Musicality",
    description:
      "Beneath the cardio surface lies a rich world of cumbia, salsa, merengue, and reggaeton footwork. Serious Zumba instructors get licensed through Zumba Education Specialists (ZES) and study how different rhythms map to body isolation and hip movement.",
    rabbitHoles: [
      "The difference between cumbia, salsa, and merengue rhythm structures",
      "How ZES licensing works and what separates a B1 from B2 instructor",
      "Body isolation technique — ribcage vs hip movement independence",
    ],
    insiderTerm: "Merengue March",
    insiderDefinition:
      "The foundational two-step pattern used to transition between song sections and reset energy.",
  },
  cycling: {
    nicheLabel: "Velodrome Racing & Power Metrics",
    description:
      "Road cycling's obsessives train by FTP (functional threshold power), obsess over watts-per-kilogram, and study cadence optimization. Track cyclists race fixed-gear on banked velodromes with no brakes. Gravel cyclists seek unpaved routes through remote terrain.",
    rabbitHoles: [
      "FTP testing — how to measure and improve your functional threshold power",
      "Track cycling — keirin, madison, and team pursuit on the velodrome",
      "Gravel cycling and bikepacking — route planning for multi-day rides",
    ],
    insiderTerm: "FTP",
    insiderDefinition:
      "Functional Threshold Power — the maximum watts you can sustain for one hour, the key metric for training zones.",
  },
  yoga: {
    nicheLabel: "Mysore Ashtanga & Pranayama Practice",
    description:
      "Beyond studio flow classes lies a world of self-practice in the Mysore style, where students practice Ashtanga's fixed series independently with teacher adjustments. Pranayama (breath control) and bandhas (energetic locks) are considered the real practice.",
    rabbitHoles: [
      "The Ashtanga Primary Series — its 75 poses in fixed sequence",
      "Mysore practice — what it means to practice self-led with a teacher present",
      "Pranayama techniques: nadi shodhana, kapalabhati, and bandha locks",
    ],
    insiderTerm: "Bandha",
    insiderDefinition:
      "An energetic lock — mula bandha (root), uddiyana bandha (abdomen), jalandhara bandha (throat) — used to direct prana during practice.",
  },
  running: {
    nicheLabel: "Ultramarathon Training & Polarized Running",
    description:
      "Serious runners train by heart rate zones using polarized models (80% easy, 20% hard), periodize their seasons, and chase PRs on certified courses. Ultramarathon runners cover 50–100+ miles through mountain terrain, managing nutrition and sleep deprivation.",
    rabbitHoles: [
      "Polarized training model — why most of your runs should feel embarrassingly easy",
      "VO2 max and lactate threshold — the two physiological ceilings of running performance",
      "UTMB and Western States — ultrarunning's most prestigious 100-mile races",
    ],
    insiderTerm: "Strides",
    insiderDefinition:
      "Short 20-second accelerations at the end of easy runs, used to develop neuromuscular efficiency without adding fatigue.",
  },
  skateboarding: {
    nicheLabel: "Street Skating Technique & Spot Culture",
    description:
      "Street skating is as much about finding and reading architecture as it is about tricks. Skaters study ledge wax chemistry, debate concave shapes, obsess over wheel durometers, and document spots on apps like Skatespot. The footage-first culture shapes everything.",
    rabbitHoles: [
      "Concave and wheelbase — how board geometry affects pop and feel",
      "Spot hunting — the culture of finding and skating untouched urban architecture",
      "Nollie vs switch vs fakie — understanding the four stances",
    ],
    insiderTerm: "Pop",
    insiderDefinition:
      "The snapping force generated when the tail hits the ground — the foundation of every ollie-based trick.",
  },
  archery: {
    nicheLabel: "Traditional Instinctive Archery & Bow Tuning",
    description:
      "Olympic recurve archers use clickers, stabilizers, and draw weight calculators. Traditional barebow archers shoot instinctively without sights. Bow tuning — paper tuning, walk-back tuning, nocking point height — is a science unto itself.",
    rabbitHoles: [
      "Paper tuning — how to read arrow flight and adjust your rest",
      "The difference between recurve, compound, and barebow disciplines",
      "Howard Hill and Byron Ferguson — the legends of instinctive archery",
    ],
    insiderTerm: "Clicker",
    insiderDefinition:
      "A thin blade attached to the bow that clicks when the arrow is drawn to the correct anchor point, ensuring consistent draw length.",
  },
  fencing: {
    nicheLabel: "Tactical Theory & Phrase of Arms",
    description:
      "Fencing's three weapons — foil, épée, sabre — each have distinct target areas and right-of-way rules. Competitive fencers study video of opponents, train bladework, and learn to read intention through distance and tempo. The 'phrase of arms' is an entire tactical conversation in seconds.",
    rabbitHoles: [
      "Right-of-way — why the same touch scores in foil but not épée",
      "The six parries and their ripostes in foil fencing",
      "Tactically analyzing video — how elite fencers prepare for opponents",
    ],
    insiderTerm: "Phrase of Arms",
    insiderDefinition:
      "A continuous exchange of actions between two fencers — attacks, parries, ripostes — until a touch is scored or distance is broken.",
  },
  parkour: {
    nicheLabel: "Precision Movement & Environmental Reading",
    description:
      "Parkour's serious practitioners (traceurs) study movement efficiency, not spectacle. They drill precision landings for months before adding height. The discipline of 'natural method' parkour follows Georges Hébert's philosophy of useful, complete human movement.",
    rabbitHoles: [
      "The precision jump — why landing on a rail is the foundation of everything",
      "Méthode Naturelle — the French military fitness system that inspired parkour",
      "David Belle and Sébastien Foucan — the founders and their philosophical split",
    ],
    insiderTerm: "Tic-Tac",
    insiderDefinition:
      "Using a wall as a stepping stone mid-movement — one foot contacts the wall to redirect momentum or gain height.",
  },
  photography: {
    nicheLabel: "Zone System & Computational Light",
    description:
      "Ansel Adams's Zone System maps 10 tonal zones from pure black to pure white, giving photographers precise control over exposure and darkroom development. Modern photographers study histograms, understand diffraction limits, and debate RAW processing pipelines.",
    rabbitHoles: [
      "The Zone System — Ansel Adams's method for precise tonal control",
      "Understanding hyperfocal distance for maximum depth of field",
      "Color science: why different cameras render skin tones differently",
    ],
    insiderTerm: "Hyperfocal Distance",
    insiderDefinition:
      "The closest focus distance at which everything from half that distance to infinity is acceptably sharp — maximizing depth of field.",
  },
  drawing: {
    nicheLabel: "Constructive Drawing & Analytical Sight",
    description:
      "Andrew Loomis's method builds figures from volumes — spheres, boxes, cylinders. Watts Atelier teaches sight-size comparative measurement. Serious draftsmen study bargue plates, cast drawing, and the academic tradition of breaking form into light families.",
    rabbitHoles: [
      "Sight-size drawing — measuring your subject at true scale to train accurate observation",
      "The Loomis head — breaking the skull into sphere + plane for any angle",
      "Bargue plates — the 19th-century copying exercises still used in ateliers today",
    ],
    insiderTerm: "Lost Edge",
    insiderDefinition:
      "Where two adjacent tonal areas are so similar that the boundary between them dissolves — used to suggest form without hard outlines.",
  },
  music: {
    nicheLabel: "Music Theory & Spectral Composition",
    description:
      "Beyond learning songs, serious musicians study counterpoint, voice leading, and harmonic function. Spectral composers like Gérard Grisey work directly with the overtone series. Jazz musicians learn to hear chord qualities as colors and navigate changes by ear.",
    rabbitHoles: [
      "Voice leading — why Bach's four-part chorales are the best way to learn harmony",
      "The overtone series — how all harmony emerges from physics",
      "Negative harmony — inverting chord progressions through an axis of symmetry",
    ],
    insiderTerm: "Tritone Substitution",
    insiderDefinition:
      "Replacing a dominant 7th chord with another dominant 7th a tritone away — they share the same guide tones (3rd and 7th) but inverted.",
  },
  pottery: {
    nicheLabel: "Reduction Firing & Glaze Chemistry",
    description:
      "Wood-fire and soda-fire kilns create unpredictable surfaces impossible to replicate with electric kilns. Glaze chemistry — silica, alumina, flux ratios in the Seger formula — lets potters engineer exactly how glass forms at temperature. Anagama kilns fire for 3+ days continuously.",
    rabbitHoles: [
      "Reduction firing — how limiting oxygen in the kiln creates unique glaze effects",
      "The Seger formula — understanding glaze chemistry through molecular ratios",
      "Anagama wood firing — the 72-hour community firing process and its results",
    ],
    insiderTerm: "Flux",
    insiderDefinition:
      "A glaze material (like potassium or calcium) that lowers the melting point of silica, enabling glass formation at kiln temperatures.",
  },
  calligraphy: {
    nicheLabel: "Historical Scripts & Broad-Nib Technique",
    description:
      "Serious calligraphers study historical scripts — Carolingian minuscule, Uncial, Italic, Copperplate — from original manuscripts. The broad-nib pen creates letterforms through consistent pen angle, while pointed-pen Copperplate relies on pressure variation for thick/thin contrast.",
    rabbitHoles: [
      "The pen angle — how holding a broad nib at 45° creates the stress patterns in letterforms",
      "Copperplate vs Spencerian — the two great pointed-pen traditions",
      "Historical manuscripts — studying the Lindisfarne Gospels and Book of Kells as reference",
    ],
    insiderTerm: "Pen Angle",
    insiderDefinition:
      "The angle of the nib edge relative to the writing line — typically 45° for Italic, 0° for Uncial — which determines where thick and thin strokes fall.",
  },
  bookbinding: {
    nicheLabel: "Historical Structures & Conservation Binding",
    description:
      "Conservation bookbinders study historical structures to repair rare books without compromising their integrity. The Ethiopian Coptic, Byzantine limp binding, and French link stitch are each optimized for different paper and use cases. Forwarding and finishing are two distinct stages of craft.",
    rabbitHoles: [
      "The Ethiopian binding — a non-adhesive chain stitch structure over 1,500 years old",
      "Japanese stab binding — four-hole variations and their aesthetic logic",
      "Forwarding vs finishing — the two stages of hand bookbinding",
    ],
    insiderTerm: "Kettle Stitch",
    insiderDefinition:
      "The link stitch made at the head and tail of a bookbinding signature that chains sections together — the structural core of sewn bindings.",
  },
  glassblowing: {
    nicheLabel: "Borosilicate Lampworking & Color Theory",
    description:
      "Lampworking uses a bench-mounted torch rather than a furnace — allowing finer detail and borosilicate glass that handles thermal shock. Glass color chemistry involves metal oxides (cobalt for blue, copper for green/red, gold for cranberry). Murrine and millefiori involve pulling and slicing glass canes.",
    rabbitHoles: [
      "Borosilicate vs soda-lime glass — thermal expansion and why it matters",
      "Murrine and millefiori — slicing glass canes to reveal internal patterns",
      "Metal oxide colorants — how copper creates both green and red depending on atmosphere",
    ],
    insiderTerm: "Gather",
    insiderDefinition:
      "A ball of molten glass collected on the end of the blowpipe or punty — the raw material for every form.",
  },
  leatherwork: {
    nicheLabel: "Wet Molding & Saddle Stitching Technique",
    description:
      "Vegetable-tanned leather (vs chrome-tanned) can be wet-molded into three-dimensional shapes that harden permanently as it dries. Saddle stitching with two needles and waxed thread creates a stronger joint than machine stitching — if one stitch breaks, the rest hold.",
    rabbitHoles: [
      "Veg-tan vs chrome-tan — why the tanning process determines what you can do with leather",
      "Saddle stitching technique — the two-needle method and why it outlasts machine stitching",
      "Swivel knife and beveling — how carving creates the raised floral patterns in Western leather",
    ],
    insiderTerm: "Burnishing",
    insiderDefinition:
      "Rubbing leather edges with a toconol or gum tragacanth to seal and polish them — the finishing step that signals quality work.",
  },
  weaving: {
    nicheLabel: "Draft Notation & Shaft Weaving",
    description:
      "Floor loom weaving uses a threading draft — a notation system mapping warp threads to shafts, treadles to shaft combinations, and tie-ups to create patterns. Twill, satin, and plain weave are the three base structures; everything else derives from them.",
    rabbitHoles: [
      "Reading and writing drafts — the notation system for loom threading patterns",
      "The three base structures: plain, twill, and satin weave and their derivatives",
      "Rigid heddle vs floor loom — understanding the jump in complexity and possibility",
    ],
    insiderTerm: "Sett",
    insiderDefinition:
      "The number of warp ends per inch — determines how tightly packed the weave is and which yarns are appropriate for a project.",
  },
  blacksmithing: {
    nicheLabel: "Heat Treatment & Damascus Steel",
    description:
      "Blacksmiths work in specific heat ranges visible by steel color — from black heat (invisible stress relief) through cherry, orange, and white (welding heat). Damascus steel is pattern-welded from alternating high and low carbon steels, etched in acid to reveal the layers.",
    rabbitHoles: [
      "Reading heat color — the temperature ranges from black heat to welding heat",
      "Pattern welding and Damascus steel — how layers are forge-welded and twisted",
      "Differential hardening — using clay to create the hamon line on Japanese-style blades",
    ],
    insiderTerm: "Quench",
    insiderDefinition:
      "Rapidly cooling hot steel in water, oil, or brine to harden it — the speed of cooling determines the hardness and brittleness of the final blade.",
  },
  hiking: {
    nicheLabel: "Long-Distance Thru-Hiking & Leave No Trace",
    description:
      "Thru-hikers spend months covering 2,000+ mile trails like the Appalachian Trail, PCT, or CDT. They obsess over base weight (sub-10lb is ultralight), study water sources with Guthook, and navigate resupply strategy across small-town post offices.",
    rabbitHoles: [
      "The Triple Crown — completing the AT, PCT, and CDT (7,900 miles total)",
      "Ultralight backpacking philosophy — cutting base weight below 10 lbs",
      "Water treatment methods: Sawyer Squeeze vs SteriPen vs Aquatabs compared",
    ],
    insiderTerm: "Base Weight",
    insiderDefinition:
      "The weight of your pack without consumables (food, water, fuel) — the number ultralight hikers obsess over, with sub-10 lbs considered ultralight.",
  },
  kayaking: {
    nicheLabel: "Whitewater Reading & Eskimo Roll",
    description:
      "Whitewater kayakers classify rapids from Class I (moving water) to Class VI (unrunnable). Reading water — identifying eddies, hydraulics, and pour-overs — is a skill that takes years. The Eskimo roll (wet re-entry without exiting the boat) is the gateway to serious whitewater.",
    rabbitHoles: [
      "The international whitewater grading scale — Class I through VI",
      "Reading hydraulics — how to identify and avoid river-wide stoppers and sieves",
      "The Eskimo roll — hip snap mechanics and why it's fundamentally different from bracing",
    ],
    insiderTerm: "Eddy",
    insiderDefinition:
      "A calm pocket of water immediately downstream of an obstacle where the current reverses — a kayaker's resting spot and the foundation of river navigation.",
  },
  foraging: {
    nicheLabel: "Ethnobotany & Chemotaxonomy",
    description:
      "Advanced foragers study plant families to understand which genera are safe across a family vs which contain dangerous lookalikes. Chemotaxonomy maps chemical compounds across plant species — understanding why umbellifers (carrot family) contain both wild carrot and deadly hemlock.",
    rabbitHoles: [
      "The carrot family (Apiaceae) — identifying the wild carrot vs hemlock problem",
      "Phenology — timing your foraging by what's seasonally available in your bioregion",
      "Ethnobotany — how indigenous food systems map to modern foraging practice",
    ],
    insiderTerm: "Lookalike",
    insiderDefinition:
      "A toxic or inedible species that closely resembles an edible one — the central risk in foraging that drives systematic botanical identification.",
  },
  birdwatching: {
    nicheLabel: "Nocturnal Flight Calls & Bioacoustic ID",
    description:
      "Advanced birders identify species by call alone, including nocturnal flight calls (NFCs) — the thin seep and zeep notes birds make while migrating at night. Recording NFCs with an omnidirectional microphone pointed at the sky during migration reveals dozens of species passing invisibly overhead.",
    rabbitHoles: [
      "Nocturnal flight calls — recording and identifying birds migrating overhead at night",
      "The Sibley vs Peterson debate — why field guide choice reflects ID philosophy",
      "eBird and citizen science — how your checklists contribute to migration research",
    ],
    insiderTerm: "Jizz",
    insiderDefinition:
      "The overall impression of a bird's size, shape, behavior, and movement that experienced birders use to identify species before seeing field marks.",
  },
  geology: {
    nicheLabel: "Structural Geology & Thin Section Petrology",
    description:
      "Structural geologists read deformation in rocks — folds, faults, and foliations that record tectonic events millions of years old. Petrologists grind rocks to 30-micron thin sections, then identify minerals under polarized light microscopy by their birefringence colors.",
    rabbitHoles: [
      "Reading rock deformation — folds, faults, and what they reveal about tectonic history",
      "Thin section petrology — identifying minerals by birefringence under polarized light",
      "The geologic time scale and how radiometric dating works",
    ],
    insiderTerm: "Birefringence",
    insiderDefinition:
      "The double refraction of polarized light through anisotropic minerals — each mineral produces a characteristic color under crossed polarizers that aids identification.",
  },
  mycology: {
    nicheLabel: "Mycelial Networks & Spore Printing",
    description:
      "Mycologists study the kingdom Fungi through spore prints, microscopy, and chemical spot tests. The mycelial network beneath a forest floor can span acres and functionally connects trees in what Suzanne Simard called the 'wood wide web.' Amanita identification requires examining volva, ring, and gill attachment.",
    rabbitHoles: [
      "The wood wide web — how mycorrhizal networks connect forest trees",
      "Spore printing technique and what spore color tells you about genus",
      "Amanita identification — why the most beautiful mushrooms are often the most deadly",
    ],
    insiderTerm: "Volva",
    insiderDefinition:
      "The cup-like sheath at the base of certain mushrooms (especially Amanita) — remnant of the universal veil that enclosed the fruiting body, and a key identification feature.",
  },
  "urban-exploration": {
    nicheLabel: "Psychogeography & Ruin Documentation",
    description:
      "Urban explorers influenced by Situationist psychogeography use the dérive — an unplanned journey through urban spaces, guided by the architecture's emotional pull. Documentation ethics divide the community: some photograph only, others preserve records of spaces about to be demolished.",
    rabbitHoles: [
      "Psychogeography and the dérive — the Situationist practice of drifting through cities",
      "Industrial archaeology — documenting factories, asylums, and infrastructure before demolition",
      "The ethics of urbex — photography-only vs intervention, and the 'take nothing, leave nothing' code",
    ],
    insiderTerm: "Dérive",
    insiderDefinition:
      "An unplanned drift through urban space guided entirely by the architectural and emotional pull of surroundings — a Situationist practice adopted by urban explorers.",
  },
  coding: {
    nicheLabel: "Type Theory & Computational Complexity",
    description:
      "Beyond writing apps lies the theoretical foundation: type systems that prove program correctness at compile time, complexity classes that define what's fundamentally computable, and category theory that unifies programming language semantics. Dependent types in Idris or Lean can encode proofs as programs.",
    rabbitHoles: [
      "The Curry-Howard correspondence — why types are proofs and programs are proofs",
      "P vs NP — the million-dollar question about what computers can efficiently solve",
      "Dependent types — programming languages where the type system can express arbitrary mathematical properties",
    ],
    insiderTerm: "Referential Transparency",
    insiderDefinition:
      "A function is referentially transparent if it can be replaced with its output value without changing program behavior — the core property of pure functional programming.",
  },
  "3d-printing": {
    nicheLabel: "Resin SLA & Topology Optimization",
    description:
      "SLA resin printers use UV lasers to cure photopolymer layer by layer, achieving resolutions impossible with FDM filament. Topology optimization uses finite element analysis to remove material from non-load-bearing areas, creating organic lattice structures that are stronger and lighter than solid parts.",
    rabbitHoles: [
      "FDM vs SLA vs SLS — the three major 3D printing technologies and their trade-offs",
      "Topology optimization — letting software remove material to create lighter, stronger parts",
      "Generative design in Fusion 360 — AI-assisted structural optimization",
    ],
    insiderTerm: "Layer Adhesion",
    insiderDefinition:
      "The bond strength between successive printed layers — the primary failure mode in FDM parts, which are significantly weaker in the Z-axis than X/Y.",
  },
  electronics: {
    nicheLabel: "RF Design & Embedded Systems",
    description:
      "RF (radio frequency) electronics involves impedance matching, antenna design, and working at frequencies where component leads become transmission lines. Embedded systems programmers write bare-metal C for microcontrollers, managing interrupts, timers, and memory-mapped I/O without an operating system.",
    rabbitHoles: [
      "Impedance matching — why 50Ω transmission lines are everywhere in RF design",
      "Bare-metal programming — writing C directly for microcontrollers without an OS",
      "Software-defined radio — using a $25 RTL-SDR dongle to receive any radio signal",
    ],
    insiderTerm: "Impedance Matching",
    insiderDefinition:
      "Ensuring the source, transmission line, and load all present the same impedance — prevents signal reflections that degrade RF performance.",
  },
  astronomy: {
    nicheLabel: "Narrowband Imaging & Variable Star Monitoring",
    description:
      "Deep-sky astrophotographers use narrowband filters (Ha, OIII, SII) to image nebulae through light-polluted skies by isolating specific emission wavelengths. Variable star observers monitor brightness changes over time, contributing data to the AAVSO database that professional astronomers actively use.",
    rabbitHoles: [
      "Narrowband imaging — using Hα and OIII filters to image nebulae in light-polluted skies",
      "The Hertzsprung-Russell diagram — understanding stellar evolution from main sequence to red giant",
      "Variable star monitoring — contributing real data to the AAVSO international database",
    ],
    insiderTerm: "Seeing",
    insiderDefinition:
      "Atmospheric stability affecting image sharpness — rated on the Antoniadi scale from I (perfect) to V (very bad). Poor seeing blurs stars regardless of telescope quality.",
  },
  "marine-biology": {
    nicheLabel: "Coral Bleaching & Deep-Sea Chemosynthesis",
    description:
      "Marine biologists study the breakdown of coral-zooxanthellae symbiosis during bleaching events, deep-sea hydrothermal vent communities that derive energy from chemosynthesis (not sunlight), and use environmental DNA (eDNA) from water samples to detect species without observation.",
    rabbitHoles: [
      "Coral bleaching — the breakdown of zooxanthellae symbiosis and thermal thresholds",
      "Hydrothermal vent ecosystems — life sustained by chemosynthesis, not photosynthesis",
      "Environmental DNA (eDNA) — detecting species from water samples without observation",
    ],
    insiderTerm: "Zooxanthellae",
    insiderDefinition:
      "Symbiotic photosynthetic algae living within coral tissue — provide 90% of coral's energy through photosynthesis, expelled during bleaching when water temperatures rise.",
  },
  "board-games": {
    nicheLabel: "Game Theory & Ludology",
    description:
      "Serious board game designers study game theory (Nash equilibria, dominant strategies), and the academic field of ludology (the study of games as systems). Mechanic taxonomies — worker placement, deck-building, area control — provide a vocabulary for analyzing and designing games.",
    rabbitHoles: [
      "Nash equilibrium — why rational players in certain games always reach the same outcome",
      "Mechanic taxonomy — the vocabulary designers use (worker placement, deck-building, area control)",
      "The BGG weight scale — understanding cognitive complexity ratings from 1 to 5",
    ],
    insiderTerm: "Kingmaking",
    insiderDefinition:
      "When a player who cannot win determines who does win through their actions — considered a design flaw in competitive games, avoided through careful balance.",
  },
  improv: {
    nicheLabel: "The Harold & Long-Form Structure",
    description:
      "Short-form improv (games, scenes) is the entry point, but long-form is the art. The Harold — developed at iO Chicago — is a 25-minute form with three-part openings, monologues, group games, and cross-cutting scenes that thematically braid. Del Close's theory of the 'group mind' underlies all long-form work.",
    rabbitHoles: [
      "The Harold structure — Del Close's 25-minute long-form format in detail",
      "The group mind — Del Close's theory of ensemble consciousness in improvisation",
      "TJ and Dave — how minimalist, reality-based improv challenges the 'yes-and' orthodoxy",
    ],
    insiderTerm: "The Harold",
    insiderDefinition:
      "A long-form improv structure developed by Del Close at iO Chicago — three-beat scenes, group games, and a thematic opening that cross-reference throughout.",
  },
  volunteering: {
    nicheLabel: "Effective Altruism & Capacity Building",
    description:
      "Effective altruism evaluates volunteering through impact per hour — direct service vs capacity building vs policy advocacy. GiveWell and 80,000 Hours research which causes and interventions produce the most measurable good per dollar or hour of effort.",
    rabbitHoles: [
      "Effective altruism — how to evaluate the impact of different types of volunteering",
      "80,000 Hours — career planning through the lens of social impact",
      "Capacity building vs direct service — why training others often multiplies impact",
    ],
    insiderTerm: "Counterfactual Impact",
    insiderDefinition:
      "The difference your contribution makes compared to the baseline of what would happen without you — the key metric for evaluating how much any volunteer activity actually matters.",
  },
  chess: {
    nicheLabel: "Endgame Theory & Engine Analysis",
    description:
      "Chess endgames are mathematically solved territory — rook vs rook pawn positions, Lucena and Philidor, have definitive correct play. Tablebases have solved all positions with 7 or fewer pieces. Engine analysis with Stockfish 16 at depth 40 reveals truths invisible to human players.",
    rabbitHoles: [
      "The Lucena and Philidor positions — the two essential rook endgame foundations",
      "Tablebases — how all chess positions with ≤7 pieces are mathematically solved",
      "Zugzwang — positions where any move worsens your position, found frequently in endgames",
    ],
    insiderTerm: "Zugzwang",
    insiderDefinition:
      "A position where any move a player makes worsens their position — being 'compelled to move' is the disadvantage. Critical in king-and-pawn endgames.",
  },
  cooking: {
    nicheLabel: "Fermentation Science & Maillard Reaction",
    description:
      "Serious cooks study the Maillard reaction (amino acids + reducing sugars at 140–165°C), the role of salt in protein denaturation, and how pH affects enzyme activity in brines. Modernist techniques use hydrocolloids (xanthan, methylcellulose, carrageenan) to create textures impossible with classical methods.",
    rabbitHoles: [
      "The Maillard reaction — why browning isn't caramelization and why it matters for flavor",
      "Salt's role — how it denatures proteins, suppresses bitterness, and enhances other flavors",
      "Hydrocolloids in modernist cooking — xanthan, methylcellulose, and agar explained",
    ],
    insiderTerm: "Mise en Place",
    insiderDefinition:
      "French for 'everything in its place' — prepping and organizing all ingredients before cooking begins. A discipline that separates reactive from controlled cooking.",
  },
  baking: {
    nicheLabel: "Laminated Dough & Preferment Science",
    description:
      "Croissant and puff pastry are laminated — alternating layers of dough and butter created through repeated folding. Preferments (poolish, biga, levain) ferment a portion of dough overnight, developing flavor compounds and improving gluten structure in ways a same-day mix cannot achieve.",
    rabbitHoles: [
      "Laminated doughs — how croissants achieve hundreds of butter layers through folding",
      "Preferments: poolish, biga, and levain — why overnight fermentation improves bread flavor",
      "Baker's percentages — the formula system that scales any recipe regardless of batch size",
    ],
    insiderTerm: "Baker's Percentage",
    insiderDefinition:
      "A formula where all ingredients are expressed as a percentage of total flour weight — allows precise scaling and comparison of any bread formula.",
  },
  coffee: {
    nicheLabel: "Coffee Processing Methods & Terroir",
    description:
      "Coffee flavor is shaped by processing method (washed, natural, honey), altitude, varietal (Gesha, SL28, Typica), and roast development time. Specialty roasters track roast curves on Cropster — measuring bean temperature, rate of rise, and first crack timing to within seconds.",
    rabbitHoles: [
      "Washed vs natural vs honey processing — how post-harvest method shapes cup flavor",
      "The Gesha varietal — why one cultivar from Panama sells for $1,000+ per pound",
      "Roast curves and development time ratio — how roasters control flavor using temperature data",
    ],
    insiderTerm: "First Crack",
    insiderDefinition:
      "The audible popping of coffee beans as they expand and moisture vaporizes during roasting — marks the beginning of light roast territory and is a key timing reference.",
  },
  fermentation: {
    nicheLabel: "Wild Fermentation & Microbial Ecology",
    description:
      "Wild fermentation captures ambient microbes — Lactobacillus from vegetable surfaces, wild Saccharomyces from fruit skins, acetobacter from air. Sandor Katz's 'The Art of Fermentation' maps this as a relationship with microbial communities rather than a controlled technical process.",
    rabbitHoles: [
      "Wild vs controlled fermentation — capturing ambient microbes vs using commercial cultures",
      "The SCOBY — the symbiotic culture of bacteria and yeast in kombucha and its microbiology",
      "Lacto-fermentation chemistry — how Lactobacillus creates lactic acid and why pH matters",
    ],
    insiderTerm: "Lacto-Fermentation",
    insiderDefinition:
      "Fermentation by Lactobacillus bacteria that converts sugars to lactic acid — the process behind sauerkraut, kimchi, pickles, and yogurt, relying only on salt and anaerobic conditions.",
  },
  "cooking-club": {
    nicheLabel: "Regional Cuisine Anthropology",
    description:
      "Cooking clubs that go deep treat meals as anthropological study — tracing how geography, trade routes, and colonialism shaped regional cuisines. A Sichuan meal explores the trade routes that brought chili peppers from the Americas to China; an Oaxacan feast unpacks pre-Columbian mole traditions.",
    rabbitHoles: [
      "How chili peppers traveled from the Americas to become essential in Asian cuisine",
      "The Columbian Exchange — the global food remapping triggered by 1492",
      "Regional Italian — why Lombardy, Sicily, and Emilia-Romagna are effectively different cuisines",
    ],
    insiderTerm: "Mise en Place",
    insiderDefinition:
      "The prep discipline of having everything ready before cooking begins — in a cooking club context, dividing mise en place among members is the key coordination challenge.",
  },
  "language-learning": {
    nicheLabel: "Input Hypothesis & Spaced Repetition Systems",
    description:
      "Stephen Krashen's Input Hypothesis argues that comprehensible input (i+1 — slightly above current level) is the only mechanism for acquisition. Serious learners build Anki decks using spaced repetition, mine sentences from native content, and track hours logged toward the FSI's 600–2200 hour estimates.",
    rabbitHoles: [
      "Krashen's Input Hypothesis — why comprehensible input is different from studying grammar",
      "Spaced repetition systems (SRS) — the forgetting curve and optimal review intervals",
      "FSI language difficulty ratings — how many hours the US government estimates each language takes",
    ],
    insiderTerm: "i+1",
    insiderDefinition:
      "Krashen's notation for input at the right level — 'i' is current competence, '+1' is the next stage of complexity. Input must be mostly understood but slightly challenging to drive acquisition.",
  },
  philosophy: {
    nicheLabel: "Modal Logic & Philosophy of Mind",
    description:
      "Analytic philosophy uses symbolic logic to formalize arguments — Kripke's possible worlds semantics made modal logic (necessity and possibility) rigorous. Philosophy of mind debates whether consciousness is reducible to physical processes (physicalism) or requires irreducible qualia (the hard problem).",
    rabbitHoles: [
      "The hard problem of consciousness — why explaining neural correlates doesn't explain why there's something it's like to see red",
      "Kripke's possible worlds — how modal logic formalizes necessity and possibility",
      "The trolley problem and its variants — why they reveal genuine moral intuition conflicts",
    ],
    insiderTerm: "Qualia",
    insiderDefinition:
      "The subjective, first-person character of conscious experience — what it's 'like' to see red, feel pain, or hear a note. Central to the hard problem of consciousness.",
  },
  journaling: {
    nicheLabel: "Morning Pages & The Proprioceptive Method",
    description:
      "Julia Cameron's Morning Pages (3 longhand pages, unfiltered, daily) are a creative unblocking practice. The Proprioceptive Writing method asks writers to pause and ask 'What do I mean by that?' — following language into the body's knowledge rather than the mind's narrative.",
    rabbitHoles: [
      "Morning Pages — Julia Cameron's method and the research on expressive writing's psychological benefits",
      "The Proprioceptive Writing method — Linda Trichter Metcalf's technique for writing through resistance",
      "Bullet journaling as systems design — how Ryder Carroll's method differs from freewriting",
    ],
    insiderTerm: "Proprioceptive Question",
    insiderDefinition:
      "The core prompt of the Proprioceptive Writing method: 'What do I mean by [word]?' — used to follow language into emotional truth beneath surface meaning.",
  },
  meditation: {
    nicheLabel: "Jhana States & Contemplative Neuroscience",
    description:
      "Advanced meditators in the Theravada tradition cultivate jhanas — eight progressively refined concentration states mapped by the Visuddhimagga. Contemplative neuroscience (Richard Davidson, Judson Brewer) studies how meditation changes default mode network activity and craving circuits.",
    rabbitHoles: [
      "The jhana states — the eight levels of meditative absorption in Theravada tradition",
      "Default mode network deactivation — what neuroscience shows happens in experienced meditators",
      "Mahamudra and Dzogchen — Tibetan approaches to recognizing awareness itself",
    ],
    insiderTerm: "Jhana",
    insiderDefinition:
      "A deep meditative absorption state in the Theravada tradition, characterized by sustained attention, joy, and equanimity — there are eight progressive jhanas, each more refined.",
  },
  investing: {
    nicheLabel: "Factor Investing & Portfolio Construction",
    description:
      "Beyond index funds lies factor investing — tilting portfolios toward value, small-cap, momentum, and profitability factors with documented risk premiums. Modern Portfolio Theory's efficient frontier, Sharpe ratio optimization, and the debate between market-cap weighting and factor weighting occupy serious investors.",
    rabbitHoles: [
      "The Fama-French three-factor model — value and size premiums beyond the market factor",
      "Sharpe ratio and risk-adjusted returns — why raw returns are meaningless without volatility context",
      "The permanent portfolio and all-weather allocation — Harry Browne's and Ray Dalio's approaches",
    ],
    insiderTerm: "Sharpe Ratio",
    insiderDefinition:
      "Return minus risk-free rate, divided by standard deviation — measures how much return you're getting per unit of risk. A Sharpe above 1.0 is generally considered good.",
  },
  genealogy: {
    nicheLabel: "DNA Genealogy & Genetic Genealogy",
    description:
      "Genetic genealogists use autosomal DNA (AncestryDNA, 23andMe) to identify cousins and triangulate shared ancestors. Y-DNA traces the paternal line unchanged across generations; mtDNA traces the maternal line. Chromosome browsers map exactly which segments you share with matches.",
    rabbitHoles: [
      "Autosomal vs Y-DNA vs mtDNA — what each test reveals and what it can't",
      "The WATO tool (What Are The Odds?) — probabilistic modeling of how DNA matches are related",
      "Genetic genealogy ethics — the privacy implications of cousin matching and unexpected discoveries",
    ],
    insiderTerm: "Endogamy",
    insiderDefinition:
      "Marriage within a community over generations — causes DNA matches to appear more closely related than they are, because the same ancestors appear on multiple genealogical lines.",
  },
  surfing: {
    nicheLabel: "Surf Forecasting & Wave Science",
    description:
      "Experienced surfers read swells by period, height, and direction using Surfline or Windguru. They understand how bathymetry shapes reef breaks vs beach breaks, track groundswell vs wind swell, and time sessions around tide windows.",
    rabbitHoles: [
      "Swell period vs height — why a 12-second swell at 4ft beats a 6-second swell at 6ft",
      "Reading surf forecasts on Surfline and Windguru — the variables that matter",
      "Pipeline, Teahupo'o, and Jaws — the world's most dangerous and iconic breaks",
    ],
    insiderTerm: "Groundswell",
    insiderDefinition:
      "A swell generated by distant storms with long period (10s+), producing organized, powerful waves — opposite of choppy wind swell.",
  },
};
