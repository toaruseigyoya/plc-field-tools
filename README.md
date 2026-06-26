# PLC Field Tools

Offline-first browser tools for PLC and field engineering data cleanup.

PLC Field Tools is a static GitHub Pages app for small but repeated control engineering tasks: cleaning I/O lists, checking PLC tag names, calculating subnets, normalizing alarm CSV files, and turning field notes into checklists. Everything runs locally in the browser. No field data is uploaded.

## Demo

The app is designed for GitHub Pages:

```text
https://toaruseigyoya.github.io/plc-field-tools/
```

If the Pages site is not enabled yet, open `index.html` through a local static server:

```bash
python -m http.server 8080
```

## Tools

- I/O list normalizer: converts mixed address and description rows into consistent CSV.
- PLC tag checker: reports duplicate, missing, and invalid tag names.
- Subnet helper: calculates network, mask, usable range, broadcast, and host count.
- Alarm CSV cleaner: removes duplicate alarms and normalizes severity.
- Field note checklist: extracts actionable commissioning and maintenance items.

## Privacy

This is an offline-first tool. The app has no backend, no analytics, and no runtime network calls. It is suitable for sensitive factory and field data that should stay on the user's machine.

## Development

Requirements:

- Node.js 20 or newer

Run tests:

```bash
npm test
```

Run syntax checks:

```bash
npm run check
```

## Project status

This repository is intentionally small. The goal is to build useful, auditable utilities for field engineers and keep each tool simple enough for community review.

## License

MIT

