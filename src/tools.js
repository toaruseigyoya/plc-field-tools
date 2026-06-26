const DIRECTION_PREFIXES = [
  { pattern: /^[XI]/i, direction: "input" },
  { pattern: /^[YQO]/i, direction: "output" },
  { pattern: /^[MBDRWT]/i, direction: "internal" }
];

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  warning: 2,
  medium: 3,
  low: 4,
  info: 5
};

export function normalizeIoList(input) {
  const warnings = [];
  const rows = getDataLines(input).map((line, index) => {
    const parts = splitFieldLine(line);
    const address = cleanCell(parts[0]);
    const description = cleanCell(parts.slice(1).join(" "));
    const direction = inferDirection(address);
    const tag = makeTagName(description || address);

    if (!address) {
      warnings.push(`Line ${index + 1}: missing address.`);
    }
    if (direction === "unknown") {
      warnings.push(`Line ${index + 1}: could not infer direction for "${address}".`);
    }

    return {
      line: index + 1,
      address,
      direction,
      tag,
      description
    };
  });

  const csv = toCsv(["address", "direction", "tag", "description"], rows.map((row) => [
    row.address,
    row.direction,
    row.tag,
    row.description
  ]));

  return {
    rows,
    csv,
    text: csv,
    warnings,
    summary: {
      total: rows.length,
      inputs: rows.filter((row) => row.direction === "input").length,
      outputs: rows.filter((row) => row.direction === "output").length,
      internal: rows.filter((row) => row.direction === "internal").length
    }
  };
}

export function validatePlcTags(input) {
  const rows = getDataLines(input).map((line, index) => {
    const parts = splitFieldLine(line);
    const address = cleanCell(parts[0]);
    const rawName = cleanCell(parts.slice(1).join(" "));
    const canonical = makeTagName(rawName || address);

    return {
      line: index + 1,
      address,
      rawName,
      canonical
    };
  });

  const issues = [];
  const seen = new Map();

  rows.forEach((row) => {
    if (!row.address) {
      issues.push(issue(row, "missing-address", "Missing device address."));
    }

    if (!row.rawName) {
      issues.push(issue(row, "missing-name", "Missing tag name."));
    } else if (!isValidTagName(row.rawName)) {
      issues.push(issue(row, "invalid-name", "Use letters, numbers, and underscores; do not start with a number."));
    }

    const previous = seen.get(row.canonical);
    if (previous) {
      issues.push({
        line: row.line,
        type: "duplicate",
        message: `Duplicate tag "${row.canonical}" also appears on line ${previous}.`,
        address: row.address,
        tag: row.canonical
      });
    } else if (row.canonical) {
      seen.set(row.canonical, row.line);
    }
  });

  const csv = toCsv(["line", "address", "tag", "issue", "message"], issues.map((row) => [
    row.line,
    row.address,
    row.tag || "",
    row.type,
    row.message
  ]));

  return {
    rows,
    issues,
    csv,
    text: issues.length ? csv : "No tag issues found.",
    warnings: [],
    summary: {
      total: rows.length,
      issues: issues.length,
      duplicateTags: issues.filter((row) => row.type === "duplicate").length,
      invalidNames: issues.filter((row) => row.type === "invalid-name").length
    }
  };
}

export function calculateSubnet(cidr) {
  const warnings = [];
  const match = String(cidr || "").trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);

  if (!match) {
    return invalidSubnet("Enter CIDR notation such as 192.168.10.25/24.");
  }

  const ip = parseIp(match[1]);
  const prefix = Number(match[2]);

  if (!ip.ok || prefix < 0 || prefix > 32) {
    return invalidSubnet("CIDR input has an invalid IP octet or prefix length.");
  }

  const ipInt = ip.value;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const usableHosts = prefix >= 31 ? 0 : Math.max(0, 2 ** (32 - prefix) - 2);
  const firstHost = usableHosts ? intToIp(network + 1) : intToIp(network);
  const lastHost = usableHosts ? intToIp(broadcast - 1) : intToIp(broadcast);

  return {
    ok: true,
    input: cidr,
    ip: match[1],
    prefix,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    mask: intToIp(mask),
    wildcard: intToIp((~mask) >>> 0),
    firstHost,
    lastHost,
    usableHosts,
    warnings,
    text: [
      `Network: ${intToIp(network)}/${prefix}`,
      `Mask: ${intToIp(mask)}`,
      `Wildcard: ${intToIp((~mask) >>> 0)}`,
      `Usable range: ${firstHost} - ${lastHost}`,
      `Broadcast: ${intToIp(broadcast)}`,
      `Usable hosts: ${usableHosts}`
    ].join("\n")
  };
}

