<!-- ai-skills-usage.md -->

---

trigger: model_decision
description: Reuse relevant patterns and avoid known failures from ai-skills.md when clearly applicable

---

<ai_skills_usage_rule>

## Purpose

Leverage previously learned patterns and failures from `ai-skills.md` to improve solution quality, consistency, and reliability.

---

## When to Apply

Apply ONLY if there is clear relevance:

- The task closely matches a previously documented pattern or failure
- A known reusable abstraction can directly improve the solution
- A known failure or edge case is likely to occur in this context

Otherwise:

- Do NOT apply `ai-skills.md`

---

## How to Apply

- Identify the most relevant pattern OR failure
- Adapt it to the current context (do NOT copy blindly)
- Use it only if it improves the solution meaningfully
- Avoid previously observed mistakes or edge cases

---

## Constraints

- Do NOT force-fit patterns into unrelated problems
- Do NOT degrade simplicity by over-applying abstractions
- Do NOT over-optimize prematurely

### Priority Order

1. Correctness
2. Simplicity
3. Clarity
4. Reuse of patterns

---

## Behavior

- Apply silently when useful
- Do NOT mention `ai-skills.md` unless explicitly asked
- Do NOT override a better or simpler solution
- If a known failure is highly relevant, prioritize avoiding it
- If no strong benefit exists, do nothing

---

## Quality Principle

- Patterns guide what to do
- Failures guide what to avoid
- Prefer contextual intelligence over rigid reuse

</ai_skills_usage_rule>
