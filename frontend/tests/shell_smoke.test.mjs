import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("reusable app shell structure exists", async () => {
  const appShell = await readFile(new URL("../components/shell/AppShell.tsx", import.meta.url), "utf8");
  const protectedShell = await readFile(new URL("../components/shell/ProtectedShell.tsx", import.meta.url), "utf8");
  const navConfig = await readFile(new URL("../config/navigation.ts", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const pageHeader = await readFile(new URL("../components/ui/PageHeader.tsx", import.meta.url), "utf8");
  const sectionHeader = await readFile(new URL("../components/ui/SectionHeader.tsx", import.meta.url), "utf8");

  assert.match(appShell, /sidebar/);
  assert.match(appShell, /topbar/);
  assert.match(appShell, /mobile-nav-btn/);
  assert.match(appShell, /aria-expanded/);
  assert.match(protectedShell, /Authentication required/);
  assert.match(navConfig, /appNavigation/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /\.primary-btn/);
  assert.match(pageHeader, /page-header/);
  assert.match(sectionHeader, /section-header/);
});
