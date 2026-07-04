export type Question =
  | { id: string; category: string; type: "text"; prompt: string; placeholder?: string }
  | {
      id: string;
      category: string;
      type: "choice";
      prompt: string;
      options: string[];
    }
  | {
      id: string;
      category: string;
      type: "scale";
      prompt: string;
      min: number;
      max: number;
      minLabel?: string;
      maxLabel?: string;
    };

// 15 prompts. Softer, more curious tone — less therapy, more conversation.
// IDs, categories, types, and any option string referenced by detectSignals()
// (`A loud one`, `Approval`, `Heartbroken`, `Concerned`, `Distant`,
// `One-sided`, `Missing`, `Uncertain`) are kept verbatim.
export const QUESTIONS: Question[] = [
  { id: "identity_notice", category: "Identity", type: "text",
    prompt: "What's something about you that people usually miss at first?",
    placeholder: "A quality, a habit, a small truth." },

  { id: "appearance_photo", category: "Appearance", type: "choice",
    prompt: "You catch yourself in a candid photo. Your first thought is…",
    options: ["Kind of like it", "Nothing much", "A small critique", "A loud one"] },

  { id: "appearance_mirror", category: "Appearance", type: "scale",
    prompt: "When you look in the mirror, how kind is your inner voice?",
    min: 1, max: 10, minLabel: "Rarely kind", maxLabel: "Almost always kind" },

  { id: "confidence_room", category: "Confidence", type: "choice",
    prompt: "You walk into a room full of strangers. You're mostly looking for…",
    options: ["Someone to connect with", "A quiet spot", "Approval", "The exit"] },

  { id: "confidence_scale", category: "Confidence", type: "scale",
    prompt: "How often do you trust your own call without checking with someone else?",
    min: 1, max: 10, minLabel: "Rarely", maxLabel: "Almost always" },

  { id: "comparison_scroll", category: "Comparison", type: "choice",
    prompt: "After a long scroll through other people's lives, you usually feel…",
    options: ["Inspired", "Pretty unaffected", "A little behind", "Not enough"] },

  { id: "comparison_scale", category: "Comparison", type: "scale",
    prompt: "How much do you measure yourself against other people?",
    min: 1, max: 10, minLabel: "Barely", maxLabel: "A lot" },

  { id: "relationships_recent", category: "Relationships", type: "choice",
    prompt: "Your close relationships lately feel mostly…",
    options: ["Nourishing", "Steady", "One-sided", "Distant"] },

  { id: "relationships_seen", category: "Relationships", type: "text",
    prompt: "Who makes you feel most yourself — and what do they seem to see?",
    placeholder: "No names needed." },

  { id: "worth_belief", category: "Self-worth", type: "scale",
    prompt: "How much do you feel you're already enough, before achieving anything more?",
    min: 1, max: 10, minLabel: "Not really", maxLabel: "Deeply" },

  { id: "worth_inner_sentence", category: "Self-worth", type: "text",
    prompt: "Is there a sentence you tell yourself a lot that might not actually be true?",
    placeholder: "Write it however it shows up." },

  { id: "purpose_meaning", category: "Purpose", type: "choice",
    prompt: "Right now, meaning in your life feels…",
    options: ["Clear", "Slowly forming", "Uncertain", "Missing"] },

  { id: "growth_becoming", category: "Growth", type: "text",
    prompt: "Who are you quietly working on becoming?",
    placeholder: "A version of you — not a performance." },

  { id: "compassion_friend", category: "Self-Compassion", type: "choice",
    prompt: "If a close friend talked to themselves the way you talk to yourself, you'd feel…",
    options: ["Proud of them", "Protective", "Concerned", "Heartbroken"] },

  { id: "compassion_permission", category: "Self-Compassion", type: "text",
    prompt: "What's one feeling you rarely let yourself have?",
    placeholder: "Keep it short if you want." },
];
