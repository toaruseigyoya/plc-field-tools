import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index exposes the workbench and all five tools", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="tool-tabs"/);
  assert.match(html, /data-tool="io"/);
  assert.match(html, /data-tool="tags"/);
  assert.match(html, /data-tool="subnet"/);
  assert.match(html, /data-tool="alarms"/);
  assert.match(html, /data-tool="notes"/);
});

test("app imports the tested utility module", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.match(app, /from "\.\/tools\.js"/);
  assert.match(app, /normalizeIoList/);
  assert.match(app, /calculateSubnet/);
});

test("app handles clipboard write failures without crashing the workbench", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.match(app, /try\s*{/);
  assert.match(app, /Copy failed/);
});

test("README positions the project as offline-first OSS", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /offline-first/i);
  assert.match(readme, /GitHub Pages/i);
  assert.match(readme, /MIT/i);
});

test("Pages workflow can enable Pages on a new repository", async () => {
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

  assert.match(workflow, /enablement:\s*true/);
});
