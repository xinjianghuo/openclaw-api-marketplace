# Hook Manifest

version: 1
type: skill
entry: scripts/run.js
compatibility:
  min_openclaw: "2026.3.0"
  max_openclaw: "2026.4.0"
permissions:
  - node:exec
  - system:cron
  - secrets:read
  - network:outbound
description: "ChurnBuster - Stripe payment failure recovery automation"
