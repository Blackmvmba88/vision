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

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

  const exportCustomAliases = () => {
    const stamp = new Date().toISOString().replaceAll(":", "-");
    const payload = {
      exportedAt: new Date().toISOString(),
      aliases: customAliases,
    };
    downloadTextFile(`vision-custom-aliases-${stamp}.json`, JSON.stringify(payload, null, 2));
  };

  const importCustomAliases = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as { aliases?: ObjectAliasRegistry } | ObjectAliasRegistry;
    const aliases = "aliases" in parsed ? parsed.aliases : parsed;

    if (!aliases || typeof aliases !== "object" || Array.isArray(aliases)) {
      throw new Error("Custom alias import must be a JSON object or include an aliases object.");
    }

    setCustomAliases(aliases);
  };

  return {
    customAliases,
    setCustomAlias,
    removeCustomAlias,
    clearCustomAliases,
    exportCustomAliases,
    importCustomAliases,
  };
}
