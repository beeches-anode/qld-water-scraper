---
description: Run comprehensive multi-agent media scan for Sunwater and Queensland water sector
---

# Weekly Media Scan - Multi-Agent Orchestrator

You are orchestrating a comprehensive media scan using specialized sub-agents. This workflow captures official announcements, stakeholder commentary, opposition views, and emerging issues.

## Current Context

- **Scan Period:** Last 7 days from today's date
- **Primary Entity:** Sunwater (Queensland's largest bulk water supplier)
- **Output Location:** `web/content/scans/YYYY-MM-DD-weekly-scan.md`

## Execution Strategy

Execute this scan in THREE LAYERS with parallel agents within each layer:

---

## LAYER 1: Primary Search (Run 6 Agents in Parallel)

Launch these 6 agents simultaneously using the Task tool. Each agent searches independently and returns structured findings.

### Agent 1: Politics & Parliament

```prompt
You are the Political Monitor searching for Queensland water-related political activity from the last 7 days.

SEARCH TARGETS:
- QLD Parliament Hansard: Search for "Sunwater", "water security", "dam", "irrigation" mentions
- QLD Questions on Notice: site:parliament.qld.gov.au "question on notice" water OR dam OR Sunwater
- Minister for Water statements: Glenn Butcher (if Labor) or current minister
- Shadow Minister statements and press releases
- Local MPs in irrigation regions: Bundaberg, Burdekin, Central Highlands, Darling Downs
- Federal Water Minister statements on Queensland

SEARCH QUERIES TO EXECUTE:
1. "Queensland Parliament" water OR Sunwater OR dam site:parliament.qld.gov.au
2. "Minister for Water" Queensland announcement 2024 OR 2025
3. site:statements.qld.gov.au water OR irrigation OR dam
4. "Question on Notice" Queensland water OR Sunwater

OUTPUT FORMAT (return as structured list):
For each finding:
- POLITICIAN: [Name, Party, Role]
- CONTEXT: [Parliament/Press Conference/Social Media/Media Release]
- DATE: [YYYY-MM-DD]
- TOPIC: [Brief description]
- KEY_QUOTE: [Direct quote if available]
- SENTIMENT: [Supportive/Critical/Neutral toward Sunwater or water policy]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Paywall / Could not verify]

If nothing found, state: "NO_FINDINGS: No significant political mentions identified for this period."
```

### Agent 2: Policy & Regulation

```prompt
You are the Policy Analyst searching for Queensland water policy and regulatory developments from the last 7 days.

SEARCH TARGETS:
- QLD Dept of Regional Development, Manufacturing and Water (DRDMW)
- Federal DCCEEW announcements affecting Queensland
- Queensland Competition Authority (QCA) - irrigation pricing decisions
- Water Plan reviews or amendments
- EIS determinations for water projects
- Government Gazette notices

SEARCH QUERIES TO EXECUTE:
1. site:rdmw.qld.gov.au news OR announcement 2024 OR 2025
2. site:qca.org.au irrigation OR water OR Sunwater
3. "Queensland Government" water policy announcement
4. site:dcceew.gov.au Queensland water funding OR allocation
5. "Environmental Impact Statement" Queensland dam OR weir

OUTPUT FORMAT (return as structured list):
For each finding:
- AGENCY: [Department/Authority name]
- TYPE: [Legislation/Funding/Pricing Decision/Policy Change/EIS]
- DATE: [YYYY-MM-DD]
- TITLE: [Official title or headline]
- SUMMARY: [One paragraph describing the change]
- IMPACT: [Who/what is affected - be specific]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Paywall / Could not verify]

If nothing found, state: "NO_FINDINGS: No major policy announcements identified for this period."
```

### Agent 3: News & Media

```prompt
You are the News Aggregator searching for Queensland water media coverage from the last 7 days. Focus on independent reporting, not press releases.

SEARCH TARGETS:
- Rural Press: Queensland Country Life, North Queensland Register, The Land
- ABC Regional: ABC Wide Bay, ABC North Queensland, ABC Rural
- Major Outlets: Courier-Mail, Brisbane Times
- Regional Papers: Bundaberg NewsMail, Townsville Bulletin, Rockhampton Morning Bulletin, Dalby Herald

SEARCH QUERIES TO EXECUTE:
1. "Queensland" water security OR irrigation OR dam -site:gov.au
2. site:queenslandcountrylife.com.au water OR irrigation OR dam
3. site:abc.net.au/news Queensland water OR dam OR irrigation
4. "Sunwater" OR "water allocation" Queensland
5. "drought" OR "flood" Queensland water management
6. site:northqueenslandregister.com.au water OR irrigation

OUTPUT FORMAT (return as structured list):
For each finding:
- OUTLET: [Publication name]
- HEADLINE: [Exact headline]
- DATE: [YYYY-MM-DD]
- AUTHOR: [If available]
- KEY_NARRATIVE: [What is the story about? 2-3 sentences]
- STAKEHOLDERS_QUOTED: [List names and organizations quoted]
- TONE: [Factual/Alarmist/Positive/Critical]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Paywall / Could not verify]

If nothing found, state: "NO_FINDINGS: No significant media coverage identified for this period."
```

### Agent 4: Sunwater Direct

```prompt
You are the Brand Monitor searching for all Sunwater-specific content from the last 7 days.

SEARCH TARGETS:
- Sunwater website news section: sunwater.com.au/news
- Sunwater LinkedIn posts
- Sunwater operational notices (service disruptions, recreational closures)
- QTenders: Sunwater-issued tenders
- Sunwater recruitment (significant hires may signal strategic shifts)

SEARCH QUERIES TO EXECUTE:
1. site:sunwater.com.au news OR announcement
2. site:linkedin.com/company/sunwater
3. site:qtenders.epw.qld.gov.au Sunwater
4. "Sunwater" tender OR contract Queensland
5. "Sunwater" operational notice OR service disruption
6. site:seek.com.au Sunwater (for significant roles)

OUTPUT FORMAT (return as structured list):
For each finding:
- SOURCE: [Sunwater website/LinkedIn/QTenders/etc.]
- TYPE: [Corporate News/Operational Notice/Tender/Recruitment/Social Media]
- DATE: [YYYY-MM-DD]
- TITLE: [Title or description]
- DETAIL: [Summary of content]
- STRATEGIC_RELEVANCE: [Why this matters - infrastructure, capability, operations]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Could not verify]

If nothing found, state: "NO_FINDINGS: No specific Sunwater activity detected for this period."
```

### Agent 5: Stakeholder Groups

```prompt
You are the Stakeholder Liaison monitoring agricultural and community organizations for water-related commentary from the last 7 days.

SEARCH TARGETS:
Peak Bodies:
- Queensland Farmers' Federation (QFF)
- AgForce Queensland
- CANEGROWERS Queensland
- Cotton Australia (Queensland)
- Growcom / QFVG

Regional/Scheme Groups:
- Bundaberg Regional Irrigators Group (BRIG)
- Burdekin River Irrigation Area Association (BRIA)
- Central Highlands Cotton Growers & Irrigators Association
- National Irrigators' Council (NIC)

Environmental Groups:
- Queensland Conservation Council
- Lock the Gate Alliance

SEARCH QUERIES TO EXECUTE:
1. site:qff.org.au news OR media release
2. site:agforceqld.org.au water OR irrigation OR dam
3. site:canegrowers.com.au water OR Sunwater OR pricing
4. site:cottonaustralia.com.au Queensland water
5. "Queensland Farmers Federation" water statement
6. "AgForce" Queensland water OR irrigation
7. "irrigators" Queensland concerns OR support

OUTPUT FORMAT (return as structured list):
For each finding:
- ORGANIZATION: [Full name]
- TYPE: [Press Release/Submission/Social Media/Media Quote]
- DATE: [YYYY-MM-DD]
- STANCE: [Supporting/Opposing/Neutral] + [What specifically]
- KEY_POINTS: [Main arguments or positions - 2-3 sentences]
- TARGET: [Who/what are they addressing - government, Sunwater, policy]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Could not verify]

If nothing found, state: "NO_FINDINGS: No major stakeholder commentary identified for this period."
```

### Agent 6: Infrastructure Projects

```prompt
You are the Project Tracker searching for Queensland water infrastructure updates from the last 7 days.

PRIORITY PROJECTS (search each specifically):
- Paradise Dam Improvement Project
- Burdekin Falls Dam Raising
- Rookwood Weir
- Nathan Dam
- Urannah Dam
- Big Rocks Weir
- Nullinga Dam
- Emu Swamp Dam
- Fitzroy to Gladstone Pipeline

SEARCH QUERIES TO EXECUTE:
1. "Paradise Dam" Queensland update OR progress OR construction
2. "Rookwood Weir" Queensland
3. "Burdekin Falls Dam" raising OR upgrade
4. "Nathan Dam" Queensland feasibility OR funding
5. "Urannah Dam" Queensland
6. site:nationalwatergrid.gov.au Queensland
7. Queensland dam construction milestone OR tender 2024 OR 2025
8. "water infrastructure" Queensland funding OR announcement

INFORMATION TO CAPTURE:
- Construction milestones
- EIS progress or determinations
- Tender awards or procurement
- Budget updates or cost revisions
- Timeline changes (delays or acceleration)
- Geotechnical or engineering updates

OUTPUT FORMAT (return as structured list):
For each finding:
- PROJECT: [Project name]
- UPDATE_TYPE: [Milestone/Tender/Budget/Timeline/EIS/Technical]
- DATE: [YYYY-MM-DD]
- STATUS_CHANGE: [What changed or was announced]
- DETAIL: [Specifics - costs, dates, scope]
- SOURCE: [Where this came from]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Could not verify]

If nothing found, state: "NO_FINDINGS: No significant infrastructure updates identified for this period."
```

---

## LAYER 2: Enrichment (Run After Layer 1 Completes)

After Layer 1 agents return, launch these enrichment agents to deepen the analysis.

### Agent 7: Contrarian Search

```prompt
You are the Opposition Researcher. Your job is to find CONTRARIAN VIEWPOINTS for issues identified in the primary search.

ISSUES TO INVESTIGATE:
[INSERT KEY ISSUES FROM LAYER 1 HERE - e.g., "Paradise Dam funding announcement", "QCA pricing decision"]

For EACH major issue, execute these searches:
1. "[Issue/Project] opposition" OR "concerns" OR "criticism"
2. "[Issue/Project] environmental impact" OR "community backlash"
3. "[Issue/Project]" site:lockthegate.org.au OR site:qldconservation.org.au

ORGANIZATIONS TO CHECK:
- Queensland Conservation Council
- Lock the Gate Alliance
- Environmental Defenders Office
- Local landholder groups
- Political opposition (Labor/LNP/Greens depending on government)
- Academic critics

OUTPUT FORMAT (return as structured list):
For each contrarian finding:
- ORIGINAL_ISSUE: [The issue this opposes]
- CRITIC: [Organization or individual name]
- CRITICISM_TYPE: [Environmental/Economic/Social/Procedural/Safety]
- KEY_ARGUMENT: [Their main objection - 2-3 sentences]
- EVIDENCE_CITED: [What evidence or concerns do they raise]
- DATE: [YYYY-MM-DD]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Could not verify]

If no opposition found for an issue, state: "NO_OPPOSITION_FOUND: [Issue name] - no contrarian coverage identified"
```

### Agent 8: Regional Councils

```prompt
You are the Regional Monitor searching for local government water advocacy and proposals from the last 7 days.

KEY COUNCILS TO MONITOR:
- Toowoomba Regional Council
- Western Downs Regional Council
- Bundaberg Regional Council
- Charters Towers Regional Council
- Mackay Regional Council
- Isaac Regional Council
- Rockhampton Regional Council
- Gladstone Regional Council
- Tablelands Regional Council

SEARCH QUERIES TO EXECUTE:
1. "Regional Council" Queensland "water security" OR "new dam" OR "water infrastructure"
2. site:tr.qld.gov.au water (Toowoomba)
3. site:bundaberg.qld.gov.au water
4. "council meeting" Queensland water infrastructure agenda
5. "regional water strategy" Queensland
6. "new dam proposal" OR "weir proposal" Queensland council
7. "water advocacy" Queensland regional

INFORMATION TO CAPTURE:
- New infrastructure advocacy or proposals
- Council meeting agenda items on water
- Regional water strategies
- Submissions to state/federal government
- Partnerships with Sunwater or other providers

OUTPUT FORMAT (return as structured list):
For each finding:
- COUNCIL: [Council name]
- TYPE: [Advocacy/Proposal/Meeting Agenda/Strategy/Partnership]
- DATE: [YYYY-MM-DD]
- TOPIC: [What water issue are they addressing]
- DETAIL: [Specifics of proposal or advocacy position]
- STATE_OF_PLAY: [Where is this up to - early proposal/formal submission/approved]
- URL: [Direct link]
- VERIFICATION: [Confirmed accessible / Could not verify]

If nothing found, state: "NO_FINDINGS: No significant regional council water activity identified for this period."
```

### Agent 9: Forward-Looking Radar

```prompt
You are the Horizon Scanner identifying upcoming events, deadlines, and emerging issues relevant to Queensland water.

SEARCH TARGETS:

Procurement & Tenders:
- QTenders water infrastructure upcoming
- Expressions of Interest water Queensland

Regulatory Calendar:
- QCA submission deadlines irrigation
- EIS public comment periods water projects
- Water Plan review submission dates

Parliamentary:
- Budget Estimates hearing dates
- Parliamentary committee inquiries water

Seasonal Factors (adjust based on current month):
- IF May-June: "water year" announcements, "announced allocation" July predictions, "carryover" rules
- IF Oct-Dec: "wet season" preparedness, "flood mitigation" plans, cyclone preparedness
- IF May-June: State Budget water allocation, pre-budget submissions

SEARCH QUERIES TO EXECUTE:
1. site:qtenders.epw.qld.gov.au water infrastructure closing
2. site:qca.org.au submission deadline irrigation
3. "public submission" Queensland water OR dam closing
4. "Budget Estimates" Queensland water minister
5. Queensland "water plan" review consultation
6. "announced allocation" Queensland prediction OR forecast
7. EIS "public comment" Queensland dam OR weir

OUTPUT FORMAT (return as structured list):
For each upcoming item:
- TYPE: [Tender Deadline/Submission Deadline/Parliamentary/Seasonal]
- EVENT: [Description of what's upcoming]
- DATE: [YYYY-MM-DD or date range]
- RELEVANCE: [Why this matters for Sunwater/water sector]
- ACTION_REQUIRED: [What stakeholders might need to do]
- URL: [Direct link if available]
- VERIFICATION: [Confirmed / Estimated date]

If nothing found, state: "NO_FINDINGS: No significant upcoming events identified."
```

---

## LAYER 3: Synthesis

After all agents complete, synthesize findings into the final report.

### Agent 10: Synthesis & Report

```prompt
You are the Chief Editor synthesizing all agent findings into a cohesive Weekly Media Scan.

INPUT DATA:
[PASTE ALL AGENT OUTPUTS HERE]

SYNTHESIS INSTRUCTIONS:

1. DEDUPLICATE
- Identify the same story reported by multiple agents (e.g., News Agent and Stakeholder Agent both found QFF response to pricing decision)
- Merge into single entries, noting all sources
- Identify the TRIGGER EVENT that caused multiple responses

2. CROSS-REFERENCE
- Link stakeholder reactions to the government announcements that triggered them
- Connect opposition views to the proposals they oppose
- Note where the same politician/organization appears multiple times

3. PRIORITIZE FOR EXECUTIVE NARRATIVE
Top priority (lead the narrative):
- Major funding announcements (>$50M)
- Safety incidents or concerns
- Political attacks on Sunwater
- Significant policy changes
- Project delays or cost blowouts

Medium priority:
- Stakeholder advocacy campaigns
- Routine project milestones
- Regulatory process updates

Lower priority (mention briefly):
- Routine operational notices
- Minor tenders
- General industry commentary

4. CATEGORIZE
Group findings into these sections:
- Infrastructure & Projects
- Policy & Pricing
- Political & Parliamentary
- Stakeholder Relations
- Regional Issues
- Operational Notes

5. FORMAT OUTPUT

Use this exact structure:

---
date: [TODAY'S DATE]
title: Weekly Water Scan - [DATE RANGE]
type: scan
period: [START DATE] to [END DATE]
---

## Executive Narrative

[2-3 paragraphs synthesizing the week's major themes. Connect political statements to stakeholder reactions. Identify the dominant narrative. Note any emerging risks.]

---

## Key Developments

### [Issue Category: e.g., Infrastructure]

**[Issue Name]**
- **Trigger:** [What caused this to be news]
- **Summary:** [2-3 sentences on what happened]
- **Key Voices:** [Who said what - include opposing views]
- **Sources:** [List all sources with links]

[Repeat for each significant issue]

---

## Stakeholder Activity

| Organization | Position | Topic | Link |
|-------------|----------|-------|------|
| [Name] | [Support/Oppose/Concern] | [Brief topic] | [URL] |

---

## Forward Look

- **[DATE]:** [Upcoming event/deadline]
- **[DATE]:** [Upcoming event/deadline]

---

## Articles for Import

The following URLs contain substantive articles suitable for `/add-article`:

1. [Headline] - [URL]
2. [Headline] - [URL]

---

## Nil Returns

The following searches returned no significant findings:
- [Agent name]: [Brief explanation]

---

*Scan conducted: [TODAY'S DATE]*
*Period covered: [DATE RANGE]*
```

---

## ORCHESTRATION WORKFLOW

Execute this scan by following these steps:

### Step 1: Launch Layer 1 Agents (Parallel)

Use the Task tool to launch ALL 6 Layer 1 agents simultaneously in a single message. Each agent should use `subagent_type: "general-purpose"` and receive its full prompt from above.

Example:
```
Launch 6 Task agents in parallel:
- Agent 1: Politics & Parliament
- Agent 2: Policy & Regulation
- Agent 3: News & Media
- Agent 4: Sunwater Direct
- Agent 5: Stakeholder Groups
- Agent 6: Infrastructure Projects
```

### Step 2: Collect Layer 1 Results

Wait for all 6 agents to return. Document findings in a structured intermediate format.

### Step 3: Launch Layer 2 Agents (Parallel)

Based on Layer 1 findings, launch 3 enrichment agents:
- Agent 7: Contrarian Search (feed it the key issues found)
- Agent 8: Regional Councils
- Agent 9: Forward-Looking Radar

### Step 4: Synthesis

Launch Agent 10 with ALL findings from Layers 1 and 2. This agent produces the final formatted report.

### Step 5: Save Output

Write the final report to: `web/content/scans/YYYY-MM-DD-weekly-scan.md`

### Step 6: Report to User

Provide a summary including:
- Number of findings per agent
- Key themes identified
- Articles recommended for `/add-article` import
- Any agents that returned nil findings
- Link to the saved scan file

---

## Quality Standards

- **NO HALLUCINATION:** Only report information that agents could verify from sources
- **SOURCE EVERYTHING:** Every finding must have a URL
- **MARK PAYWALLS:** Clearly indicate if content was behind a paywall
- **DATE ACCURACY:** All dates must be verified, not estimated
- **DEDUPLICATION:** Same story from multiple sources = one entry with multiple source links

---

## Error Handling

- If an agent times out or fails, note this in the final report under "Nil Returns"
- If a source is blocked (e.g., National Water Grid often blocks), note this and proceed
- If no findings for a category, explicitly state this rather than omitting the section
