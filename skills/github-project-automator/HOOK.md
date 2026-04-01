# Hook Manifest

version: 1
type: skill
entry: scripts/automation.js
compatibility:
  min_openclaw: "2026.3.0"
  max_openclaw: "2026.4.0"
permissions:
  - node:exec
  - system:cron
  - secrets:read
description: "GitHub Project Automator - Auto-triage issues, PR workflows, and project board management"
