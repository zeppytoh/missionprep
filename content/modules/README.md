# Module Authoring Guide

This guide explains how to create module content using markdown with custom directives.

## File Structure

Each module is a single `.md` file with YAML frontmatter and 7 pages separated by `## Page N:` headings.

```
content/modules/
├── README.md (this file)
├── _template.md (blank template)
├── 01-welcome-orientation.md
├── 02-logistics-safety.md
└── ... (more modules)
```

## Frontmatter

Every module must start with YAML frontmatter:

```yaml
---
slug: cultural-sensitivity
title: "Cultural Sensitivity Foundations"
tier: 1
order: 4
estimatedMinutes: 25
prerequisites: [why-japan-challenging]
---
```

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | URL-friendly identifier (no spaces, lowercase) |
| `title` | string | Display name for the module |
| `tier` | 1 or 2 | Module tier (1 = Pre-Arrival, 2 = Ministry Prep) |
| `order` | number | Sort order within tier |
| `estimatedMinutes` | number | How long to complete (rough estimate) |
| `prerequisites` | array | Slugs of required modules (empty array if none) |

## Page Structure

Modules follow a 7-page structure. Separate pages with `## Page N: Title` headings:

```markdown
## Page 1: Unit Introduction

Content here...

## Page 2: Section 1 Title

Content here...

## Page 7: Prayer Guide

Content here...
```

**Standard 7-Page Format:**
1. **Unit Introduction** - Welcome, learning outcomes, study time
2. **Section 1** - Inquiry-based lesson
3. **Section 2** - Inquiry-based lesson
4. **Section 3** - Case studies / interactive
5. **Section 4** - Practical reference
6. **Lesson Summary** - Key takeaways
7. **Prayer Guide** - Prayer prompts or iframe embed

## Content Blocks

Use `:::directive{attrs}` syntax to create structured content blocks.

### Text Block

Plain markdown becomes a text block automatically. No directive needed.

```markdown
This is regular text that will render as a text block.

**Bold**, *italic*, and [links](url) work as expected.
```

### Video Block

Embed YouTube videos (responsive, lazy-loaded).

```markdown
:::video{url="https://youtube.com/embed/VIDEO_ID" title="Video Title" duration=180}
:::
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `url` | Yes | YouTube embed URL (use `/embed/` format) |
| `title` | No | Video title |
| `duration` | No | Length in seconds (for display) |

### Info Box Block

Highlighted callout for important information.

```markdown
:::info-box{heading="Important Note"}
This content will appear in a highlighted box with an icon.
:::
```

### Key Point Block

Summary takeaway or key concept.

```markdown
:::key-point{heading="Remember This"}
**Communication:** "Yes" protects relationships, silence shows respect.
:::
```

### Activity Block

Inquiry-based learning activity with setup, investigation, and discovery sections.

```markdown
:::activity{title="The Two-Sided Coin"}
**Setup:** Present this scenario: "You invite Kenji..."

**Investigation:** Introduce the concepts of Honne and Tatemae:
- Honne — a person's true feelings
- Tatemae — the polite, socially appropriate response

**Discovery:** Kenji wasn't lying. He was protecting the relationship.
:::
```

| Section | Required | Description |
|---------|----------|-------------|
| `**Setup:**` | Recommended | Introduce the activity |
| `**Investigation:**` | Recommended | What students explore |
| `**Discovery:**` | Recommended | Debrief and takeaways |

### Case Study Block

Scenario-based learning with situation, diagnosis, and solution.

```markdown
:::case-study{title="The Silent Student"}
**Situation:** You ask a great question. Japanese students say nothing.

**Diagnosis:** In Japan, silence is respect and thoughtfulness, not disengagement.

**Solution:** Wait 30 seconds. Give space. Don't rush to fill silence.
:::
```

### Quiz Block

Interactive quiz (can be inline for learning checks or marked as completion quiz).

```markdown
:::quiz{passingScore=70 isCompletionQuiz=true}
1. What percentage of Japan identifies as Christian?
   a) Less than 1%
   b) About 5%
   c) About 10%
   d) About 15%
   *Correct: a*
   *Explanation: Japan has less than 1% Christian population.*

2. What was the Goningumi system?
   a) A meditation practice
   b) A mutual surveillance system
   c) A wedding ceremony
   d) A martial arts system
   *Correct: b*
   *Explanation: Groups of five families reported on each other.*
:::
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `passingScore` | 70 | Percentage needed to pass (0-100) |
| `isCompletionQuiz` | false | `true` = required for module completion<br>`false` = optional learning check |

**Quiz Format:**
- Number questions: `1.`, `2.`, etc.
- Options: `a)`, `b)`, `c)`, `d)`
- Mark correct: `*Correct: a*`
- Explanation: `*Explanation: text*`

**Inline Quizzes vs Completion Quiz:**
- Use `isCompletionQuiz=false` for learning checks at end of any page
- Use `isCompletionQuiz=true` for the final quiz that gates module completion
- Only ONE completion quiz per module (typically on last page)

### Reflection Block

Personal note prompt for students (not required for completion).

```markdown
:::reflection{id="r1"}
Think about a time someone told you what you wanted to hear instead of the truth. How did it feel when you found out?
:::
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Unique identifier (e.g., `r1`, `r2`) |

**About Reflections:**
- Students' answers are saved permanently (personal notes)
- Accessible when reviewing completed modules
- Administrators can view for monitoring (post-MVP)
- NOT required for module completion

### Embed Block

External iframe (e.g., prayer guides from nextsteps.is).

```markdown
:::embed{url="https://nextsteps.is/prayer-guide" title="Prayer Guide" height=600}
:::
```

## Example Module

See `_template.md` for a complete blank template.

Here's a minimal example:

```markdown
---
slug: example-module
title: "Example Module"
tier: 1
order: 1
estimatedMinutes: 20
prerequisites: []
---

## Page 1: Introduction

Welcome to this module! Here's what you'll learn:

:::video{url="https://youtube.com/embed/abc123" title="Welcome Video"}
:::

## Page 2: Main Content

This is regular text content.

:::info-box{heading="Key Concept"}
Important information here.
:::

:::quiz{passingScore=70 isCompletionQuiz=false}
1. What is 2 + 2?
   a) 3
   b) 4
   c) 5
   *Correct: b*
   *Explanation: Basic math!*
:::

## Page 7: Wrap Up

:::reflection{id="r1"}
What did you learn today?
:::
```

## Seeding Modules

After creating or editing a module file:

```bash
npm run seed
```

This parses all `.md` files in `content/modules/` and inserts/updates them in the database.

## Tips

- **Plain text doesn't need directives** - Just write markdown normally
- **One completion quiz per module** - Use `isCompletionQuiz=true` only once
- **Page titles matter** - They appear in navigation
- **Test your module** - Run seed, then check the app
- **Copy `_template.md`** - Start new modules from the template

## Troubleshooting

**"Module not showing up"** - Check that:
- File doesn't start with `_` or `README`
- Frontmatter is valid YAML
- You ran `npm run seed`
- Check seed output for errors

**"Quiz not working"** - Verify:
- Options are labeled `a)`, `b)`, `c)`, `d)`
- `*Correct: X*` matches an option
- `*Explanation:*` is present

**"Page navigation broken"** - Ensure:
- Pages use `## Page N:` format (exact match)
- Page numbers are sequential (1-7)
