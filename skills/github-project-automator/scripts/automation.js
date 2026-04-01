#!/usr/bin/env node
/**
 * GitHub Project Automator - Core Engine
 * Reads rules from config.yaml and executes automations via GitHub API
 */

const fs = require('fs');

// Load config (JSON, zero dependency)
const CONFIG_PATH = process.env.CONFIG_PATH || './config.json';

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('❌ Failed to load config.json:', e.message);
    console.log('   Hint: Create config.json with repo, github_token, and rules.');
    process.exit(1);
  }
}

function matchCondition(condition, context) {
  // Simple pattern matching: "field contains 'value'" or "field == value"
  const [field, op, value] = condition.split(' ');
  const ctxVal = context[field] || '';
  
  if (op === 'contains') {
    return ctxVal.toLowerCase().includes(value.toLowerCase());
  } else if (op === '==') {
    return ctxVal === value;
  } else if (op === '>') {
    return parseFloat(ctxVal) > parseFloat(value);
  } else if (op === 'starts_with') {
    return ctxVal.startsWith(value);
  }
  return false;
}

async function executeAction(action, context, github) {
  const { label, assign, close_issue, send_report } = action;
  
  if (label) {
    if (matchCondition(label.if, context)) {
      console.log(`   ➕ Adding label '${label}' to #${context.number}`);
      await github.addLabel(context.repo, context.type, context.number, label);
    }
  }
  
  if (assign) {
    if (matchCondition(assign.if, context)) {
      console.log(`   👤 Assigning ${assign.assign} to #${context.number}`);
      await github.assign(context.repo, context.type, context.number, assign.assign);
    }
  }
  
  if (close_issue) {
    if (matchCondition(close_issue.if, context)) {
      console.log(`   ❌ Closing #${context.number}: ${close_issue.comment}`);
      await github.closeIssue(context.repo, context.number, close_issue.comment);
    }
  }
  
  if (send_report) {
    console.log(`   📊 Sending ${send_report.template} report to ${send_report.to}`);
    await github.sendNotification(send_report.to, send_report.template, context);
  }
}

async function processRules(rules, context, github) {
  for (const rule of rules) {
    console.log(`🔍 Evaluating rule: ${rule.name}`);
    
    // Check trigger
    let triggered = false;
    if (rule.trigger === 'issue.opened' && context.type === 'issue' && context.action === 'opened') {
      triggered = true;
    } else if (rule.trigger === 'pr.opened' && context.type === 'pr' && context.action === 'opened') {
      triggered = true;
    } else if (rule.trigger === 'cron.daily' && context.trigger === 'cron' && context.schedule === 'daily') {
      triggered = true;
    } else if (rule.trigger === 'cron.weekly' && context.trigger === 'cron' && context.schedule === 'weekly') {
      triggered = true;
    }
    
    if (!triggered) continue;
    
    // Execute actions
    for (const action of rule.actions) {
      await executeAction(action, context, github);
    }
  }
}

// Mock GitHub client (replace with real octokit)
const github = {
  async addLabel(repo, type, number, label) {
    // POST /repos/{owner}/{repo}/issues/{issue_number}/labels
    console.log(`[MOCK] Added label ${label} to ${repo}#${number}`);
  },
  async assign(repo, type, number, assignee) {
    console.log(`[MOCK] Assigned ${assignee} to ${repo}#${number}`);
  },
  async closeIssue(repo, number, comment) {
    console.log(`[MOCK] Closed ${repo}#${number} with comment`);
  },
  async sendNotification(to, template, context) {
    console.log(`[MOCK] Sent ${template} report to ${to}`);
  }
};

// Main runner
async function run() {
  const config = loadConfig();
  const { repo, rules } = config;
  
  console.log(`🤖 GitHub Project Automator v1.0`);
  console.log(`   Repository: ${repo}`);
  console.log(`   Rules loaded: ${rules.length}\n`);
  
  // Determine context from argv or environment
  const context = {
    repo: repo,
    type: process.argv[2] || 'issue', // issue, pr, cron
    action: process.argv[3] || 'opened', // opened, closed, etc.
    number: process.argv[4] || null,
    trigger: process.env.TRIGGER || 'manual',
    schedule: process.env.SCHEDULE || null,
    // Full payload from GitHub webhook would be passed here
  };
  
  await processRules(rules, context, github);
  console.log('\n✅ Automation run complete.');
}

run().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
