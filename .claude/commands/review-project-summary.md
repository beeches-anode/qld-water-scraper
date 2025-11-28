---
description: Review or create a project summary with strict sourcing and no redundancy
---

You are reviewing or creating a water infrastructure project summary. Apply strict standards for accuracy, sourcing, and conciseness.

## Critical Requirements

### NO HALLUCINATION - STRICT SOURCING

- **Every fact must be traceable** to a source listed in the frontmatter `links:` array
- If information cannot be verified from the linked sources, DO NOT include it
- Do not infer, speculate, or add "common knowledge" about water projects
- If sources are paywalled or inaccessible, note this explicitly and exclude unverifiable content
- When reviewing existing summaries, flag any claims that cannot be found in the sources
- Prefer direct quotes and specific numbers from sources over paraphrasing

### NO REDUNDANCY

Content should appear in **one place only**:

| Information Type | Where It Belongs |
|-----------------|------------------|
| Links/Sources | Frontmatter `links:` array ONLY |
| Structured data (cost, capacity, location, status) | Frontmatter ONLY |
| Funding amounts and sources | Frontmatter ONLY |
| Organizations involved | Frontmatter ONLY |
| Narrative explanation and history | Body ONLY |

**Delete these sections if they exist:**
- "External Resources" or "Sources" sections in body
- "Key Specifications" sections (duplicates frontmatter)
- "Summary Section" headings (the frontmatter IS the summary)
- Bullet lists that simply restate frontmatter values

## Required File Structure

### Frontmatter (Structured Data)

```yaml
---
title: Project Name
description: One sentence describing the project (appears in search/cards)
region: Water catchment or geographic region
status: planning | approved | construction | operational | on-hold | discontinued
estimatedCost: $X million/billion
fundingCommitted: $X million (specify if partial)
fundingSources:
  - Source 1 ($X million via Program Name)
  - Source 2 ($X million)
capacity: X GL or X ML
irrigationArea: X hectares (if applicable)
location: Specific location description
organizations:
  - Organization 1 (role)
  - Organization 2 (role)
environmentalRisks: Brief summary of key environmental concerns
approvalsStatus: Current approval stage and key dates
culturalHeritageIssues: Brief summary if applicable, otherwise omit
timeline: Key dates in sequence (comma-separated or arrow-separated)
economicBenefits: Key economic projections (jobs, production value)
links:
  - title: Descriptive Link Title
    url: https://source-url.com
  - title: Another Source
    url: https://another-source.com
lastUpdated: YYYY-MM-DD
---
```

### Body (Narrative Content Only)

```markdown
## Project Overview

2-3 paragraphs providing narrative context. Explain WHY this project matters,
its history, and current situation. Do not repeat basic facts from frontmatter.

## Project History

Narrative timeline of key developments. Focus on decision points, controversies,
and changes in direction. Use prose, not bullet lists of dates (dates are in frontmatter).

## Environmental Considerations

Narrative explanation of environmental issues, assessment status, and any
controversies. Only include if there are substantive issues to discuss.

## Cultural Heritage

Only include if there are specific Traditional Owner concerns or cultural
heritage issues. Summarize the key concerns and current status of consultation.

## Regional Context

Brief explanation of how this project fits into broader water planning,
related projects, or regional development. Only if adds meaningful context.
```

**Maximum target length:** 150-200 lines total (including frontmatter)

## Review Checklist

When reviewing an existing project summary:

### Source Verification
- [ ] Every factual claim can be found in one of the linked sources
- [ ] No speculative statements ("This could lead to...", "It is likely that...")
- [ ] No generic boilerplate ("Typical conditions for projects include...")
- [ ] Specific numbers, dates, and names are sourced
- [ ] Flag any claims that cannot be verified with `[UNVERIFIED - source needed]`

### Redundancy Check
- [ ] No "Sources" or "External Resources" section in body (links in frontmatter only)
- [ ] No "Key Specifications" section (data in frontmatter only)
- [ ] No "Summary Section" (frontmatter is the summary)
- [ ] No bullet lists restating frontmatter values
- [ ] Body content adds narrative value, not just reformatted data

### Structure Check
- [ ] Frontmatter contains all required fields
- [ ] Body sections are narrative prose, not data dumps
- [ ] File is under 200 lines total
- [ ] No duplicate information between sections

### Content Quality
- [ ] Objective tone throughout (no advocacy or editorializing)
- [ ] "Lessons and Legacy" type speculation removed
- [ ] Focuses on concrete facts, not interpretation
- [ ] Cultural heritage section treats Traditional Owner concerns respectfully and factually

## Common Issues to Fix

### Issue: Links appear multiple times
**Fix:** Keep only the frontmatter `links:` array. Delete any "Sources", "References", or "External Resources" sections from the body.

### Issue: "Key Specifications" section duplicates frontmatter
**Fix:** Delete the entire section. The website renders frontmatter data automatically.

### Issue: "Summary Section" followed by "Detailed Section"
**Fix:** Remove the Summary Section entirely. Convert Detailed Section into the main body content.

### Issue: Financial details repeated in body
**Fix:** Keep only narrative context (e.g., "Funding was secured in two tranches following..."). Remove bullet lists of dollar amounts.

### Issue: Speculative "Lessons" or "Future Implications" sections
**Fix:** Delete entirely unless based on specific sourced statements from stakeholders.

### Issue: Generic statements about water projects
**Fix:** Delete. Only include project-specific information from sources.

## When Creating New Summaries

1. **Gather sources first** - Use WebFetch/WebSearch to collect all available sources
2. **Extract facts only** - List only verifiable facts from each source
3. **Build frontmatter** - Populate structured data from verified facts
4. **Write narrative** - Create body content that explains context, not restates data
5. **Verify every claim** - Before finalizing, confirm each statement traces to a source
6. **Check length** - If over 200 lines, identify and remove redundancy

## Output Format

When reviewing, provide:

1. **Summary of issues found** - List redundancies and unverified claims
2. **Recommended deletions** - Specific sections/lines to remove
3. **Flagged claims** - Any statements that need source verification
4. **Revised file** - The corrected markdown (if changes are straightforward)

When creating new summaries:

1. **Sources consulted** - List all sources reviewed with accessibility status
2. **Information gaps** - Note any standard fields that couldn't be populated from sources
3. **Draft file** - The complete markdown file
4. **Confidence level** - Note any areas where sources were ambiguous

## Example: Before and After

### Before (Redundant)
```markdown
---
estimatedCost: $60 million
capacity: 10 GL
links:
  - title: Source 1
    url: https://...
---

## Key Specifications
- **Cost:** $60 million
- **Capacity:** 10 GL

## Sources
- [Source 1](https://...)
```

### After (Correct)
```markdown
---
estimatedCost: $60 million
capacity: 10 GL
links:
  - title: Source 1
    url: https://...
---

## Project Overview

The project addresses water security concerns in the region...
```
