/** Top common English words — exact-match rejection for brandable handles. */
export const COMMON_WORDS = new Set(
  [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "man", "world", "life", "hand", "part", "child", "eye", "woman", "place", "week",
    "case", "point", "company", "number", "group", "problem", "fact", "run",
    "cloud", "runner", "admin", "user", "test", "demo", "hello", "love", "home",
    "water", "fire", "earth", "wind", "light", "dark", "star", "moon", "sun", "sky",
    "cat", "dog", "bird", "fish", "tree", "flower", "house", "car", "book", "game",
    "music", "video", "photo", "mail", "phone", "apple", "google", "amazon", "meta",
    "blue", "red", "green", "black", "white", "gold", "silver", "king", "queen",
    "master", "legend", "hero", "magic", "power", "super", "mega", "ultra", "pro",
    "real", "true", "best", "top", "cool", "nice", "great", "happy", "free", "open",
    "close", "start", "stop", "play", "live", "dead", "fast", "slow", "big", "small",
    "hot", "cold", "hard", "soft", "high", "low", "old", "young", "long", "short",
    "name", "word", "line", "side", "head", "face", "body", "heart", "mind", "soul",
    "dream", "hope", "faith", "trust", "peace", "war", "art", "code", "data", "info",
    "net", "web", "link", "node", "core", "base", "hub", "lab", "dev", "tech",
    "crypto", "token", "coin", "cash", "bank", "shop", "store", "market", "trade",
    "team", "crew", "gang", "club", "zone", "space", "room", "door", "gate", "path",
    "road", "street", "city", "town", "land", "sea", "lake", "river", "hill", "mount",
    "rock", "stone", "sand", "snow", "rain", "storm", "wave", "flame", "spark", "flash",
    "ghost", "spirit", "angel", "demon", "dragon", "wolf", "bear", "lion", "tiger", "fox",
  ].map((w) => w.toLowerCase()),
);

export function isCommonWord(handle: string): boolean {
  return COMMON_WORDS.has(handle.toLowerCase());
}
