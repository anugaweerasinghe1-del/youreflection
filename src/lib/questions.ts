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

// 15 carefully written prompts — thoughtful, non-clinical, non-judgemental.
// Balanced for completion: quick choices and scales first, with a few meaningful written reflections.
export const QUESTIONS: Question[] = [
  { id: "identity_notice", category: "Identity", type: "text",
    prompt: "What is something you wish people noticed about you beyond your appearance?",
    placeholder: "A quality. A struggle. A quiet truth." },
  { id: "appearance_photo", category: "Appearance", type: "choice",
    prompt: "When you see yourself in an unposed photo, your first reaction is usually…",
    options: ["Warmth", "Neutral", "A small critique", "A loud one"] },
  { id: "appearance_mirror", category: "Appearance", type: "scale",
    prompt: "How gently do you speak to yourself in the mirror?",
    min: 1, max: 10, minLabel: "Rarely gentle", maxLabel: "Almost always gentle" },
  { id: "confidence_room", category: "Confidence", type: "choice",
    prompt: "When you enter a room of strangers, your mind first looks for…",
    options: ["Connection", "Safety", "Approval", "A way out"] },
  { id: "confidence_scale", category: "Confidence", type: "scale",
    prompt: "How often do you trust your own judgement without needing outside approval?",
    min: 1, max: 10, minLabel: "Rarely", maxLabel: "Almost always" },
  { id: "comparison_scroll", category: "Comparison", type: "choice",
    prompt: "After seeing other people's lives online, you usually feel…",
    options: ["Inspired", "Unaffected", "A little behind", "Not enough"] },
  { id: "comparison_scale", category: "Comparison", type: "scale",
    prompt: "How much of your self-worth is measured against other people?",
    min: 1, max: 10, minLabel: "Not much", maxLabel: "A great deal" },
  { id: "relationships_recent", category: "Relationships", type: "choice",
    prompt: "Lately, most of your relationships feel…",
    options: ["Nourishing", "Steady", "One-sided", "Distant"] },
  { id: "relationships_seen", category: "Relationships", type: "text",
    prompt: "Who makes you feel most seen — and what do they notice?",
    placeholder: "No names needed. Just what they make room for." },
  { id: "worth_belief", category: "Self-worth", type: "scale",
    prompt: "How much do you believe you're already worthy — before you achieve anything else?",
    min: 1, max: 10, minLabel: "Not really", maxLabel: "Deeply" },
  { id: "worth_inner_sentence", category: "Self-worth", type: "text",
    prompt: "What is a sentence you tell yourself often that might not actually be true?",
    placeholder: "Write the sentence exactly as it appears." },
  { id: "purpose_meaning", category: "Purpose", type: "choice",
    prompt: "Right now, meaning in your life feels…",
    options: ["Clear", "Emerging", "Uncertain", "Missing"] },
  { id: "growth_becoming", category: "Growth", type: "text",
    prompt: "Who are you quietly trying to become?",
    placeholder: "A version of you, not a performance." },
  { id: "compassion_friend", category: "Self-Compassion", type: "choice",
    prompt: "If a friend spoke to themselves the way you speak to yourself, you would feel…",
    options: ["Proud", "Protective", "Concerned", "Heartbroken"] },
  { id: "compassion_permission", category: "Self-Compassion", type: "text",
    prompt: "What is one thing you rarely give yourself permission to feel?",
    placeholder: "Keep it simple." },
];
