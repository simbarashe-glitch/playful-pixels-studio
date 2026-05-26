import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { lessons } from "@/data/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScratchKids — Learn Scratch Coding the Fun Way" },
      { name: "description", content: "Bright, playful lessons that teach kids Scratch coding: sprites, motion, looks, sound, events, control, sensing and more." },
      { property: "og:title", content: "ScratchKids — Learn Scratch the fun way" },
      { property: "og:description", content: "Illustrated Scratch lessons + quizzes for young coders." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="py-12 sm:py-20 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
            className="text-7xl sm:text-8xl mb-6 inline-block"
          >
            🐱
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            Code like a <span className="text-primary">superhero</span>.
            <br />
            Play, learn, <span className="text-coral">repeat!</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            ScratchKids is your fun, colorful playground for learning Scratch coding —
            with cute sprites, snappy quizzes and shiny badges to collect.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex h-14 items-center rounded-3xl bg-primary px-7 text-lg font-bold text-primary-foreground chunky-shadow hover:scale-105 transition"
            >
              Start learning 🚀
            </Link>
            <Link
              to="/login"
              className="inline-flex h-14 items-center rounded-3xl bg-card border-2 border-border px-7 text-lg font-bold hover:bg-muted"
            >
              I have an account
            </Link>
          </div>
        </section>

        {/* Feature row */}
        <section className="grid sm:grid-cols-3 gap-5 pb-12">
          {[
            { emoji: "🎨", title: "See it visually", body: "Every block is illustrated so concepts click fast." },
            { emoji: "🎯", title: "Quick quizzes", body: "Tiny quizzes test what you learned and earn you stars." },
            { emoji: "🏆", title: "Collect badges", body: "Finish a topic, win a badge for your trophy room." },
          ].map((f) => (
            <div key={f.title} className="kid-card p-6 text-center">
              <div className="text-5xl mb-3">{f.emoji}</div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        {/* Topic preview */}
        <section className="pb-20">
          <h2 className="text-3xl font-bold text-center mb-8">What you'll learn</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {lessons.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="kid-card p-4 text-center"
              >
                <div className="text-4xl">{l.emoji}</div>
                <p className="mt-2 font-bold text-sm">{l.title}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t-2 border-border py-8 text-center text-sm text-muted-foreground">
        Made with 💛 for young coders.
      </footer>
    </>
  );
}
