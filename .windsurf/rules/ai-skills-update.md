<!-- ai-skills-update.md -->

---

trigger: model_decision
description: Suggest invoking update-ai-skills when meaningful engineering insights or failures emerge

---

<ai_skills_update_rule>

## Trigger Conditions

Suggest ONLY if BOTH are true:

1. Task involves:
   - feature implementation
   - refactor
   - architecture decision
   - debugging / issue resolution

2. Outcome contains CLEAR and REUSABLE value:
   - reusable, non-obvious, or generalizable insight
   - clearly understood failure with root cause

Otherwise:

- Do NOT suggest update

---

## Qualification Criteria

Valid insights include:

- reusable patterns or abstractions
- architectural decisions or trade-offs
- debugging strategies with root-cause understanding
- performance or scalability improvements
- non-trivial implementation techniques

Valid failures include:

- bugs with identified root cause
- incorrect assumptions leading to issues
- edge cases discovered during implementation
- performance bottlenecks with explanation

DO NOT include:

- trivial fixes
- obvious or self-explanatory code
- duplicate or already documented patterns
- failures without clear root cause

---

## Behavior Rules

- NEVER update `ai-skills.md` automatically
- ONLY suggest using:

  "Do you want me to extract this into ai-skills.md?"

- If user confirms:
  → invoke `@update-ai-skills`

- If declined:
  → do nothing

---

## Output Handling

- Do NOT manually generate the entry in this rule
- Delegate ALL extraction and formatting to:
  → `@update-ai-skills`

---

## Deduplication Rules

Before suggesting:

- Check if similar concept already exists
- If yes:
  - refine or extend instead of creating a new entry
- Avoid semantic duplicates

---

## Interaction Rule

- Ask the update question ONLY IF:
  - trigger conditions are met
  - qualification criteria are satisfied

- Otherwise:
  - do nothing

---

## Quality Principle

- Prefer fewer, high-quality entries over frequent low-value updates
- Prioritize insights with strong reuse potential
- Capture failures ONLY when root cause is clearly understood

</ai_skills_update_rule>
