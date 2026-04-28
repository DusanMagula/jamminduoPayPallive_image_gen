import { describe, it, expect } from "vitest";
import { THEMES, buildLabelPrompt, type Theme } from "./buildLabelPrompt.js";

describe("THEMES", () => {
  const expectedIds = ["modern", "minimalist", "retro", "80s", "watercolour", "vintage", "bold-bright"];

  it("exports exactly seven themes", () => {
    expect(THEMES).toHaveLength(7);
  });

  it.each(expectedIds)("includes theme with id '%s'", (id) => {
    expect(THEMES.some((t) => t.id === id)).toBe(true);
  });

  it("each theme has id, label, and stylePrompt", () => {
    for (const theme of THEMES) {
      expect(typeof theme.id).toBe("string");
      expect(typeof theme.label).toBe("string");
      expect(typeof theme.stylePrompt).toBe("string");
      expect(theme.id.length).toBeGreaterThan(0);
      expect(theme.label.length).toBeGreaterThan(0);
      expect(theme.stylePrompt.length).toBeGreaterThan(0);
    }
  });
});

describe("buildLabelPrompt", () => {
  const modernTheme = THEMES.find((t) => t.id === "modern") as Theme;

  it("includes the theme stylePrompt in the output", () => {
    const prompt = buildLabelPrompt("strawberry fields", modernTheme);
    expect(prompt).toContain(modernTheme.stylePrompt);
  });

  it("includes the sanitised description in the output", () => {
    const prompt = buildLabelPrompt("strawberry fields", modernTheme);
    expect(prompt).toContain("strawberry fields");
  });

  it("includes the required instruction lines", () => {
    const prompt = buildLabelPrompt("blueberry hills", modernTheme);
    expect(prompt).toContain("Do not generate a jar, bottle, or any product packaging.");
    expect(prompt).toContain("Do not add any text or branding to the image.");
    expect(prompt).toContain("The image will be used purely as a label background");
    expect(prompt).toContain("Ensure rich, detailed decoration around the edges and corners.");
  });

  it.each(THEMES as unknown as Theme[])("works for theme '$id'", (theme) => {
    const prompt = buildLabelPrompt("summer berries", theme);
    expect(prompt).toContain(theme.stylePrompt);
    expect(prompt).toContain("summer berries");
  });

  it("handles empty description", () => {
    const prompt = buildLabelPrompt("", modernTheme);
    expect(prompt).toContain(modernTheme.stylePrompt);
    // prompt should still be valid — just an empty description segment
    expect(prompt).toContain("Do not add any text or branding to the image.");
  });

  it("trims whitespace from description", () => {
    const prompt = buildLabelPrompt("  berry patch  ", modernTheme);
    expect(prompt).toContain("berry patch");
    expect(prompt).not.toContain("  berry patch  ");
  });

  it("truncates description longer than 200 chars to exactly 200 chars", () => {
    const longDesc = "a".repeat(300);
    const prompt = buildLabelPrompt(longDesc, modernTheme);
    const truncated = "a".repeat(200);
    expect(prompt).toContain(truncated);
    expect(prompt).not.toContain("a".repeat(201));
  });

  it("strips backtick characters from description", () => {
    const desc = "fresh `berries` and `cream`";
    const prompt = buildLabelPrompt(desc, modernTheme);
    expect(prompt).not.toContain("`");
    expect(prompt).toContain("fresh berries and cream");
  });

  it("strips < > and ' characters from description", () => {
    const desc = "fresh <berries> it's great";
    const prompt = buildLabelPrompt(desc, modernTheme);
    expect(prompt).not.toContain("<");
    expect(prompt).not.toContain(">");
    expect(prompt).not.toContain("'");
  });
});
