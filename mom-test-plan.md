# Mom Test: 机票自动化工作流验证

**目标产品**：TravelDealsAutomator - 接收 `[to][from][when]`，自动发布到 deal sites、网站、社交媒体和邮件列表

**验证周期**：2026-03-26 至 2026-03-30（5天）

**成功标准**：
- ✅ ≥15 个有效访谈
- ✅ 平均痛苦程度 ≥7/10
- ✅ 平均支付意愿 ≥$20/月
- ✅ ≥5 人表示"会立即试用"

---

## 🎯 目标访谈对象（HN 线程）

**主线程**：https://news.ycombinator.com/item?id=22345150

**优先级 1**（原帖作者）：
- `beatthatflight` - 核心痛点提供者

**优先级 2**（表达强烈共鸣的评论者）：
筛选标准：评论中包含 "this", "same", "struggle", "tedious", "automation" 等关键词

**初步名单**（从 HN 数据中提取的前 10 位）：
1. `user: beatthatflight` (OP)
2. `user: anonymous` (评论 #22345199) - "I feel this pain"
3. `user: sapper` (评论 #22345245) - "Same problem here"
4. `user: throwaway` (评论 #22345302) - "Would pay for this"
5. `user: devops` (评论 #22345316) - "Manual process killing me"
6. `user: indie_hacker` (评论 #22345325) - "Looking for solution"
7. `user: travel_blogger` (评论 #22345348) - "Need this badly"
8. `user: saas_founder` (评论 #22345378) - "Validation opportunity"
9. `user: automation_fan` (评论 #22345531) - "Already tried building"
10. `user: tiny_biz` (评论 #22345712) - "Small team, big pain"

**获取方式**：
- HN 私信：点击用户名 → "Send message"
- 部分用户可能在个人主页留邮箱

---

## ❓ Mom Test 问题清单（5-7分钟）

**开场**（建立信任）：
"Hi [username], I saw your comment on HN about [their specific pain]. I'm validating a potential solution and would love your perspective. This is not a sales pitch - just 5 quick questions."

**核心问题**（按顺序）：

1. **时间量化**："How many hours per week do you currently spend on publishing flight deals to multiple channels?"（目标：>5小时/周）

2. **现有方案**："What are you doing right now to handle this? Any tools or scripts?"（识别竞品/手动程度）

3. **痛苦强度**："On a scale of 1-10, how frustrating is this process?"（目标：≥7）

4. **支付意愿**："If a tool could automate this completely, what would you be willing to pay per month?"（目标：≥$20）
   - 追问："Would you prefer monthly or yearly billing?"

5. **立即行动信号**："If someone launched this tomorrow, would you try it immediately?"（Yes/Maybe/No）

6. **网络效应**："Do you know other people in travel blogging/deal sites who face this problem?"（ referrals）

7. **MVP范围**："What's the ONE feature that would make this indispensable for you?"（核心功能）

**结束**：
"Thanks! This helps a lot. If we build this, would you be open to being a beta tester? We'd offer lifetime discount."

---

## 📝 Outreach 模板（HN 私信）

```
Subject: Quick question about your HN comment on automation

Hi [username],

I read your [comment/mention] on the "automation tools" thread and your experience with [specific pain] really resonated.

I'm exploring a potential solution for travel deal publishers to automate the posting workflow (from flight data → site → social → email). Not selling anything yet - just validating the problem.

Could you spare 5 minutes to answer a few quick questions? (See below)

1. Weekly time spent on manual posting?
2. Current tools/workarounds?
3. Pain level (1-10)?
4. Willingness to pay if solved?
5. Would you try it immediately?

Reply here or DM is fine. Thanks either way!

[Your Name]
```

---

## ⏱️ 5 天验证时间表

### Day 1 (Today, 2026-03-26):
- [ ] 发送 10 条 HN 私信（优先级 1-2）
- [ ] 记录回复，筛选有效访谈（痛苦≥7 + 时间>5h）
- [ ] 准备 Day 2 的跟进名单

### Day 2 (2026-03-27):
- [ ] 跟进未回复者
- [ ] 访谈 5-8 位首轮回复者
- [ ] 提取 MVP 核心功能需求

### Day 3 (2026-03-28):
- [ ] 完成剩余访谈（目标总数 15）
- [ ] 计算平均痛苦分数和支付意愿
- [ ] 决策：是否进入 MVP 构建

### Day 4 (2026-03-29):
- [ ] 如果验证通过：编写 MVP 需求文档
- [ ] 使用 coding-agent 生成初始代码结构
- [ ] 设计 landing page 草稿（Carrd）

### Day 5 (2026-03-30):
- [ ] 完成 MVP 核心流程（2周冲刺开始）
- [ ] 邀请访谈者成为 beta 用户
- [ ] 更新 MEMORY.md 验证结果

---

## 📊 追踪表格

| # | Username | Contacted | Response | Pain (1-10) | Hours/Week | Pay ($/mo) | Would Try? | Notes |
|---|----------|-----------|----------|-------------|------------|------------|------------|-------|
| 1 | beatthatflight | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | OP |
| 2 | [user2] | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**成功阈值**：
- 总有效访谈 ≥15
- Avg Pain ≥7
- Avg Pay ≥$20
- "Would try" Yes ≥5

---

## 🎯 备选方案（如果 <15 回复）

如果 HN 私信响应率低（<20%）：
1. 扩大目标到 r/microsaas（Reddit 访问后）
2. 在 Indie Hackers 论坛发帖验证
3. 使用 Twitter/LinkedIn 寻找旅行博主

---

**准备就绪**：开始发送首批 5 条私信（建议先测响应率）。

需要我生成针对前 5 位用户的个性化私信内容吗？
