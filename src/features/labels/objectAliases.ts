export type ObjectAlias = {
  canonicalName: string;
  displayName: string;
  spanishName: string;
  systemRole: string;
};

export type ObjectAliasRegistry = Record<string, Partial<ObjectAlias>>;

const aliases: Record<string, ObjectAlias> = {
  "cell phone": {
    canonicalName: "cell phone",
    displayName: "Mobile Node",
    spanishName: "Celular nodo",
    systemRole: "temporary camera / control surface",
  },
  keyboard: {
    canonicalName: "keyboard",
    displayName: "Keyboard",
    spanishName: "Teclado",
    systemRole: "input device",
  },
  mouse: {
    canonicalName: "mouse",
    displayName: "Mouse",
    spanishName: "Mouse",
    systemRole: "pointer input device",
  },
  tv: {
    canonicalName: "tv",
    displayName: "Screen",
    spanishName: "Pantalla",
    systemRole: "visual output surface",
  },
  bottle: {
    canonicalName: "bottle",
    displayName: "Bottle",
    spanishName: "Botella",
    systemRole: "container object",
  },
  cup: {
    canonicalName: "cup",
    displayName: "Cup",
    spanishName: "Vaso / taza",
    systemRole: "container object",
  },
  book: {
    canonicalName: "book",
    displayName: "Book",
    spanishName: "Libro",
    systemRole: "knowledge object",
  },
};

function normalizeClassName(className: string) {
  return className.trim().toLowerCase();
}

function fallbackAlias(className: string): ObjectAlias {
  const normalizedName = normalizeClassName(className);

  return {
    canonicalName: normalizedName,
    displayName: className,
    spanishName: className,
    systemRole: "observed object",
  };
}

export function getObjectAlias(className: string, customAliases: ObjectAliasRegistry = {}): ObjectAlias {
  const normalizedName = normalizeClassName(className);
  const baseAlias = aliases[normalizedName] ?? fallbackAlias(className);
  const customAlias = customAliases[normalizedName];

  if (!customAlias) return baseAlias;

  return {
    canonicalName: customAlias.canonicalName ?? baseAlias.canonicalName,
    displayName: customAlias.displayName ?? baseAlias.displayName,
    spanishName: customAlias.spanishName ?? baseAlias.spanishName,
    systemRole: customAlias.systemRole ?? baseAlias.systemRole,
  };
}

export function formatObjectLabel(className: string, customAliases: ObjectAliasRegistry = {}) {
  const alias = getObjectAlias(className, customAliases);
  return `${alias.displayName} · ${alias.spanishName}`;
}
