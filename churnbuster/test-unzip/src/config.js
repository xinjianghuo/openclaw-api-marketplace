/**
 * Config Manager
 * 管理用户配置、扫描历史、排除列表
 */

const path = require('path');
const conf = require('conf');
const fs = require('fs');

class ConfigManager {
  constructor() {
    this.schema = {
      verbose: { type: 'boolean', default: false },
      excludePaths: { type: 'array', default: [] },
      scanHistory: { type: 'array', default: [] },
      userPreferences: { type: 'object', default: {} }
    };

    this.store = new conf({
      schema: this.schema,
      projectName: 'churnbuster',
      configName: 'config.json'
    });
  }

  static load() {
    return new ConfigManager().store;
  }

  static save(key, value) {
    const store = new ConfigManager().store;
    store.set(key, value);
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  getAll() {
    return this.store.all;
  }

  // 添加排除路径
  addExclude(path) {
    const current = this.get('excludePaths') || [];
    if (!current.includes(path)) {
      current.push(path);
      this.set('excludePaths', current);
    }
  }

  // 记录扫描历史
  addScanResult(subscriptions) {
    const history = this.get('scanHistory') || [];
    history.push({
      timestamp: new Date().toISOString(),
      count: subscriptions.length
    });
    // 只保留最近10次
    if (history.length > 10) {
      history.shift();
    }
    this.set('scanHistory', history);
  }
}

module.exports = ConfigManager;
