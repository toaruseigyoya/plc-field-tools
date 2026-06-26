# PLC Field Tools Design

## Goal

Create a small, credible open-source web toolkit for control engineers and maintenance technicians who need to clean field data without uploading factory information to a third-party service.

## Audience

Primary users are PLC programmers, electrical designers, commissioning engineers, and maintenance staff working with I/O lists, alarm CSV files, IP settings, and field notes. The project is intentionally practical, offline-first, and easy to audit.

## Product Shape

The project ships as a static GitHub Pages app and a tested JavaScript utility library. All processing runs in the browser. No data is sent over the network. The first release includes five tools:

- I/O list normalizer
- PLC tag checker
- Subnet helper
- Alarm CSV cleaner
- Field note checklist builder

## Architecture

The app uses plain HTML, CSS, and ES modules. `src/tools.js` holds deterministic, testable functions. `src/app.js` handles UI state, sample data, tab switching, rendering, copy actions, and CSV downloads. `styles.css` defines a dense workbench interface suited to repeated engineering use.

## Design Direction

The interface should feel like a compact field engineering console rather than a marketing site. The first viewport opens directly into the tool workspace. The signature visual element is a left-side "terminal rail" that uses industrial labels and status indicators to make the project memorable without decorative noise.

Palette:

- Panel black: `#121416`
- Work surface: `#f4f6f4`
- Signal green: `#39a845`
- Warning amber: `#d98b20`
- Blueprint blue: `#2d5f8b`
- Wire red: `#c44536`

Type:

- UI/body: system sans-serif for high legibility
- Data/outputs: `Consolas`, `Cascadia Mono`, monospace
- Headings: compact, medium-weight sans-serif with normal letter spacing

## Data Flow

Each tool owns one input textarea, one primary action, one sample loader, and an output area. UI events call exported functions from `src/tools.js`. The functions return structured results with `rows`, `text`, `summary`, and `warnings` where appropriate. Rendering stays separate from parsing and validation.

## Error Handling

Invalid or empty input returns useful warnings instead of throwing. Subnet calculation returns a warning for malformed CIDR input. CSV tools tolerate commas, tabs, and repeated spaces. The UI displays warnings inline and keeps previous controls usable.

## Testing

Use Node's built-in test runner. Tests cover parsing, normalization, duplicate detection, subnet math, alarm cleanup, and checklist extraction. UI behavior is checked with static smoke checks because the project intentionally avoids runtime dependencies.

## OSS Positioning

The repository should read as a maintainable OSS project, not a throwaway demo. It includes README, MIT license, contribution guide, security policy, roadmap, issue templates, application draft, and GitHub Pages workflow.

