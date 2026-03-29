#!/usr/bin/env node

/**
 * ChurnBuster v1.0 - CLI Entry Point
 * 检测并帮助取消 unwanted subscriptions
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// 导入模块
const Detector = require('./detector');
const GuideGenerator = require('./guide-generator');
const Reporter = require('./reporter');
const ConfigManager = require('./config');

// 版本信息
const VERSION = require('../package.json').version;

// CLI程序配置
program
  .name('churnbuster')
  .description('Detect and cancel unwanted subscriptions before you get charged')
  .version(VERSION)
  .option('-s, --scan', 'Run subscription detection scan')
  .option('-r, --report', 'Generate HTML report')
  .option('-l, --list', 'List detected subscriptions only')
  .option('--dry-run', 'Show what would be detected without accessing sensitive data')
  .option('--exclude <pattern...>', 'Exclude paths from scan', (val) => val.split(','))
  .option('--verbose', 'Enable verbose logging')
  .parse(process.argv);

const options = program.opts();

// 初始化配置
const config = ConfigManager.load();

// 设置日志级别
if (options.verbose) {
  config.verbose = true;
}

// 工具函数
function logInfo(msg) {
  console.log(chalk.blue('ℹ'), msg);
}

function logSuccess(msg) {
  console.log(chalk.green('✓'), msg);
}

function logWarn(msg) {
  console.log(chalk.yellow('⚠'), msg);
}

function logError(msg) {
  console.log(chalk.red('✖'), msg);
}

function logHeader(msg) {
  console.log(chalk.bold.cyan('\n' + '═'.repeat(50)));
  console.log(chalk.bold.cyan(`  ${msg}`));
  console.log(chalk.bold.cyan('═'.repeat(50)) + '\n');
}

// 主流程
async function main() {
  logHeader('ChurnBuster v' + VERSION);

  try {
    // 检测阶段
    if (options.scan || options.list || options.report) {
      logInfo('Starting subscription detection scan...');

      const detector = new Detector({
        exclude: options.exclude || [],
        dryRun: options.dryRun,
        verbose: options.verbose
      });

      const subscriptions = await detector.scan();
      logSuccess(`Scan complete. Found ${subscriptions.length} subscription(s).`);

      if (options.list || !options.report) {
        // 列出检测结果
        if (subscriptions.length === 0) {
          logInfo('No subscriptions detected.');
        } else {
          console.log('\nDetected Subscriptions:');
          console.log('─'.repeat(40));
          subscriptions.forEach((sub, idx) => {
            console.log(`${idx + 1}. ${chalk.bold(sub.name)}`);
            console.log(`   Service: ${sub.service_id}`);
            console.log(`   Confidence: ${sub.confidence}%`);
            console.log(`   Source: ${sub.source_type} (${sub.source_path || 'system'})`);
            if (sub.next_billing) {
              console.log(`   Next billing: ${sub.next_billing}`);
            }
            console.log('');
          });
        }
      }

      // 生成报告
      if (options.report && subscriptions.length > 0) {
        logInfo('Generating cancellation guide report...');
        const guideGen = new GuideGenerator();
        const reports = await guideGen.generateAll(subscriptions);

        const reporter = new Reporter();
        const outputPath = reporter.generate(subscriptions, reports);
        logSuccess(`HTML report generated: ${outputPath}`);
        logInfo('Open this file in your browser to see detailed cancellation instructions.');
      }
    } else {
      // 无选项，显示帮助
      program.help();
    }

  } catch (error) {
    logError('Fatal error: ' + error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 运行主程序
main().catch(console.error);
