# Water Infrastructure Project Research Workflow

This document describes an automated approach to researching business cases and authoritative sources for Queensland water infrastructure projects using Claude Code's sub-agent architecture.

## Overview

The workflow uses a **master/sub-agent pattern**:
- **Master agent**: Orchestrates the research, launching sub-agents and tracking progress
- **Sub-agents**: Each handles one project autonomously (search → evaluate → update file)

This approach keeps context windows clean and allows parallel processing.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Master Agent                         │
│  (Main Claude Code conversation)                        │
│                                                         │
│  - Reads list of projects from research/projects/       │
│  - Launches sub-agents in parallel (3 at a time)        │
│  - Tracks completion via todo list                      │
│  - Reports results to user                              │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ Sub-Agent 1 │ │ Sub-Agent 2 │ │ Sub-Agent 3 │
   │ (Project A) │ │ (Project B) │ │ (Project C) │
   │             │ │             │ │             │
   │ 1. Read .md │ │ 1. Read .md │ │ 1. Read .md │
   │ 2. WebSearch│ │ 2. WebSearch│ │ 2. WebSearch│
   │ 3. WebFetch │ │ 3. WebFetch │ │ 3. WebFetch │
   │ 4. Edit file│ │ 4. Edit file│ │ 4. Edit file│
   └─────────────┘ └─────────────┘ └─────────────┘
```

### Sub-Agent Prompt Template

Each sub-agent receives a prompt like this:

```
Research the "[PROJECT_NAME]" water infrastructure project in Queensland, Australia.

## Your Task:
1. First, read the project file at: research/projects/[FILENAME].md

2. Search for authoritative source documents using these queries:
   - "[Project Name]" business case Queensland
   - "[Project Name]" detailed business case
   - "[Project Name]" Infrastructure Queensland Building Queensland
   - "[Project Name]" National Water Grid

3. Prioritize sources in this order:
   - Detailed Business Case (PDF from government)
   - Preliminary Business Case or Pre-feasibility Study
   - Options Analysis or Final Investment Decision
   - Government reports (Infrastructure QLD, Building Queensland)
   - National Water Grid Authority publications
   - Sunwater, council, or industry publications
   - Media articles (if no official sources)

4. For EACH source found, document:
   - Document type
   - Title
   - Publisher/Author
   - Publication DATE (critical - must include dates)
   - Direct URL (PDF link preferred)

5. Include BOTH the most recent document AND any historical documents.
   Clearly mark which is most recent.

6. Update the project markdown file by APPENDING a "## Sources" section.
```

### Output Format

When a business case IS found:

```markdown
## Sources

### Primary Source (Most Recent)
- **Type**: Detailed Business Case
- **Title**: [Full document title]
- **Author/Publisher**: Infrastructure Queensland
- **Date**: [Publication date]
- **URL**: [Direct link, preferably PDF]

### Historical Documents
- **[Date]** - [Document type]: [Title] - [URL]
- **[Date]** - [Document type]: [Title] - [URL]

*Research conducted: YYYY-MM-DD*
```

When NO business case is found:

```markdown
## Sources

**Note: No formal business case or financial decision document was located for this project.**

### Best Available Sources
- **Type**: Government press release / Media article / Industry report
- **Title**: [Title]
- **Author/Publisher**: [Source]
- **Date**: [Date]
- **URL**: [Link]

*Research conducted: YYYY-MM-DD*
```

## Running the Workflow

### Prerequisites

1. Ensure WebSearch and WebFetch are in your allowed tools:
   ```json
   // .claude/settings.local.json
   {
     "permissions": {
       "allow": [
         "WebSearch",
         "WebFetch"
       ]
     }
   }
   ```

### Manual Execution (Single Project)

Ask Claude Code:
```
Research the "Nullinga Dam" project and find the most authoritative source
documents (business cases, pre-feasibility studies, etc.). Update the file
at research/projects/nullinga-dam.md with a Sources section.
```

### Batch Execution (All Projects)

Ask Claude Code:
```
For each project in research/projects/, research and find the most authoritative
source documents (business cases preferred). Update each file with a Sources section.
Run 3 projects in parallel using sub-agents.
```

### Resuming After Interruption

If the process is interrupted:
```
Check which projects in research/projects/ already have a "## Sources" section.
Continue researching the remaining projects that don't have sources yet.
```

## Known Issues

### 1. National Water Grid Website Blocking

**Problem**: The nationalwatergrid.gov.au website often times out or blocks WebFetch requests.

**Workaround**:
- Focus searches on other sources first (Infrastructure QLD, Sunwater, state government)
- If a National Water Grid source is found via search, note the URL but don't try to fetch the full content
- The search result snippet often contains enough info (title, date)

### 2. PDF Direct Links

**Problem**: Many business cases are PDFs. WebFetch may not extract content from PDFs well.

**Workaround**:
- Note the PDF URL from search results
- Don't rely on fetching PDF content - use the search result metadata instead

### 3. Rate Limiting

**Problem**: Running too many parallel searches may hit rate limits.

**Workaround**:
- Run 3 agents at a time maximum
- If you see rate limit errors, reduce to 1-2 parallel agents

## Key Search Sources

### Government Sources (Most Authoritative)
- **Infrastructure Queensland / Building Queensland**: https://www.statedevelopment.qld.gov.au/
- **Department of Regional Development, Manufacturing and Water**: https://www.rdmw.qld.gov.au/
- **National Water Grid Authority**: https://www.nationalwatergrid.gov.au/
- **Queensland Water**: https://www.business.qld.gov.au/industries/mining-energy-water/water

### Water Corporations
- **Sunwater**: https://www.sunwater.com.au/
- **Seqwater**: https://www.seqwater.com.au/

### Search Query Patterns

Most effective queries:
1. `"[Exact Project Name]" business case Queensland filetype:pdf`
2. `"[Project Name]" pre-feasibility study`
3. `"[Project Name]" Infrastructure Queensland`
4. `"[Project Name]" detailed business case`
5. `site:qld.gov.au "[Project Name]"`

## Project List

There are 87 projects in `research/projects/`. To see the full list:
```bash
ls research/projects/
```

## Verification

After running the workflow, verify completion:
```bash
# Count files with Sources section
grep -l "## Sources" research/projects/*.md | wc -l

# Find files WITHOUT Sources section
for f in research/projects/*.md; do grep -q "## Sources" "$f" || echo "$f"; done
```
