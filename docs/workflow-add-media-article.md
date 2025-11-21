# Workflow: Adding Media Articles

This document describes how to add new media articles to the QLD Water Markets dashboard using Claude Code or any AI assistant.

## Overview

The Media Articles feature allows you to track individual news articles relevant to Sunwater's operations. Each article is stored as a markdown file with structured frontmatter and analyzed for its implications on Sunwater's business.

## Prerequisites

- Access to Claude Code (in Cursor) or similar AI assistant
- A URL to the article you want to add
- Basic understanding of Sunwater's operations (provided to AI automatically)

## Step-by-Step Workflow

### 1. Find an Article

Browse news sources for articles relevant to Sunwater's interests:
- **Water policy:** Legislation, regulations, allocation rules
- **Infrastructure:** Dam projects, pipeline upgrades, maintenance
- **Agriculture:** Irrigation, crop water usage, farmer concerns
- **Environment:** Water quality, environmental flows, climate impacts
- **Politics:** Government decisions, funding announcements, political debates

### 2. Request Article Analysis

Provide the article URL to Claude Code with this prompt template:

```
Add this article to the Media Articles dashboard: [ARTICLE_URL]

Please:
1. Fetch the article content
2. Extract the title, publication source, and publication date
3. Write a 2-3 paragraph summary of the article
4. Analyze implications for Sunwater (considering their role as QLD's bulk water supplier managing 19 dams, 65 weirs, 5000+ customers across agriculture/urban/industrial sectors)
5. Generate appropriate tags including:
   - Project name (if applicable)
   - Organization/owner/proponent
   - Topic tags (water-policy, infrastructure, dam-raising, etc.)
   - Location tags (if relevant)
6. Create a markdown file in web/content/articles/ with the filename format: YYYY-MM-DD-slug.md
```

### 3. AI Analysis Process

Claude Code will:
1. Fetch the article from the provided URL
2. Extract key information (title, source, date, content)
3. Analyze the content considering Sunwater's context:
   - **Core business:** Bulk water supply, dam/weir/pipeline management
   - **Geographic scope:** Queensland (31 schemes, 14 pipelines)
   - **Customer base:** 5,000+ agricultural, urban, and industrial customers
   - **Key infrastructure:** 19 dams, 65 weirs, 1,951km pipelines, 595km channels
   - **Strategic priorities:** Dam safety, water allocation, pricing, customer service, environmental stewardship
4. Determine business implications (impact on operations, finances, reputation, regulations)
5. Generate a markdown file following the standard template

### 4. Review and Edit

After Claude generates the file:
1. Review the accuracy of the summary
2. Verify the implications analysis is relevant and accurate
3. Adjust the category if needed
4. Edit any content that seems incorrect or could be improved

### 5. View in Dashboard

The article will automatically appear in the Media Articles tab:
- No build step required (Next.js handles it automatically)
- Refresh the browser to see the new article
- Use search and category filters to find specific articles

## Markdown File Format

Each article follows this structure:

```markdown
---
date: YYYY-MM-DD
title: Article headline (from source)
source: Publication name (e.g., "ABC Rural", "Queensland Country Life")
url: https://original-article-url.com
tags: ["Project Name", "Organization/Owner", "topic-tag", "location-tag"]
implications: 2-4 sentences describing specific impacts/implications for Sunwater
---

## Summary

2-3 paragraphs summarizing the article content.

Include key facts, quotes, and context.

### Optional Subheadings

You can add subheadings to organize the summary if helpful.

- Bullet points for key details
- Statistics or data points
- Stakeholder perspectives
```

## Tag Guidelines

Articles should include multiple tags covering:

### Project/Initiative Tags
- Specific project names (e.g., "Paradise Dam", "Fitzroy to Gladstone Pipeline", "Water Allocation Reform")
- Use the official project name as it appears in documentation

### Organization Tags
- Owner/proponent organization (e.g., "Sunwater", "GAWB", "Queensland Government")
- Contractor names for major projects (e.g., "McConnell Dowell BMD")
- Key stakeholder names (e.g., "Darren Barlow" for GAWB CEO)

