<!-- update-custom-ai-skills/SKILL.md -->

---

name: update-custom-ai-skills
description: Extract reusable engineering insights and failures from a session into a structured ai-skills.md entry

---

# Update AI Skills

Extract a single high-value, reusable engineering insight OR failure from the current session and format it for `ai-skills.md`.

---

## Invocation Criteria

Use this skill ONLY if the session includes at least one of:

- non-trivial implementation
- architectural decision or trade-off
- meaningful debugging with root-cause insight
- clearly understood failure or bug

If none apply, return exactly:

No significant reusable learning found.

---

## Extraction Guidelines

Identify ONE core item that is:

- reusable across projects
- non-obvious or experience-based
- generalizable beyond the current task

Focus on:

- patterns or abstractions
- architectural decisions
- debugging strategies
- performance or scalability learnings
- failures with clear root cause

Ignore:

- trivial fixes
- obvious or boilerplate code
- repetitive or already-known patterns
- failures without root cause

---

## Output Requirements

Return EXACTLY the following structure.  
Do not add any text before or after the output.

## [SKILL] {Short Descriptive Title}

**Date:** {YYYY-MM-DD}  
**Tags:** #{tag1} #{tag2}

### Context

{Brief description of the problem or situation}

### Insight

{Core realization (why this matters, generalized)}

### Pattern

- {Actionable reusable approach (what to do)}
- {Steps, rules, or principles if applicable}

### Lessons Learned (optional)

- {failure or mistake with root cause}
- {edge case or incorrect assumption}

### Example (optional)

```typescript
// minimal, relevant snippet
```
