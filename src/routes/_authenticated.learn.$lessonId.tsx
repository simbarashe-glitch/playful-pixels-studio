import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { MascotBubble } from "@/components/MascotBubble";
import { BlockCard } from "@/components/BlockCard";
import { getLesson, lessonAccentClass, lessons } from "@/data/curriculum";

export const Route = createFileRoute("/_authenticated/learn/$lessonId")({
  head: ({ params }) => {
    const l = getLesson(params.lessonId);
    return { meta: [{ title: l ? `${l.title} — ScratchKids` : "Lesson — ScratchKids" }] };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <>
      <TopBar />
      <main className="mx-auto max-w-2xl p-10 text-center">
        <div className="text-6xl">🤷</div>
        <h1 className="text-3xl font-bold mt-3">Lesson not found</h1>
        <Link to="/learn" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold chunky-shadow">
          Back to lessons
        </Link>
      </main>
    </>
  ),
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) throw notFound();

  const next = lessons.find((l) => l.order === lesson.order + 1);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/learn" className="text-sm font-bold text-muted-foreground hover:text-foreground">
          ← All lessons
        </Link>

        <header className="mt-4 kid-card p-8 text-center">
          <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${lessonAccentClass[lesson.color]}`}>
            Lesson {lesson.order}
          </div>
          <div className="text-7xl mt-3">{lesson.emoji}</div>
          <h1 className="text-4xl font-extrabold mt-2">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{lesson.tagline}</p>
        </header>

        <section className="mt-8 space-y-5">
          {lesson.concepts.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <MascotBubble emoji={c.emoji} tone={i % 4 === 0 ? "primary" : i % 4 === 1 ? "mint" : i % 4 === 2 ? "sunshine" : "coral"}>
                <span className="block font-bold text-lg mb-1">{c.title}</span>
                <span className="font-normal">{c.body}</span>
              </MascotBubble>
            </motion.div>
          ))}
        </section>

        {lesson.blocks && lesson.blocks.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">🧩 Blocks you'll meet</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {lesson.blocks.map((b, i) => (
                <BlockCard key={i} block={b} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 kid-card p-6 text-center bg-sunshine/30">
          <div className="text-4xl">💡</div>
          <h3 className="text-xl font-bold mt-2">Try it in Scratch!</h3>
          <p className="text-sm mt-1 text-muted-foreground">
            Open Scratch and play with what you just learned. When you're ready, take the quiz!
          </p>
          <Link
            to="/quiz/$lessonId"
            params={{ lessonId: lesson.id }}
            className="inline-flex mt-5 h-12 items-center rounded-2xl bg-primary px-6 font-bold text-primary-foreground chunky-shadow hover:scale-105 transition"
          >
            Take the quiz →
          </Link>
        </section>

        {next && (
          <div className="mt-8 text-center">
            <Link
              to="/learn/$lessonId"
              params={{ lessonId: next.id }}
              className="text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              Next lesson: {next.emoji} {next.title} →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
