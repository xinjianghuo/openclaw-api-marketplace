# GitHub Project Automator - Rules Reference

## Triggers

| Trigger | Description |
|---------|-------------|
| `issue.opened` | When a new issue is created |
| `issue.closed` | When an issue is closed |
| `pr.opened` | When a new PR is created |
| `pr.merged` | When a PR is merged |
| `cron.daily` | Runs every day (via OpenClaw cron) |
| `cron.weekly` | Runs weekly |

## Conditions

Syntax: `<field> <operator> <value>`

**Fields**: `issue.title`, `issue.body`, `issue.labels`, `issue.created_at`, `issue.updated_at`, `pr.*`

**Operators**:
- `contains` - substring match (case-insensitive)
- `==` - exact match
- `>` / `<` - numeric/date comparison
- `starts_with` - prefix match

**Examples**:
```yaml
if: "issue.body contains 'bug'"
if: "issue.created_at < 7.days.ago"
if: "issue.labels contains 'triage'"
```

## Actions

### Label
```yaml
- label: "bug"
  if: "issue.body contains 'error'"
```

### Assign
```yaml
- assign: "maintainer"
  if: "issue.title contains '[ urgent ]'"
```

### Close Issue
```yaml
- close_issue:
    if: "issue.updated_at < 30.days.ago && issue.state == 'open'"
    comment: "Closing due to inactivity. Reopen if still relevant."
```

### Send Report
```yaml
- send_report:
    to: "#project-alerts"
    template: "weekly-summary"
```

## Templates

Built-in templates:
- `weekly-summary` - Open issues, PRs, contributor stats
- `health-score` - Project health metrics (1-100)

---

*More actions (auto-merge, milestone assignment) coming in v1.1.*
