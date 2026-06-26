# Contributing

Thanks for considering a contribution to PLC Field Tools.

## Scope

Good contributions are small, practical tools for PLC, controls, electrical design, commissioning, or maintenance work. The project avoids cloud processing and runtime dependencies unless there is a clear maintenance benefit.

## Local checks

Run these before opening a pull request:

```bash
npm test
npm run check
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```powershell
npm.cmd test
npm.cmd run check
```

## Pull requests

- Keep each pull request focused on one tool or one bug fix.
- Add or update tests for data transformation behavior.
- Keep field data examples fictional.
- Do not add analytics, tracking, or external upload behavior.

