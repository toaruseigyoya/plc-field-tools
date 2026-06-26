# Security Policy

## Supported versions

The current `main` branch is supported.

## Reporting a vulnerability

Please open a private security advisory on GitHub if available. If not, open an issue with only enough detail to describe the impact and request a private contact path.

## Project security model

PLC Field Tools is a static, offline-first browser app. It has no backend and no runtime network calls. Security-sensitive changes include:

- Any dependency addition
- Any network access
- Any file upload behavior
- Any clipboard behavior beyond explicit copy actions
- Any change that stores field data persistently

