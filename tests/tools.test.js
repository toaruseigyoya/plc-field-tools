import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateSubnet,
  cleanAlarmCsv,
  normalizeIoList,
  notesToChecklist,
  validatePlcTags
} from "../src/tools.js";

test("normalizeIoList converts mixed field rows into consistent CSV", () => {
  const input = [
    "X0, Emergency Stop, NC input",
    "Y12 Pump Run Command",
    "M100\tManual mode latch"
  ].join("\n");

  const result = normalizeIoList(input);

  assert.equal(result.rows.length, 3);
  assert.equal(result.rows[0].direction, "input");
  assert.equal(result.rows[1].tag, "PUMP_RUN_COMMAND");
  assert.match(result.csv, /address,direction,tag,description/);
  assert.match(result.csv, /Y12,output,PUMP_RUN_COMMAND/);
});

test("validatePlcTags reports duplicates and invalid names", () => {
  const input = [
    "M100, PUMP_READY",
    "M101, pump ready",
    "M102, 123 bad name"
  ].join("\n");

  const result = validatePlcTags(input);

  assert.equal(result.summary.total, 3);
  assert.equal(result.summary.duplicateTags, 1);
  assert.equal(result.issues.some((issue) => issue.type === "duplicate"), true);
  assert.equal(result.issues.some((issue) => issue.type === "invalid-name"), true);
});

test("calculateSubnet returns network, broadcast, mask, and usable range", () => {
  const result = calculateSubnet("192.168.10.25/24");

  assert.equal(result.network, "192.168.10.0");
  assert.equal(result.broadcast, "192.168.10.255");
  assert.equal(result.mask, "255.255.255.0");
  assert.equal(result.firstHost, "192.168.10.1");
  assert.equal(result.lastHost, "192.168.10.254");
  assert.equal(result.usableHosts, 254);
});

test("calculateSubnet warns for malformed CIDR input", () => {
  const result = calculateSubnet("192.168.10.999/33");

  assert.equal(result.ok, false);
  assert.equal(result.warnings.length > 0, true);
});

test("cleanAlarmCsv normalizes severity, removes duplicate alarms, and sorts", () => {
  const input = [
    "code,message,severity",
    "A-2,Door open,warning",
    "A-1,E-stop active,critical",
    "A-2,Door open,warning"
  ].join("\n");

  const result = cleanAlarmCsv(input);

  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].code, "A-1");
  assert.equal(result.rows[0].severity, "critical");
  assert.match(result.csv, /A-2,Door open,warning/);
});

test("notesToChecklist extracts actionable field work items", () => {
  const input = [
    "Check E-stop loop before energizing.",
    "Need laptop, USB cable, and drawings.",
    "Verify pump rotation after trial run.",
    "Remember to back up PLC program first."
  ].join("\n");

  const result = notesToChecklist(input);

  assert.equal(result.items.length, 4);
  assert.equal(result.items.some((item) => item.category === "safety"), true);
  assert.equal(result.items.some((item) => item.category === "backup"), true);
  assert.match(result.markdown, /- \[ \] Check E-stop loop before energizing./);
});

