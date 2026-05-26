
# ScratchKids — Learning Platform for Young Coders

A bright, playful platform where your 8-year-old can explore Scratch concepts you've taught, with illustrated lessons, mini-quizzes, and a star/badge progress system. Parent accounts can review progress.

## What we'll build (v1)

### Pages
- **/** — Colorful landing with kid-friendly hero, "Start Learning" CTA, parent login link
- **/login** & **/signup** — Auth (email + password). On signup pick role: Kid or Parent
- **/learn** — Lesson map: big tiles for each Scratch category, stars showing completion
- **/learn/$lessonId** — Lesson page (illustrated concept → examples → "Try it" prompts → quiz)
- **/quiz/$lessonId** — Interactive quiz (multiple choice, drag-to-match, true/false)
- **/badges** — Trophy room of earned badges
- **/parent** — Parent dashboard: child's progress, time spent, quiz scores

### Scratch curriculum (hard-coded, 9 modules)
1. **What is Scratch?** — the editor tour, stage, sprite area, block palette
2. **Sprites** — what a sprite is, library, upload, draw your own, costumes
3. **Motion blocks** — move, turn, glide, go to, point, bounce on edge
4. **Looks blocks** — say, think, switch costume, size, effects, show/hide
5. **Sound blocks** — play sound, instruments, drums, volume
6. **Events** — when flag clicked, key pressed, sprite clicked, broadcast
7. **Control** — wait, repeat, forever, if/else, stop
8. **Sensing** — touching, key pressed, ask & answer, mouse x/y
9. **Operators & Variables** — math, random, comparisons, make a variable

Each module has: 3–5 illustrated concept cards + 1 quiz (5 questions) + 1 badge.

### Interactivity (no playground in v1)
- Drag-and-drop "match the block to what it does"
- Click-to-reveal block cards (front: block image, back: explanation)
- Animated example sprites (CSS/Framer Motion) showing what each motion block does
- Multiple choice with instant feedback + confetti on win
- Star rating per quiz (1–3 stars based on score)

### Design direction
Bright, friendly, chunky. Rounded corners, big buttons, playful sans-serif (Fredoka or similar), cheerful palette (sky blue, sunshine yellow, mint, coral). Sprite mascot guides the kid through lessons. Big readable text, generous spacing, animations on hover/click.

## Auth & data (Lovable Cloud)

- Enable Lovable Cloud
- Email/password auth (Google sign-in optional)
- `profiles` table: id (→ auth.users), display_name, avatar, role (kid/parent), parent_id (for kids linked to a parent)
- `user_roles` table (separate, per security best practice): app_role enum (kid, parent)
- `lesson_progress` table: user_id, lesson_id, completed, stars, completed_at
- `quiz_attempts` table: user_id, lesson_id, score, total, attempted_at
- RLS: kids see only their own rows; parents see their own + linked kids'

Parent links a child by entering the child's email (or generated pairing code) — we'll use a simple code shown on the kid's profile.

## Technical notes

- TanStack Start routes; `_authenticated` layout for `/learn`, `/quiz`, `/badges`, `/parent`
- Curriculum content lives in `src/data/curriculum.ts` (typed, easy to edit later)
- Reusable components: `LessonCard`, `BlockCard`, `QuizQuestion`, `StarRating`, `BadgeTile`, `MascotBubble`
- Framer Motion for sprite animations and quiz feedback
- Shadcn for forms, dialogs, buttons (themed to kid palette via design tokens in styles.css)

## Out of scope (later iterations)
- Robotics modules (you said add as we go)
- Block-snapping playground or embedded Scratch projects
- Admin editor (curriculum is hard-coded for now)
- Sound/voiceover narration

## Build order
1. Enable Lovable Cloud + auth + roles + tables
2. Design system + landing + login/signup
3. Curriculum data + lesson map + lesson page
4. Quiz engine + progress tracking + badges
5. Parent dashboard + child pairing
