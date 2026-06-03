import { describe, expect, it } from "vitest";
import { formatObjectLabel, getObjectAlias } from "./objectAliases";

describe("objectAliases", () => {
  it("maps COCO cell phone into the mobile node alias", () => {
    const alias = getObjectAlias("cell phone");

    expect(alias).toEqual({
      canonicalName: "cell phone",
      displayName: "Mobile Node",
      spanishName: "Celular nodo",
      systemRole: "temporary camera / control surface",
    });
  });

  it("formats a bilingual display label", () => {
    expect(formatObjectLabel("cell phone")).toBe("Mobile Node · Celular nodo");
  });

  it("falls back to the original class when no alias exists", () => {
    const alias = getObjectAlias("remote");

    expect(alias.displayName).toBe("remote");
    expect(alias.spanishName).toBe("remote");
    expect(alias.systemRole).toBe("observed object");
  });
});
