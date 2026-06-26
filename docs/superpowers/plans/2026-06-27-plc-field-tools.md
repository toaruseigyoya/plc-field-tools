# PLC Field Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish an offline-first OSS toolkit for PLC and field engineering data cleanup.

**Architecture:** A static HTML/CSS/JavaScript app backed by deterministic utility functions in `src/tools.js`. Tests use Node's built-in test runner and avoid external dependencies.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node `node:test`, GitHub Pages.

## Global Constraints

- All field data processing must run locally in the browser.
- No runtime package dependencies.
- Public repository must include README, MIT license, contribution guide, security policy, roadmap, and issue templates.
- UI must open on the usable tool workspace, not a marketing landing page.
- Tests must verify core data transformation behavior before completion.

---

### Task 1: Tested Core Utilities

**Files:**
- Create: `package.json`
- Create: `tests/tools.test.js`
- Create: `src/tools.js`

**Interfaces:**
- Produces: `normalizeIoList(input: string): object`
- Produces: `validatePlcTags(input: string): object`
- Produces: `calculateSubnet(cidr: string): object`
- Produces: `cleanAlarmCsv(input: string): object`
- Produces: `notesToChecklist(input: string): object`

- [ ] **Step 1: Write failing tests**

Use `node:test` to define behavior for all five exported functions.

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test`

Expected: FAIL because `src/tools.js` is missing.

- [ ] **Step 3: Implement utilities**

Implement pure functions with no DOM dependency and no network access.

- [ ] **Step 4: Run tests and confirm pass**

Run: `npm test`

Expected: all tests pass.

### Task 2: Static Workbench UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`

**Interfaces:**
- Consumes: functions exported from `src/tools.js`

- [ ] **Step 1: Create app shell**

Build a first-screen workbench with tool tabs, input panel, output panel, sample loading, copy, and download controls.

- [ ] **Step 2: Wire tools**

Call the tested utility functions from UI events and render structured results.

- [ ] **Step 3: Verify smoke checks**

Run: `npm run check`

Expected: JavaScript syntax checks pass.

### Task 3: OSS Documentation and Application Assets

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `ROADMAP.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/workflows/pages.yml`
- Create: `docs/codex-for-oss-application.md`

**Interfaces:**
- Produces: Public-facing project positioning and Codex for OSS form draft.

- [ ] **Step 1: Write README with demo, value, privacy, tools, and roadmap summary**
- [ ] **Step 2: Add contribution and security docs**
- [ ] **Step 3: Add GitHub Pages workflow**
- [ ] **Step 4: Draft Codex for OSS application answers within 500-character limits**

### Task 4: Verification and Publication

**Files:**
- Modify: all created files if review finds issues

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run check`**
- [ ] **Step 3: Review repository status and diff**
- [ ] **Step 4: Commit**
- [ ] **Step 5: Create public GitHub repository and push if authenticated**
- [ ] **Step 6: Open the Codex for OSS form and provide final submission instructions**