export function cleanAlarmCsv(input) {
  const lines = getDataLines(input);
  const rows = [];
  const seen = new Set();
  const warnings = [];

  lines.forEach((line, index) => {
    if (index === 0 && looksLikeAlarmHeader(line)) {
      return;
    }

    const parts = splitCsvish(line);
    const code = cleanCell(parts[0]);
    const message = cleanCell(parts[1]);
    const severity = normalizeSeverity(cleanCell(parts[2]));

    if (!code || !message) {
      warnings.push(`Line ${index + 1}: skipped incomplete alarm row.`);
      return;
    }

    const key = `${code.toUpperCase()}|${message.toUpperCase()}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    rows.push({ code, message, severity });
  });

  rows.sort((a, b) => {
    const severityDiff = severityRank(a.severity) - severityRank(b.severity);
    return severityDiff || a.code.localeCompare(b.code, undefined, { numeric: true });
  });

  const csv = toCsv(["code", "message", "severity"], rows.map((row) => [
    row.code,
    row.message,
    row.severity
  ]));

  return {
    rows,
    csv,
    text: csv,
    warnings,
    summary: {
      total: rows.length,
      critical: rows.filter((row) => row.severity === "critical").length,
      warning: rows.filter((row) => row.severity === "warning").length
    }
  };
}

export function notesToChecklist(input) {
  const items = getDataLines(input).map((line, index) => {
    const text = line.replace(/^[-*]\s*/, "").trim();
    return {
      id: index + 1,
      text,
      category: categorizeNote(text)
    };
  }).filter((item) => item.text);

  const markdown = items.map((item) => `- [ ] ${item.text}`).join("\n");

  return {
    items,
    markdown,
    text: markdown,
    warnings: items.length ? [] : ["No checklist items found."],
    summary: {
      total: items.length,
      safety: items.filter((item) => item.category === "safety").length,
      backup: items.filter((item) => item.category === "backup").length,
      verification: items.filter((item) => item.category === "verification").length
    }
  };
}

export function formatSummary(summary = {}) {
  return Object.entries(summary)
    .map(([key, value]) => `${labelize(key)}: ${value}`)
    .join(" | ");
}

function getDataLines(input) {
  return String(input || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function splitFieldLine(line) {
  const csvParts = splitCsvish(line);
  if (csvParts.length > 1) {
    return csvParts;
  }

  const parts = line.trim().split(/\s+/);
  return [parts[0] || "", parts.slice(1).join(" ")];
}

function splitCsvish(line) {
  const delimiter = line.includes("\t") ? "\t" : ",";
  if (!line.includes(delimiter)) {
    return [line];
  }

  const result = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  result.push(current);
  return result;
}

function cleanCell(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function inferDirection(address) {
  const prefix = DIRECTION_PREFIXES.find((entry) => entry.pattern.test(address));
  return prefix ? prefix.direction : "unknown";
}

function makeTagName(value) {
  const base = String(value || "")
    .trim()
    .replace(/^[A-Z]+\d+[\s,_-]*/i, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  if (!base) {
    return "";
  }

  return /^\d/.test(base) ? `TAG_${base}` : base;
}

function isValidTagName(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(value || "").trim());
}

function issue(row, type, message) {
  return {
    line: row.line,
    type,
    message,
    address: row.address,
    tag: row.canonical
  };
}

function parseIp(value) {
  const octets = String(value).split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return { ok: false, value: 0 };
  }

  return {
    ok: true,
    value: (((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3]) >>> 0
  };
}

function intToIp(value) {
  const unsigned = value >>> 0;
  return [
    (unsigned >>> 24) & 255,
    (unsigned >>> 16) & 255,
    (unsigned >>> 8) & 255,
    unsigned & 255
  ].join(".");
}

function invalidSubnet(message) {
  return {
    ok: false,
    warnings: [message],
    text: message
  };
}

function looksLikeAlarmHeader(line) {
  const parts = splitCsvish(line).map((part) => part.trim().toLowerCase());
  return parts.includes("code") && parts.includes("message");
}

function normalizeSeverity(value) {
  const normalized = String(value || "info").toLowerCase();
  if (["critical", "crit", "emergency", "fatal"].includes(normalized)) {
    return "critical";
  }
  if (["warn", "warning", "caution"].includes(normalized)) {
    return "warning";
  }
  if (["high", "major"].includes(normalized)) {
    return "high";
  }
  if (["low", "minor"].includes(normalized)) {
    return "low";
  }
  return normalized || "info";
}

function severityRank(value) {
  return SEVERITY_ORDER[value] ?? 99;
}

function categorizeNote(text) {
  const lower = text.toLowerCase();
  if (/(e-stop|estop|emergency|lockout|safety|energiz)/.test(lower)) {
    return "safety";
  }
  if (/(backup|back up|save|restore|program)/.test(lower)) {
    return "backup";
  }
  if (/(verify|test|trial|check|confirm)/.test(lower)) {
    return "verification";
  }
  if (/(laptop|cable|drawing|tool|manual)/.test(lower)) {
    return "tools";
  }
  return "work";
}

function toCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function labelize(value) {
  return String(value).replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

