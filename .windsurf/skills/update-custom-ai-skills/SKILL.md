---
name: update-custom-ai-skills
description: Extract reusable engineering insights from a session and format them as a structured ai-skills.md entry
---

# Update AI Skills

Extract a single high-value, reusable engineering insight from the current session and format it for `ai-skills.md`.

---

## Invocation Criteria

Use this skill ONLY if the session includes at least one of:

- non-trivial implementation
- architectural decision or trade-off
- meaningful debugging with root-cause insight

If none apply, return exactly:

No significant reusable learning found.

---

## Extraction Guidelines

Identify ONE core insight that is:

- reusable across projects
- non-obvious or experience-based
- generalizable beyond the current task

Focus on:

- patterns or abstractions
- architectural decisions
- debugging strategies
- performance or scalability learnings

Ignore:

- trivial fixes
- obvious or boilerplate code
- repetitive or already-known patterns

---

## Output Requirements

Return EXACTLY the following structure. Do not add extra text.

## [SKILL] {Short Descriptive Title}

**Date:** {YYYY-MM-DD}  
**Tags:** #{tag1} #{tag2}

### Context

{Brief description of the problem or situation}

### Insight

{Core realization, clearly explained and generalizable}

### Pattern

- {Actionable reusable approach}
- {Steps, rules, or principles if applicable}

### Example (optional)

```typescript
// minimal, relevant snippet
```
