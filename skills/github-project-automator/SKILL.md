# GitHub Project Automator

**Type**: Developer Tools  
**Audience**: Open Source Maintainers, Small Dev Teams  
**Price**: $29/month  
**Tags**: github, automation, issues, pr, project-management, devops

---

## 🎯 What Problem Does This Solve?

Maintaining a GitHub project is time-consuming:
- Triage new issues (label, assign, comment)
- Enforce PR templates and checks
- Update project boards automatically
- Send reminders for stale issues
- Generate weekly reports

This skill automates all of that. It watches your GitHub repos and takes actions based on rules you define.

---

## ✨ Key Features

1. **Auto-Triage Issues** - Apply labels, assignees, and templates based on content
2. **PR Workflow** - Add reviews, request changes, merge when checks pass
3. **Project Board Sync** - Auto-move cards between columns (To Do → Doing → Done)
4. **Stale Management** - Warn/close inactive issues after X days
5. **Weekly Reports** - Summary email/message of project health
6. **Rule-Based** - YAML config, easy to customize

---

## 🚀 Quick Start

```bash
# Install from ClawHub
openclaw skill install github-project-automator

# Configure (edit config.yaml in skill data dir)
openclaw skill config github-project-automator

# Run once (dry-run to see actions)
openclaw skill run github-project-automator --dry-run

# Enable auto-run (every hour)
openclaw cron add "0 * * * *" "openclaw skill run github-project-automator"
```

---

## 📋 Sample Rules (config.json)

```json
{
  "repo": "your-org/your-repo",
  "github_token": "${GITHUB_TOKEN}",
  "rules": [
    {
      "name": "Auto-label new issues",
      "trigger": "issue.opened",
      "actions": [
        {
          "label": "triage",
          "if": "issue.body contains 'bug'"
        },
        {
          "label": "enhancement",
          "if": "issue.body contains 'feature'"
        }
      ]
    }
  ]
}
```

---

## 📊 What Can Be Automated?

| Area | Examples |
|------|----------|
| **Issues** | Labeling, assigning, closing stale, adding templates |
| **PRs** | Auto-merge when CI passes, request reviews, add labels |
| **Projects** | Move cards, add to milestones, update status |
| **Notifications** | Slack/Discord webhooks, email summaries |
| **Metrics** | Count open issues, contributor stats, health score |

---

## 💰 Pricing & Value

- **Cost**: $29/month per GitHub organization (unlimited repos)
- **Time saved**: ~5-10 hours/month for active projects
- **ROI**: 1-2 months payback for small teams

---

## 🔐 Security

- Uses GitHub personal access tokens (scoped to repo admin)
- Tokens stored in OpenClaw secrets (encrypted)
- No data leaves your infrastructure

---

## 🧪 Trial

First 7 days free. No credit card required.

---

## 📞 Support

- Issues: https://github.com/your-username/github-project-automator/issues
- Docs: `references/rules-reference.md`

---

**Ready?** `openclaw skill install github-project-automator`
