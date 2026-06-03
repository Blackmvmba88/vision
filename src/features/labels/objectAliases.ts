export type ObjectAlias = {
  canonicalName: string;
  displayName: string;
  spanishName: string;
  systemRole: string;
};

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

export function getObjectAlias(className: string): ObjectAlias {
  const normalizedName = className.trim().toLowerCase();

  return (
    aliases[normalizedName] ?? {
      canonicalName: normalizedName,
      displayName: className,
      spanishName: className,
      systemRole: "observed object",
    }
  );
}

export function formatObjectLabel(className: string) {
  const alias = getObjectAlias(className);
  return `${alias.displayName} · ${alias.spanishName}`;
}
