---
trigger: model_decision
description: Suggest invoking update-ai-skills when meaningful engineering insights emerge
---

<ai_skills_update_rule>

## Trigger Conditions

Suggest ONLY if BOTH are true:

1. Task involves:
   - feature implementation
   - refactor
   - architecture decision
   - debugging / issue resolution

2. Outcome contains:
   - reusable, non-obvious, or generalizable insight

---

## Qualification Criteria

Valid insights include:

- reusable patterns or abstractions
- architectural decisions or trade-offs
- debugging strategies with root-cause understanding
- performance or scalability improvements
- non-trivial implementation techniques

DO NOT include:

- trivial fixes
- obvious or self-explanatory code
- duplicate or already documented patterns

---

## Behavior Rules

- NEVER update `ai-skills.md` automatically
- ONLY suggest invocation using:

  "Do you want me to extract this into ai-skills.md?"

- If user confirms:
  → invoke `@update-ai-skills`

- If declined:
  → do nothing

---

## Output Handling

- Do NOT manually generate the entry in this rule
- Delegate ALL formatting and extraction to the skill:
  → `@update-ai-skills`

---

## Deduplication Rules

Before suggesting:

- Check if similar concept already exists
- If yes:
  - prefer refining existing entry instead of creating a new one
- Avoid semantic duplicates

---

## Interaction Rule

- Ask the update question ONLY IF:
  - trigger conditions are met
  - qualification criteria are satisfied

- Otherwise:
  - DO NOT mention `ai-skills.md`

---

## Quality Principle

- Prefer fewer, high-quality entries over frequent low-value updates

</ai_skills_update_rule>
