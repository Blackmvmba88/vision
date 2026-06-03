import { useEffect, useState } from "react";
import type { ObjectAliasRegistry } from "./objectAliases";

const STORAGE_KEY = "blackmamba-vision-custom-aliases";

function readStoredAliases(): ObjectAliasRegistry {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ObjectAliasRegistry;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeClassName(className: string) {
  return className.trim().toLowerCase();
}

export function useCustomAliases() {
  const [customAliases, setCustomAliases] = useState<ObjectAliasRegistry>(() => readStoredAliases());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customAliases));
  }, [customAliases]);

  const setCustomAlias = (className: string, displayName: string, spanishName: string, systemRole: string) => {
    const normalizedName = normalizeClassName(className);
    if (!normalizedName) return;

    setCustomAliases((previous) => ({
      ...previous,
      [normalizedName]: {
        displayName: displayName.trim() || previous[normalizedName]?.displayName || className,
        spanishName: spanishName.trim() || previous[normalizedName]?.spanishName || className,
        systemRole: systemRole.trim() || previous[normalizedName]?.systemRole || "custom observed object",
      },
    }));
  };

  const removeCustomAlias = (className: string) => {
    const normalizedName = normalizeClassName(className);
    setCustomAliases((previous) => {
      const next = { ...previous };
      delete next[normalizedName];
      return next;
    });
  };

  const clearCustomAliases = () => {
    setCustomAliases({});
  };

  return {
    customAliases,
    setCustomAlias,
    removeCustomAlias,
    clearCustomAliases,
  };
}
