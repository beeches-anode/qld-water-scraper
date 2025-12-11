# Multi-Agent Media Scan Architecture

This directory contains prompt templates for the specialized agents used in the `/media-scan` workflow.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                                     │
│                    (/media-scan command)                                │
│                                                                          │
│  Coordinates parallel execution and tracks progress via TodoWrite       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Primary Search (6 agents run in parallel)                     │
├────────────┬────────────┬────────────┬────────────┬────────────┬────────┤
│ Agent 1    │ Agent 2    │ Agent 3    │ Agent 4    │ Agent 5    │ Agent 6│
│ Politics   │ Policy     │ News       │ Sunwater   │ Stakeholder│ Infra  │
│ Parliament │ Regulation │ Media      │ Direct     │ Groups     │ Project│
└────────────┴────────────┴────────────┴────────────┴────────────┴────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Enrichment (3 agents, run after Layer 1)                      │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│ Agent 8             │ Agent 9             │ Agent 10                    │
│ Contrarian Search   │ Regional Councils   │ Forward-Looking Radar       │
│ (Opposition views)  │ (Local government)  │ (Upcoming events)           │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Synthesis                                                      │
│                                                                          │
│  Agent 7: Chief Editor                                                  │
│  - Deduplicates findings                                                │
│  - Cross-references reactions to triggers                               │
│  - Prioritizes for executive narrative                                  │
│  - Formats final report                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    web/content/scans/YYYY-MM-DD-weekly-scan.md
```

## Agent Files

| File | Agent | Layer | Purpose |
|------|-------|-------|---------|
| `01_agent_politics.md` | Politics & Parliament | 1 | QLD Hansard, Minister statements, MPs |
| `02_agent_policy.md` | Policy & Regulation | 1 | DRDMW, QCA, DCCEEW, EIS |
| `03_agent_news_media.md` | News & Media | 1 | Rural press, ABC, regional papers |
| `04_agent_sunwater.md` | Sunwater Direct | 1 | Sunwater channels, tenders, operations |
| `05_agent_community_ag.md` | Stakeholder Groups | 1 | QFF, AgForce, irrigator groups |
| `06_agent_infrastructure.md` | Infrastructure Projects | 1 | Dam/weir project updates |
| `07_agent_synthesis.md` | Synthesis & Report | 3 | Final report compilation |
| `08_agent_contrarian.md` | Contrarian Search | 2 | Opposition and criticism |
| `09_agent_regional_councils.md` | Regional Councils | 2 | Local government advocacy |
| `10_agent_forward_radar.md` | Forward-Looking Radar | 2 | Upcoming events and deadlines |

## Execution Flow

### 1. Launch Layer 1 (Parallel)
```
Task tool launches 6 agents simultaneously:
- Each agent receives its specific prompt
- Each agent searches its domain independently
- Each agent returns structured findings
```

### 2. Collect & Analyze Layer 1 Results
```
Orchestrator:
- Collects all Layer 1 outputs
- Identifies key issues for Layer 2 enrichment
- Notes any agent failures or nil returns
```

### 3. Launch Layer 2 (Parallel)
```
Task tool launches 3 enrichment agents:
- Agent 8 receives key issues to find opposition
- Agent 9 searches regional councils
- Agent 10 scans forward calendar
```

### 4. Synthesis (Sequential)
```
Agent 7 receives ALL outputs and:
- Deduplicates same stories from multiple agents
- Cross-references reactions to triggering events
- Prioritizes findings for executive narrative
- Produces formatted markdown report
```

### 5. Output
```
Final report saved to: web/content/scans/YYYY-MM-DD-weekly-scan.md
Article URLs extracted for /add-article workflow
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/media-scan` | Full multi-agent scan (10 agents, ~15-20 min) |
| `/media-scan-quick` | Single-pass quick scan (~5 min) |
| `/import-scan-articles` | Batch import articles from scan results |

## Output Locations

- **Scan reports:** `web/content/scans/`
- **Imported articles:** `web/content/articles/`

## Quality Standards

All agents follow these standards:

1. **NO HALLUCINATION** - Only report verified information with sources
2. **SOURCE EVERYTHING** - Every finding must have a URL
3. **MARK ACCESS ISSUES** - Clearly indicate paywalls or blocked content
4. **DATE ACCURACY** - All dates must be verified
5. **STRUCTURED OUTPUT** - Use consistent format for synthesis

## When to Use What

| Scenario | Recommended Approach |
|----------|---------------------|
| Weekly comprehensive scan | `/media-scan` |
| Mid-week check-in | `/media-scan-quick` |
| Breaking news check | `/media-scan-quick` |
| Deep research on specific issue | Manual agent prompts |
| Building article database | `/media-scan` → `/import-scan-articles` |

## Customization

To modify agent behavior:
1. Edit the relevant agent file in this directory
2. Update the embedded prompts in `/media-scan` command
3. Test with a single agent before running full scan

## Troubleshooting

**Agent times out:**
- Reduce parallel agents from 6 to 3
- Check if specific sources are blocking requests

**No findings returned:**
- Verify search date range is correct
- Check if sources have changed URLs
- Try manual WebSearch with same queries

**Duplicate findings in report:**
- Synthesis agent should handle this
- If persisting, check Agent 7 deduplication logic

**Paywalled content:**
- Note in report, don't hallucinate content
- Search for alternative coverage
- Mark as "PAYWALLED - content not accessible"
