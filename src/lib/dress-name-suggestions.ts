const CATEGORY_NAMES: Record<string, string[]> = {
  "Robe de soirée": ["Éclat", "Étoile", "Prestige", "Légende", "Divine", "Aura", "Harmonie", "Splendeur"],
  "Robe de cocktail": ["Chérie", "Muse", "Viva", "Allure", "Belle", "Lola", "Diva", "Esprit"],
  "Robe de mariée": ["Éternelle", "Promesse", "Idylle", "Grâce", "Aurore", "Féerie", "Évidence", "Romance"],
  "Robe demoiselle d'honneur": ["Douceur", "Mélodie", "Flore", "Symphonie", "Poésie", "Rosalie", "Tendresse", "Harmonie"],
};

const COLOR_THEMES = [
  { words: ["blanc", "blanche", "ivoire", "creme", "perle", "nacre"], names: ["Ivoire", "Perle", "Nacre", "Opale"] },
  { words: ["noir", "noire", "onyx", "ebene"], names: ["Minuit", "Onyx", "Éclipse", "Obsidienne"] },
  { words: ["rouge", "rubis", "bordeaux", "grenat", "carmin"], names: ["Rubis", "Grenat", "Flamme", "Carmin"] },
  { words: ["bleu", "bleue", "marine", "turquoise", "azur"], names: ["Saphir", "Azur", "Océan", "Lagon"] },
  { words: ["vert", "verte", "emeraude", "kaki", "sauge", "olive"], names: ["Émeraude", "Jade", "Sauge", "Oasis"] },
  { words: ["rose", "fuchsia", "corail", "saumon"], names: ["Pivoine", "Rosée", "Corail", "Rose"] },
  { words: ["or", "dore", "doree", "champagne", "jaune", "moutarde"], names: ["Or", "Ambre", "Soleil", "Champagne"] },
  { words: ["argent", "argente", "argentee", "gris", "grise"], names: ["Argent", "Cristal", "Platine", "Diamant"] },
  { words: ["violet", "violette", "mauve", "lilas", "prune", "lavande"], names: ["Améthyste", "Iris", "Lilas", "Orchidée"] },
  { words: ["beige", "nude", "sable", "marron", "brun", "brune", "taupe", "camel"], names: ["Sable", "Dune", "Moka", "Caramel"] },
  { words: ["orange", "cuivre", "cuivree", "terracotta"], names: ["Ambre", "Cuivre", "Corail", "Soleil"] },
];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

/** Naming ideas from the selected category and color, excluding existing names. */
export function getDressNameSuggestions(category: string, color: string, existingNames: string[]): string[] {
  const words = new Set(normalize(color).split(/[^a-z]+/));
  const matches = COLOR_THEMES.filter((theme) => theme.words.some((word) => words.has(word)));
  // Alternate themes for two-tone dresses (e.g. white and gold).
  const colorNames = Array.from({ length: 4 }, (_, index) => matches.map((theme) => theme.names[index])).flat();
  const themes = colorNames.length > 0
    ? colorNames
    : category === "Robe de mariée" ? ["Ivoire", "Perle", "Nacre", "Opale"] : ["Lune", "Solstice", "Mirage", "Lumière"];
  const names = CATEGORY_NAMES[category] ?? CATEGORY_NAMES["Robe de soirée"];
  const used = new Set(existingNames.map(normalize));
  const suggestions: string[] = [];
  for (let offset = 0; offset < themes.length; offset++) {
    names.forEach((name, index) => {
      const idea = `Robe ${name} ${themes[(index + offset) % themes.length]}`;
      const key = normalize(idea);
      if (!used.has(key)) {
        suggestions.push(idea);
        used.add(key);
      }
    });
  }
  return suggestions;
}