### Topic Tags (lowercase with hyphens)
- **water-policy:** Legislation, regulations, allocation rules, trading policies
- **infrastructure:** General infrastructure projects
- **dam-upgrade / dam-raising:** Specific dam improvement projects
- **pipeline-construction / pipeline-replacement:** Pipeline projects
- **water-security:** Water supply reliability initiatives
- **economic-impact:** Economic and employment benefits
- **workforce-development:** Training and employment programs
- **agriculture:** Irrigation, farming, agricultural impacts
- **environment:** Environmental flows, sustainability
- **regulation:** Regulatory changes and compliance

### Location Tags (optional)
- Specific locations (e.g., "Gladstone", "Bundaberg", "Charters Towers")
- Regions if relevant

**Example:**
```yaml
tags: ["Fitzroy to Gladstone Pipeline", "GAWB", "Darren Barlow", "water-security", "economic-impact", "Gladstone"]
```

## Sunwater Context for AI Analysis

When analyzing implications, consider these Sunwater facts:

**Core Operations:**
- Queensland's largest bulk water supplier (40% of QLD's commercial water)
- Manages 19 dams, 65 weirs/barrages, 1,951km pipelines, 595km irrigation channels
- Serves 5,000+ customers across 31 bulk water schemes

**Key Projects:**
- Paradise Dam Improvement Project (ongoing major investment)
- Dam Improvement Program (safety and compliance)
- Regulated Asset Base (RAB) Irrigation Price Review

**Strategic Focus:**
- Dam safety and infrastructure integrity
- Water allocation management and trading
- Customer service and transparent engagement
- Environmental stewardship and sustainability
- Financial sustainability and efficient pricing

**Regional Coverage:**
- North region, Pioneer Bowen Basin, Fitzroy, South, Burnett and Lower Mary
- Key schemes: Burdekin, Paradise, Callide, Bowen, and others

**Stakeholders:**
- Agricultural irrigators (primary customers)
- Urban municipalities (urban water supply)
- Industrial/mining operations
- Queensland Government (owner)
- Environmental groups
- Local communities

## Tips for Good Articles

1. **Be specific:** Generic articles about "water management" are less useful than articles about specific policies, projects, or events
2. **Focus on Queensland:** Prioritize QLD-specific news over national/international stories
3. **Recent news:** Aim for articles published within the last 2-3 months
4. **Actionable implications:** The "implications" field should describe concrete impacts, not vague observations
5. **Verify URLs:** Ensure article URLs are publicly accessible and not behind paywalls

## Example Prompts

**For a specific article:**
```
Add this article: https://www.abc.net.au/rural/example-article
```

**For multiple articles:**
```
Add these three articles to the Media Articles dashboard:
1. [URL1]
2. [URL2]
3. [URL3]
```

**When you want more control:**
```
Fetch and analyze this article: [URL]

After analysis, show me the proposed frontmatter and summary before creating the file.
```

## Troubleshooting

**Problem:** Article content can't be accessed (paywall, broken link)
- **Solution:** Manually copy the article text and paste it with your request

**Problem:** Category is unclear (article covers multiple topics)
- **Solution:** Choose the category that represents the PRIMARY focus or greatest Sunwater relevance

**Problem:** Implications seem generic or vague
- **Solution:** Ask Claude to revise with more specific operational, financial, or strategic impacts

**Problem:** Article date is missing or unclear
- **Solution:** Use the publication date from the source, or use the date you discovered it

## Maintenance

- **Regular reviews:** Periodically review older articles to archive or remove outdated content
- **Category refinement:** If you notice patterns, you can propose new categories or merge existing ones
- **Bulk operations:** Use CLI tools to rename, move, or batch-edit articles if needed

## Future Enhancements

Potential improvements to consider:
- Linking articles to specific weekly Media Scans
- Adding relevance scores (high/medium/low impact)
- Tagging articles with entities (politicians, locations, organizations)
- Export functionality for filtered article lists
- RSS feed monitoring for automatic article discovery
