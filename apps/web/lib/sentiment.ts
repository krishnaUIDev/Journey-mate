/**
 * Simple local sentiment analyzer for Journey-Mate Guest Book.
 * Provides emoji suggestions based on reflection content without cloud LLM dependencies.
 */

const EMOJI_MAP: Record<string, string[]> = {
    "💖": ["love", "heart", "amazing", "wonderful", "special", "happy", "great", "best", "grateful", "thanks", "thank", "sweet", "lovely", "kindness"],
    "🤝": ["help", "assisted", "together", "kind", "mate", "friend", "support", "care", "compassion", "companion", "helped", "team", "safe", "safely"],
    "✈️": ["flight", "trip", "travel", "plane", "airport", "journey", "fly", "gate", "boarding", "terminal", "takeoff", "landing", "flighty", "flying"],
    "☕": ["food", "eat", "drink", "coffee", "meal", "hungry", "delicious", "cafe", "breakfast", "dinner", "lunch", "snack", "tasty", "latte"],
    "📸": ["photo", "captured", "moment", "view", "camera", "picture", "memory", "beautiful", "scenic", "watch", "recorded", "snapshot", "landscape"],
    "🌏": ["world", "adventure", "explore", "global", "traveling", "destination", "visit", "landscape", "culture", "across", "international", "continent"],
    "✨": ["magic", "unforgettable", "shine", "sparkle", "dream", "perfect", "vibe", "inspiring", "wow", "holy", "brilliant", "awesome", "vibes"]
};

export function suggestEmoji(text: string): string {
    const words = text.toLowerCase().split(/\W+/);
    const scores: Record<string, number> = {};

    for (const [emoji, keywords] of Object.entries(EMOJI_MAP)) {
        scores[emoji] = 0;
        for (const word of words) {
            if (keywords.includes(word)) {
                scores[emoji]++;
            }
        }
    }

    // Sort by score descending and return the top emoji
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

    // Default to sparkle if no keywords match or score is 0
    if (sorted.length === 0 || (sorted[0]?.[1] ?? 0) === 0) return "✨";

    return sorted[0]?.[0] ?? "✨";
}

const DRAFT_TEMPLATES = [
    "So grateful for the compassion and help during this trip. Truly a beautiful experience! 🤝",
    "This journey was unforgettable! The views and the company made it magic. ✨",
    "Amazing travel companion! Everything went so smoothly, from takeoff to landing. ✈️",
    "Loved exploring together. Every moment was a core memory captured in time. 🌏",
    "Truly grateful for the support and the great vibes. Couldn't have asked for a better trip! 💖",
    "Such a wonderful experience sharing this journey. Looking forward to the next adventure! 📸",
    "Magic moments and great coffee—this trip had it all. Thanks for the memories! ☕"
];

export function generateDraft(): string {
    const randomIndex = Math.floor(Math.random() * DRAFT_TEMPLATES.length);
    return DRAFT_TEMPLATES[randomIndex] ?? "Perfect trip with amazing vibes! ✨";
}
