# HEARTBEAT.md - 自动化检查清单

**当前模式**: 主动工作模式（赚钱导向）  
**空闲策略**: 自动搜索零投入项目机会

---

## 📅 周期性检查项

### 每日 02:00 左右 (夜间学习时段前)
- [ ] 检查是否有阻塞事项需要用户决策
- [ ] 更新 MEMORY.md 项目状态
- [ ] 确认夜间学习主题 (根据技能缺口)

### 每 30 分钟 (可调整)
- [ ] 检查用户消息
- [ ] 如果空闲且无明确任务 → 执行机会扫描

---

## 🔍 空闲时的零成本项目扫描

**触发条件**: 心跳检查时无用户输入 + 无高优先级阻塞

**扫描源**:
- Reddit: r/microsaas, r/indiehackers, r/startups, r/SideProject
- Product Hunt: 新发布产品的用户反馈
- GitHub Issues: "help wanted" + "beginner friendly"
- Hacker News: Show HN 的痛点讨论

**筛选标准**:
- 零成本或 <$20 启动
- 解决明确的用户痛点
- 可 2-4 周内 MVP
- 有付费意愿的受众

**输出**: 整理 3-5 个机会 → 汇报给用户

---

## 🌙 夜间学习时段 (01:00-04:00)

**策略**: 自动深度学习，不打扰用户

**学习优先级**:
1. 当前项目所需技能缺口 (API设计, 支付集成, 营销)
2. 零成本获客技巧 (SEO, content marketing, cold outreach)
3. 自动化运营技术 (webhook, email sequences, monitoring)
4. 成功案例研究 (micro-SaaS, indie hacker)

**交付物**:
- 更新 `learning/` 目录文档
- 更新 `skills/` 相关技能文件
- 在 MEMORY.md 记录学习成果

---

## 🚨 立即推送规则 (例外静默模式)

- 用户主动提问
- 安全风险
- 明确的 deadline 临近 (<24h)
- 用户指令改变策略

**其余时间**: 静默执行，仅更新日志
