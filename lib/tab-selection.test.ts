import { describe, expect, it } from "vitest";
import { makeItem, reorderTabsPatch, type Kind } from "./tokens";

const tabs = [
  { icon: "home", label: "Home" },
  { icon: "search", label: "Search" },
  { icon: "favorite", label: "Saved" },
];

describe("selection when entries are reordered", () => {
  it.each<Kind>(["bottomNav", "navRail", "tabs"])("keeps the implicitly selected first destination in %s", (kind) => {
    const item = { ...makeItem(kind), tabs, actions: { "tab:0": { to: "home", transition: "fade" as const } } };
    expect(item.selected).toBeUndefined();
    const before = structuredClone(item);
    const patch = reorderTabsPatch(item, [1, 2, 0]);
    expect(patch.tabs?.[patch.selected ?? 0].label).toBe("Home");
    expect(patch.actions?.[`tab:${patch.selected ?? 0}`]?.to).toBe("home");
    expect(patch.selected).toBe(2);
    expect(item).toEqual(before);
    const restored = reorderTabsPatch({ ...item, ...patch }, [2, 0, 1]);
    expect(restored.tabs).toEqual(tabs);
    expect(restored.selected).toBe(0);
  });

  it.each<Kind>(["bottomNav", "navRail", "tabs", "select"])("keeps an explicitly selected destination in %s", (kind) => {
    const patch = reorderTabsPatch({ ...makeItem(kind), tabs, selected: 1 }, [1, 2, 0]);
    expect(patch.tabs?.[patch.selected!].label).toBe("Search");
    expect(patch.selected).toBe(0);
  });

  it.each<Kind>(["select", "splitButton", "toolbar", "fabMenu", "carousel"])("does not invent a selection for %s", (kind) => {
    const patch = reorderTabsPatch({ ...makeItem(kind), tabs }, [1, 2, 0]);
    expect(patch.selected).toBeUndefined();
    expect(patch.tabs?.map((tab) => tab.label)).toEqual(["Search", "Saved", "Home"]);
  });
});
