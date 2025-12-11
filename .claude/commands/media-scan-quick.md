---
description: Quick single-agent media scan for urgent updates (faster, less comprehensive)
---

# Quick Media Scan

You are running a rapid single-pass media scan for Queensland water sector news. This is faster than the full `/media-scan` but less comprehensive.

## Scan Parameters

- **Period:** Last 7 days
- **Focus:** High-priority items only
- **Output:** Brief summary + article URLs

## Execution

Run these searches sequentially and compile findings:

### Search 1: Sunwater Direct Mentions
```
"Sunwater" Queensland news OR announcement
```

### Search 2: Major Infrastructure
```
"Paradise Dam" OR "Rookwood Weir" OR "Burdekin Falls Dam" Queensland update
```

### Search 3: Policy & Pricing
```
Queensland water policy OR irrigation pricing QCA announcement
```

### Search 4: Rural Media
```
site:queenslandcountrylife.com.au OR site:abc.net.au/news Queensland water OR irrigation OR dam
```

### Search 5: Stakeholder Activity
```
"Queensland Farmers Federation" OR "AgForce" OR "CANEGROWERS" water statement
```

## Output Format

Provide a brief summary in this format:

---

### Quick Scan: [DATE]

**Top Stories:**
1. [Headline] - [Source] - [1 sentence summary] - [URL]
2. [Headline] - [Source] - [1 sentence summary] - [URL]
3. [Headline] - [Source] - [1 sentence summary] - [URL]

**Stakeholder Activity:**
- [Organization]: [Brief position] - [URL]

**Infrastructure Updates:**
- [Project]: [Update] - [URL]

**Articles for Import:**
```
/add-article [URL1]
/add-article [URL2]
```

**Nil Findings:** [List any searches that returned nothing relevant]

---

## When to Use This vs Full Scan

| Use Quick Scan | Use Full /media-scan |
|----------------|---------------------|
| Mid-week check-in | Weekly comprehensive report |
| Urgent briefing needed | Thorough stakeholder analysis |
| Checking specific breaking news | Need contrarian viewpoints |
| Time-constrained | Building media database |

## Follow-up

If the quick scan surfaces significant issues, recommend running the full `/media-scan` for comprehensive coverage including opposition research and regional council activity.
