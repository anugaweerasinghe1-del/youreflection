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

// 40 carefully written prompts — thoughtful, non-clinical, non-judgemental.
export const QUESTIONS: Question[] = [
  // Identity
  { id: "identity_notice", category: "Identity", type: "text",
    prompt: "What is something you wish people noticed about you beyond your appearance?",
    placeholder: "Take your time." },
  { id: "identity_word", category: "Identity", type: "text",
    prompt: "If a friend had to describe you in one honest word, what would you want it to be?" },
  { id: "identity_child", category: "Identity", type: "text",
    prompt: "What is one thing about you now that would surprise the child you used to be?" },

  // Appearance
  { id: "appearance_mirror", category: "Appearance", type: "scale",
    prompt: "How gently do you speak to yourself in the mirror?",
    min: 1, max: 10, minLabel: "Rarely gentle", maxLabel: "Almost always gentle" },
  { id: "appearance_feature", category: "Appearance", type: "text",
    prompt: "Is there a part of your body you've quietly made peace with? Or one you'd still like to?" },
  { id: "appearance_photo", category: "Appearance", type: "choice",
    prompt: "When you see yourself in an unposed photo, your first reaction is usually…",
    options: ["Warmth", "Neutral", "A small critique", "A loud one"] },

  // Confidence
  { id: "confidence_room", category: "Confidence", type: "text",
    prompt: "When you walk into a room of strangers, what quietly runs through your head?" },
  { id: "confidence_scale", category: "Confidence", type: "scale",
    prompt: "How often do you trust your own judgement without needing outside approval?",
    min: 1, max: 10, minLabel: "Rarely", maxLabel: "Almost always" },
  { id: "confidence_moment", category: "Confidence", type: "text",
    prompt: "Describe a small moment recently when you were quietly proud of yourself." },

  // Comparison
  { id: "comparison_last", category: "Comparison", type: "text",
    prompt: "When was the last time someone else's life made you question your own?" },
  { id: "comparison_who", category: "Comparison", type: "text",
    prompt: "Who do you find yourself comparing yourself to most often, and why do you think that is?" },
  { id: "comparison_scale", category: "Comparison", type: "scale",
    prompt: "How much of your self-worth is measured against other people?",
    min: 1, max: 10, minLabel: "Not much", maxLabel: "A great deal" },

  // Relationships
  { id: "relationships_seen", category: "Relationships", type: "text",
    prompt: "Who in your life makes you feel most seen — and what do they do that others don't?" },
  { id: "relationships_hide", category: "Relationships", type: "text",
    prompt: "Is there something about you that you hide from the people closest to you?" },
  { id: "relationships_recent", category: "Relationships", type: "choice",
    prompt: "Lately, most of your relationships feel…",
    options: ["Nourishing", "Steady", "One-sided", "Distant"] },

  // Self-worth
  { id: "worth_belief", category: "Self-worth", type: "scale",
    prompt: "How much do you believe you're already worthy — before you achieve anything else?",
    min: 1, max: 10, minLabel: "Not really", maxLabel: "Deeply" },
  { id: "worth_criticism", category: "Self-worth", type: "text",
    prompt: "What is a criticism from your past that you're still quietly carrying?" },
  { id: "worth_compliment", category: "Self-worth", type: "text",
    prompt: "What is a compliment you've received that you didn't quite let yourself believe?" },

  // Purpose
  { id: "purpose_alive", category: "Purpose", type: "text",
    prompt: "What makes you feel most alive — even if it doesn't make sense to anyone else?" },
  { id: "purpose_regret", category: "Purpose", type: "text",
    prompt: "If nothing changed for the next five years, what would you regret most?" },
  { id: "purpose_meaning", category: "Purpose", type: "choice",
    prompt: "Right now, meaning in your life feels…",
    options: ["Clear", "Emerging", "Uncertain", "Missing"] },

  // Kindness
  { id: "kindness_self", category: "Kindness", type: "scale",
    prompt: "How kind are you to yourself when you make a mistake?",
    min: 1, max: 10, minLabel: "Harsh", maxLabel: "Very kind" },
  { id: "kindness_others", category: "Kindness", type: "text",
    prompt: "What is a small act of kindness — given or received — that has stayed with you?" },

  // Growth
  { id: "growth_ago", category: "Growth", type: "text",
    prompt: "How is the version of you today different from the version of you two years ago?" },
  { id: "growth_becoming", category: "Growth", type: "text",
    prompt: "Who are you quietly trying to become?" },
  { id: "growth_scale", category: "Growth", type: "scale",
    prompt: "How much do you believe you can still change?",
    min: 1, max: 10, minLabel: "Not much", maxLabel: "Completely" },

  // Dreams
  { id: "dreams_secret", category: "Dreams", type: "text",
    prompt: "What is a dream you've never said out loud — not even to yourself?" },
  { id: "dreams_scared", category: "Dreams", type: "text",
    prompt: "What would you attempt if you were sure no one would judge the outcome?" },

  // Social Media
  { id: "social_scroll", category: "Social Media", type: "choice",
    prompt: "After a long scroll, you usually feel…",
    options: ["Inspired", "Neutral", "A little heavier", "Not enough"] },
  { id: "social_pretend", category: "Social Media", type: "scale",
    prompt: "How much of what you post reflects how you actually feel?",
    min: 1, max: 10, minLabel: "Very little", maxLabel: "Almost all of it" },
  { id: "social_hide", category: "Social Media", type: "text",
    prompt: "What part of your life do you keep off the internet, and why?" },

  // Self-Compassion
  { id: "compassion_voice", category: "Self-Compassion", type: "text",
    prompt: "When your inner voice speaks to you, whose voice does it sound like?" },
  { id: "compassion_friend", category: "Self-Compassion", type: "text",
    prompt: "What would you say to a friend going through exactly what you're going through right now?" },
  { id: "compassion_permission", category: "Self-Compassion", type: "text",
    prompt: "What is one thing you rarely give yourself permission to feel?" },

  // Inner life / reflection
  { id: "inner_quiet", category: "Identity", type: "text",
    prompt: "What does silence feel like to you — comforting, uneasy, or something else?" },
  { id: "inner_repeat", category: "Self-worth", type: "text",
    prompt: "What is a sentence you tell yourself often that might not actually be true?" },
  { id: "inner_forgive", category: "Self-Compassion", type: "text",
    prompt: "Is there something you've been meaning to forgive yourself for?" },
  { id: "inner_enough", category: "Self-worth", type: "scale",
    prompt: "In this moment, how enough do you feel — exactly as you are?",
    min: 1, max: 10, minLabel: "Not enough", maxLabel: "Completely enough" },
  { id: "inner_leave", category: "Growth", type: "text",
    prompt: "What is one thing you would like to leave behind before this year ends?" },
];
