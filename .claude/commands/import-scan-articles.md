---
description: Batch import articles identified in a media scan
---

# Import Scan Articles

You are processing articles identified in a media scan for import into the dashboard.

## Input

The user will provide either:
1. A list of URLs from a scan's "Articles for Import" section
2. A reference to a scan file (e.g., `web/content/scans/2025-01-15-weekly-scan.md`)

## Workflow

### Step 1: Extract URLs

If given a scan file reference:
1. Read the scan file
2. Extract URLs from the "Articles for Import" section
3. List them for user confirmation

### Step 2: Process Each Article

For each URL, use the `/add-article` workflow:
1. Fetch article content
2. Extract metadata (title, source, date)
3. Write summary (2-3 paragraphs)
4. Analyze Sunwater implications
5. Generate tags
6. Create markdown file in `web/content/articles/`

### Step 3: Handle Issues

**Paywalled articles:**
- Note in response
- Search for alternative coverage
- Ask user if they can provide content

**Duplicate detection:**
- Before creating, check if article already exists in `web/content/articles/`
- Search by URL and by headline
- Skip if duplicate, noting to user

**Failed fetches:**
- Log the failure
- Continue with remaining articles
- Report failures at end

## Output

After processing, provide a summary:

```
## Import Complete

**Successfully imported:**
1. [Title] → `web/content/articles/YYYY-MM-DD-slug.md`
2. [Title] → `web/content/articles/YYYY-MM-DD-slug.md`

**Skipped (already exists):**
- [Title] - existing file: [path]

**Failed (paywall/blocked):**
- [URL] - reason: [Paywall/Blocked/Timeout]

**Action required:**
- [URL] - needs manual review because [reason]
```

## Efficiency

Process articles in batches of 3-4 to balance speed with quality. Don't rush - each article needs proper implications analysis.

## Quality Checks

Before finishing, verify each created file has:
- [ ] Accurate date in YYYY-MM-DD format
- [ ] Exact headline from source
- [ ] Correct source publication name
- [ ] Working URL
- [ ] Relevant tags (projects, organizations, topics)
- [ ] Specific Sunwater implications (not generic)
- [ ] 2-3 paragraph summary with verified facts
