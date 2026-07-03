export type PlatformCategory =
  | "Popular"
  | "Social Media"
  | "Developer"
  | "Content & Blogging"
  | "Creative & Design"
  | "Music & Audio"
  | "Video & Streaming"
  | "Gaming"
  | "Professional"
  | "Community"
  | "Finance & Crypto"
  | "Messaging"
  | "Education & Learning"
  | "Photography"
  | "Marketplace"
  | "Fitness & Sports"
  | (string & {});

export type PlatformDefinition = {
  id: string;
  name: string;
  nickCheckrService: string;
  category: PlatformCategory;
  urlTemplate: string;
  visitUrl: string;
  wired: boolean;
  color: string;
  abbr: string;
  iconSlug?: string;
  popularity: number;
};
