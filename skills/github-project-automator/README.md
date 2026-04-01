# GitHub Project Automator

> Automate GitHub issue triage, PR workflows, and project board updates.

---

## 🚀 Installation

```bash
openclaw skill install github-project-automator
```

---

## ⚙️ Configuration

1. Create a GitHub Personal Access Token (classic) with `repo` scope.
2. Configure the skill:

```bash
openclaw skill config github-project-automator
```

This opens an editor for `config.yaml`:

```yaml
repo: "your-org/your-repo"
github_token: "${GITHUB_TOKEN}"  # stored in OpenClaw secrets

rules:
  - name: "Auto-label new issues"
    trigger: "issue.opened"
    actions:
      - label: "triage"
        if: "issue.body contains 'bug'"
      - label: "enhancement"
        if: "issue.body contains 'feature'"
```

---

## 🏃 Running

```bash
# Dry-run first (no changes)
openclaw skill run github-project-automator --dry-run

# Enable hourly automation
openclaw cron add "0 * * * *" "openclaw skill run github-project-automator"
```

---

## 📋 Sample Use Cases

- **Label issues** based on keywords (bug, feature, question)
- **Assign** to maintainers automatically
- **Close stale** issues after 30 days of inactivity
- **Weekly reports** sent to Slack/Discord
- **Auto-merge** PRs when CI passes and reviewers approve

---

## 💡 Tips

- Start with `--dry-run` to preview actions
- Use GitHub's API rate limits wisely (60min cache)
- Keep rules simple and test incrementally

---

## 🆘 Issues?

Report to: https://github.com/your-username/github-project-automator/issues

---

**Price**: $29/month | 7-day free trial
