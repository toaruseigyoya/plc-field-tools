import {
  calculateSubnet,
  cleanAlarmCsv,
  formatSummary,
  normalizeIoList,
  notesToChecklist,
  validatePlcTags
} from "./tools.js";

const tools = {
  io: {
    title: "I/O list normalizer",
    label: "Raw I/O rows",
    sample: "X0, Emergency Stop, NC input\nY12 Pump Run Command\nM100\tManual mode latch",
    run: normalizeIoList
  },
  tags: {
    title: "PLC tag checker",
    label: "Address and tag rows",
    sample: "M100, PUMP_READY\nM101, pump ready\nM102, 123 bad name",
    run: validatePlcTags
  },
  subnet: {
    title: "Subnet helper",
    label: "CIDR input",
    sample: "192.168.10.25/24",
    run: calculateSubnet
  },
  alarms: {
    title: "Alarm CSV cleaner",
    label: "Alarm CSV rows",
    sample: "code,message,severity\nA-2,Door open,warning\nA-1,E-stop active,critical\nA-2,Door open,warning",
    run: cleanAlarmCsv
  },
  notes: {
    title: "Field note checklist",
    label: "Field notes",
    sample: "Check E-stop loop before energizing.\nNeed laptop, USB cable, and drawings.\nVerify pump rotation after trial run.\nRemember to back up PLC program first.",
    run: notesToChecklist
  }
};

const state = {
  activeTool: "io",
  lastResult: null
};

const elements = {
  title: document.querySelector("#tool-title"),
  tabs: Array.from(document.querySelectorAll("[data-tool]")),
  inputLabel: document.querySelector("#input-label"),
  input: document.querySelector("#tool-input"),
  output: document.querySelector("#tool-output"),
  warnings: document.querySelector("#warnings"),
  summary: document.querySelector("#summary"),
  sampleButton: document.querySelector("#sample-button"),
  runButton: document.querySelector("#run-button"),
  clearButton: document.querySelector("#clear-button"),
  copyButton: document.querySelector("#copy-button"),
  downloadButton: document.querySelector("#download-button")
};

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTool(tab.dataset.tool));
});

elements.sampleButton.addEventListener("click", () => {
  elements.input.value = tools[state.activeTool].sample;
  runActiveTool();
});

elements.runButton.addEventListener("click", runActiveTool);

elements.clearButton.addEventListener("click", () => {
  elements.input.value = "";
  state.lastResult = null;
  elements.output.textContent = "";
  elements.summary.textContent = "Ready";
  renderWarnings([]);
});

elements.copyButton.addEventListener("click", async () => {
  const text = getOutputText();
  if (!text) {
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    elements.summary.textContent = "Copied result";
  } catch {
    elements.summary.textContent = "Copy failed";
  }
});

elements.downloadButton.addEventListener("click", () => {
  const text = state.lastResult?.csv || getOutputText();
  if (!text) {
    return;
  }
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.activeTool}-result.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

activateTool("io");

function activateTool(toolKey) {
  const tool = tools[toolKey];
  state.activeTool = toolKey;
  state.lastResult = null;
  elements.title.textContent = tool.title;
  elements.inputLabel.textContent = tool.label;
  elements.input.value = tool.sample;
  elements.output.textContent = "";
  elements.summary.textContent = "Ready";
  renderWarnings([]);

  elements.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tool === toolKey);
  });
}

function runActiveTool() {
  const result = tools[state.activeTool].run(elements.input.value);
  state.lastResult = result;
  elements.output.textContent = result.text || result.csv || "";
  elements.summary.textContent = result.summary ? formatSummary(result.summary) : (result.ok === false ? "Invalid input" : "Complete");
  renderWarnings(result.warnings || []);
}

function renderWarnings(warnings) {
  elements.warnings.innerHTML = "";
  warnings.forEach((warning) => {
    const div = document.createElement("div");
    div.textContent = warning;
    elements.warnings.append(div);
  });
}

function getOutputText() {
  return elements.output.textContent.trim();
}
