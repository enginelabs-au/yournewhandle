export type FootprintLink = {
  label: string;
  url: string;
};

export function buildFootprintLinks(handle: string): FootprintLink[] {
  const encoded = encodeURIComponent(handle);
  const quoted = encodeURIComponent(`"${handle}"`);

  return [
    {
      label: "Google",
      url: `https://www.google.com/search?q=${quoted}`,
    },
    {
      label: "DuckDuckGo",
      url: `https://duckduckgo.com/?q=${quoted}`,
    },
    {
      label: "GitHub Code",
      url: `https://github.com/search?q=${encoded}&type=code`,
    },
  ];
}
