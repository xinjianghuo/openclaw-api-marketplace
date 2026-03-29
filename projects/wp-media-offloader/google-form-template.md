# Google Form Template for WordPress Media Offloader

## 📝 Form Questions (Copy to Google Forms)

Create a new Google Form with these exact questions. Then get the form ID from the URL.

### Question 1: Email Address
- **Type**: Short answer (email validation enabled)
- **Label**: Email Address
- **Required**: ✅ Yes
- **Help text**: We'll contact you about beta access. No spam.

### Question 2: Pain Level
- **Type**: Multiple choice (dropdown or radio)
- **Label**: How painful is media storage/file hosting for your WordPress sites? (1-10)
- **Required**: ✅ Yes
- **Options**:
  - 10 - Critical, running out of space/hitting limits frequently
  - 9 - Very painful, causes regular issues
  - 8 - Painful, I think about it often
  - 7 - Moderately painful, needs improvement
  - 6 - Somewhat annoying
  - 5 - Neutral, not great but manageable
  - 4 - Not bad
  - 3 - Minimal issue
  - 2 - No issue
  - 1 - Not applicable
- **Form field name**: `entry.123456789` (will be auto-generated)

### Question 3: Number of WordPress Sites
- **Type**: Multiple choice (dropdown or radio)
- **Label**: How many WordPress sites do you manage?
- **Required**: ❌ No
- **Options**:
  - Just 1
  - 2-5
  - 6-10
  - 11+
- **Form field name**: `entry.234567890`

### Question 4: Current Solution
- **Type**: Multiple choice (dropdown or radio)
- **Label**: What's your current solution for media storage?
- **Required**: ❌ No
- **Options**:
  - Host "unlimited" hosting (shared/VPS with unlimited storage)
  - Amazon S3 / DigitalOcean Spaces
  - Backblaze B2
  - Cloudflare R2
  - Manual external storage (FTP, external drive)
  - No solution yet (everything local)
  - Other: ___________
- **Form field name**: `entry.345678901`

### Question 5: Willingness to Pay
- **Type**: Multiple choice (radio)
- **Label**: Would you pay $29/month (or $99 one-time) for a plugin that automates cloud offloading?
- **Required**: ✅ Yes
- **Options**:
  - Yes, definitely worth it
  - Maybe, depends on exact features/performance
  - No, too expensive
  - No, I'd prefer free/open source
- **Form field name**: `entry.456789012`

### Question 6: Beta Testing Interest
- **Type**: Multiple choice (radio)
- **Label**: Can I contact you for beta testing and feedback?
- **Required**: ✅ Yes
- **Options**:
  - Yes, I want early access and will provide feedback
  - Yes, but I may not have time to test
  - No, just interested in updates
- **Form field name**: `entry.567890123`

---

## 🔧 Getting Your Form ID

1. After creating the form, click "Send" (paper plane icon)
2. Click the link icon (<> "Send form link")
3. Copy the URL. It looks like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSf.../formResponse
   ```
4. Extract the ID: `1FAIpQLSf...` (the long string between `/d/e/` and `/formResponse`)
5. Replace `YOUR_FORM_ID` in `index.html` line 132:
   ```html
   <form action="https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse" ...>
   ```

---

## 📊 Data Collection Tips

- Enable "Collect email addresses" only if you need it (already have email field)
- In Form settings:
  - ✅ "Collect email addresses" OFF (we have dedicated field)
  - ✅ "Limit to 1 response" - ON (prevent spam)
  - ✅ "Show link to submit another response" - OFF
  - ⚠️ "Release summary" - optional

---

## 🎯 Success Metrics

After posting in communities:

- **Day 1-2**: ≥5 submissions
- **Day 3-4**: ≥10 more (total ≥15)
- **Pain score**: Average ≥7
- **Pay intent**: ≥50% "Yes, definitely"

If after 5 days <10 submissions → pivot to next opportunity.

---

## 📧 Follow-up Sequence (Free)

Use Google Sheets to track responses. After 48h:

1. Send email to all respondents:
   ```
   Subject: WordPress Media Offloader - Beta Updates
   
   Hi [Name],
   
   Thanks for signing up for early access! We're reviewing feedback and will 
   start beta testing in [X] days.
   
   Quick question: What's the #1 thing you want this plugin to solve?
   
   - [Quick reply helps us prioritize]
   
   - JARVIS (AI Assistant)
   ```

2. If ≥15 qualified → announce beta launch to list

3. If not, send "Finding right solution" email asking for more info (keeps warm)

---

**Next after form setup**: Create distribution templates (3 community posts)
