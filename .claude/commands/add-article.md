---
description: Add a media article to the database with proper Sunwater analysis
---

You are helping to add a media article to the Water Industry Dashboard. The user will provide one or more article URLs.

## Critical Requirements

**DO NOT HALLUCINATE:**

- Only use information you can verify from the article source
- If a source is paywalled or inaccessible, explicitly state what information is missing
- Search for alternative sources if primary URL is blocked
- If you cannot find sufficient information, tell the user rather than making up content
- Mark articles as "PAYWALLED" in the summary if content cannot be accessed

## Workflow

For each article URL provided:

### 1. Fetch Article Content

- Use WebFetch to retrieve the article
- If blocked, search for the article using WebSearch with identifying information (title fragments, publication, date)
- Try alternative sources or cached versions
- Document any access limitations

### 2. Extract Metadata

Required fields (all must be accurate, not guessed):

- **Title:** Exact headline from source
- **Source:** Publication name (e.g., "Utility Magazine", "Queensland Country Life", "Sunwater")
- **Date:** Publication date in YYYY-MM-DD format
- **URL:** Original article URL

### 3. Write Summary

- 2-3 well-structured paragraphs
- Include key facts, quotes, and context
- Focus on concrete information, not speculation
- Cite specific numbers, dates, and stakeholder names
- Maintain objective tone

### 4. Analyze Sunwater Implications

Consider Sunwater's profile:

- **Core role:** Queensland's largest bulk water supplier (40% of QLD's commercial water)
- **Infrastructure:** 19 dams, 65 weirs/barrages, 1,951km pipelines, 595km channels
- **Customers:** 5,000+ across agriculture (primary), urban, and industrial sectors
- **Major projects:** Paradise Dam ($4.4B), RAB pricing review, dam improvement program
- **Strategic priorities:** Dam safety, water allocation, pricing, customer relations, environmental stewardship

Write 3-5 sentences describing **specific, concrete implications**:

- Operational impacts (service delivery, infrastructure management)
- Financial impacts (revenue, costs, investment requirements)
- Regulatory/policy impacts (compliance, pricing, allocation)
- Customer relations impacts (satisfaction, demand patterns)
- Reputational impacts (political scrutiny, public perception)
- Strategic positioning (competitive advantage, risk exposure)

**Be specific:** Instead of "This affects Sunwater's operations," write "This rebate scheme creates customer relations challenges as irrigators must pay full price upfront and claim rebates through QRIDA separately, potentially impacting water demand patterns."

### 5. Generate Tags

Include multiple tags covering:

- **Project names:** "Paradise Dam", "Fitzroy to Gladstone Pipeline" (if applicable)
- **Organizations:** "Sunwater", "QRIDA", "QCA", "Seqwater", "Queensland Government", "Crisafulli Government"
- **Topics:** "water-policy", "irrigation", "pricing", "infrastructure", "dam-construction", "RCC", "rebate-scheme", "regulatory-asset-base"
- **Locations:** "Bundaberg", "Gladstone", "Queensland" (if relevant)

Use proper capitalization for proper nouns, lowercase with hyphens for topic tags.

### 6. Create Markdown File

**Filename format:** `web/content/articles/YYYY-MM-DD-slug.md`

- Use publication date for YYYY-MM-DD
- Slug should be kebab-case version of key title words
- Example: `2025-10-30-qca-rab-irrigation-prices-review-2027-29.md`

**File structure:**

```markdown
---
date: YYYY-MM-DD
title: Exact Article Title
source: Publication Name
url: https://article-url.com
tags: ["Tag1", "Tag2", "topic-tag", "location-tag"]
implications: 3-5 sentences describing specific, concrete impacts for Sunwater. Include operational, financial, customer relations, regulatory, or reputational implications with specific details. Reference Sunwater's infrastructure scale (19 dams, 65 weirs, 5000+ customers) when relevant. Explain how this affects their strategic priorities, project delivery, or stakeholder relationships.
---

## Summary

First paragraph covering the main story, key facts, and primary stakeholders.

Second paragraph providing additional context, quotes, timeline, or detailed implications. Include specific numbers, dates, and named individuals or organizations where available.

Third paragraph (if needed) for additional background, related projects, or broader context that helps understand the significance for Sunwater's operations.
```

### 7. Report to User

After creating the file, provide a concise summary including:

- File location with markdown link
- Key details (title, source, date)
- Main points from the article
- Summary of Sunwater implications
- Any access issues encountered

## Reference Documents

Key Sunwater context is documented in:

- `/docs/workflow-add-media-article.md` - Full workflow guide
- Sunwater Annual Report 2024-2025 - Financial and operational data
- Previous articles in `web/content/articles/` - Format examples

## Example Format

Here's the frontmatter format that has been used successfully:

```yaml
---
date: 2025-10-30
title: Review of RAB-based irrigation prices 2027–29
source: Queensland Competition Authority
url: https://www.qca.org.au/project/rural-water/review-of-rab-based-irrigation-prices-2027-29/
tags:
  [
    "QCA",
    "irrigation",
    "pricing",
    "RAB",
    "regulatory-asset-base",
    "Sunwater",
    "Seqwater",
    "water-policy",
    "infrastructure",
    "renewals",
    "pricing-methodology",
  ]
implications: Fundamental shift in Sunwater's revenue recovery model with major financial and customer relations implications. The transition from annuity-based to RAB-based pricing represents the most significant change to Sunwater's irrigation pricing methodology in years. Sunwater must submit detailed business proposals by 27 February 2026 demonstrating RAB valuations across its 19 dam and 65 weir network. Success in this review is critical for maintaining regulatory credibility and ensuring sustainable cost recovery for infrastructure renewals.
---
```

## Common Scenarios

**Paywalled articles:**

- Clearly state in response: "This article is behind a paywall"
- Search for the same story from alternative sources
- If no alternative found, create minimal entry with title/source/date only, noting access limitation
- Ask user if they can provide key details

**Multiple articles:**

- Process each article sequentially
- Create separate files for each
- Provide summary list at end

**Missing dates:**

- Search for publication date in article metadata or related coverage
- If truly unavailable, ask user to provide or estimate
- Document uncertainty: "Publication date estimated based on..."

**Ambiguous implications:**

- Tie back to specific Sunwater operations or infrastructure
- Reference comparable situations from previous articles
- Quantify impact where possible (cost, customer numbers, timeline)

## Quality Checks

Before creating the file, verify:

- [ ] All required metadata fields are present and accurate
- [ ] Summary is 2-3 paragraphs, fact-based, and well-structured
- [ ] Implications are specific and actionable (not generic)
- [ ] Tags include mix of proper nouns and topic tags
- [ ] Filename follows YYYY-MM-DD-slug.md format
- [ ] No hallucinated information or speculation presented as fact
- [ ] Information presented is only based on contents of the article linked
- [ ] Any access limitations or uncertainties are clearly noted

## After Creating Article

The article will automatically appear in the Media Articles dashboard. No build step required.
