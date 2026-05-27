import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type BlockCard as BlockT, blockColorClass } from "@/data/curriculum";

type State = {
  x: number;
  y: number;
  rot: number;
  size: number;
  hue: number;
  ghost: number; // 0..100
  visible: boolean;
  say: string | null;
  costume: number; // index into costumes
  score: number;
};

const initial: State = {
  x: 0,
  y: 0,
  rot: 0,
  size: 100,
  hue: 0,
  ghost: 0,
  visible: true,
  say: null,
  costume: 0,
  score: 0,
};

const STAGE_W = 360;
const STAGE_H = 220;

export function SpriteStage({
  blocks,
  costumes,
}: {
  blocks: BlockT[];
  costumes: string[]; // emojis used as costumes
}) {
  const [s, setS] = useState<State>(initial);
  const [running, setRunning] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const sayTimer = useRef<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (sayTimer.current) {
      window.clearTimeout(sayTimer.current);
      sayTimer.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const reset = () => {
    clearTimers();
    setRunning(null);
    setS(initial);
  };

  const say = (text: string, secs = 2) => {
    setS((p) => ({ ...p, say: text }));
    if (sayTimer.current) window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(
      () => setS((p) => ({ ...p, say: null })),
      secs * 1000,
    );
  };

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const step = (delta: number) =>
    setS((p) => {
      const rad = ((p.rot - 90) * Math.PI) / 180;
      return {
        ...p,
        x: clamp(p.x + Math.cos(rad) * delta, -STAGE_W / 2 + 30, STAGE_W / 2 - 30),
        y: clamp(p.y + Math.sin(rad) * delta, -STAGE_H / 2 + 30, STAGE_H / 2 - 30),
      };
    });

  const run = (block: BlockT) => {
    const label = block.label.toLowerCase();

    // Motion
    if (label.startsWith("move")) return step(30);
    if (label.startsWith("turn")) return setS((p) => ({ ...p, rot: p.rot + 15 }));
    if (label.startsWith("go to")) return setS((p) => ({ ...p, x: 0, y: 0 }));
    if (label.startsWith("glide")) {
      const tx = Math.floor(Math.random() * 200 - 100);
      const ty = Math.floor(Math.random() * 120 - 60);
      return setS((p) => ({ ...p, x: tx, y: ty }));
    }
    if (label.includes("on edge")) {
      return setS((p) => ({ ...p, rot: p.rot + 180 }));
    }

    // Looks
    if (label.startsWith("say")) return say("Hello! 👋");
    if (label.startsWith("set size")) {
      return setS((p) => ({ ...p, size: p.size === 100 ? 160 : p.size === 160 ? 60 : 100 }));
    }
    if (label.includes("color effect")) {
      return setS((p) => ({ ...p, hue: (p.hue + 60) % 360 }));
    }
    if (label.startsWith("hide")) {
      return setS((p) => ({ ...p, visible: !p.visible }));
    }
    if (label.startsWith("switch costume") || label.startsWith("next costume")) {
      return setS((p) => ({ ...p, costume: (p.costume + 1) % Math.max(1, costumes.length) }));
    }

    // Sound (visual proxy)
    if (label.includes("sound") || label.startsWith("play sound") || label.startsWith("start sound")) {
      say("🎵 Meow!", 1.2);
      try {
        const u = new SpeechSynthesisUtterance("meow");
        u.rate = 1.4;
        u.pitch = 1.6;
        window.speechSynthesis?.speak(u);
      } catch {}
      return;
    }
    if (label.includes("volume")) return say("🔊 volume!", 1);

    // Events
    if (label.includes("flag")) {
      reset();
      let i = 0;
      const tick = () => {
        if (i++ >= 6) return;
        step(20);
        setS((p) => ({ ...p, rot: p.rot + 20 }));
        timers.current.push(window.setTimeout(tick, 220));
      };
      tick();
      return;
    }
    if (label.includes("key pressed")) return say("Press SPACE! ⌨️", 1.5);
    if (label.includes("sprite clicked")) return say("Click me! 👆", 1.5);
    if (label.startsWith("broadcast")) {
      setS((p) => ({ ...p, hue: (p.hue + 120) % 360 }));
      return say("📢 message sent!", 1.2);
    }

    // Control
    if (label.startsWith("wait")) return say("⏱️ waiting…", 1);
    if (label.startsWith("repeat")) {
      let i = 0;
      const tick = () => {
        if (i++ >= 10) return;
        step(15);
        setS((p) => ({ ...p, rot: p.rot + 36 }));
        timers.current.push(window.setTimeout(tick, 120));
      };
      tick();
      return;
    }
    if (label.startsWith("forever")) {
      if (running === "forever") {
        clearTimers();
        setRunning(null);
        return;
      }
      setRunning("forever");
      const tick = () => {
        step(10);
        setS((p) => ({ ...p, rot: p.rot + 8 }));
        timers.current.push(window.setTimeout(tick, 100));
      };
      tick();
      return;
    }
    if (label.startsWith("if")) {
      // bounce-style demo
      step(60);
      setS((p) => ({ ...p, rot: p.rot + 180 }));
      return say("if … then bounce!", 1.5);
    }

    // Sensing
    if (label.startsWith("touching")) return say("Am I touching? 🤔", 1.2);
    if (label.startsWith("key ") && label.includes("pressed?")) return say("Key held? ⌨️", 1.2);
    if (label.startsWith("ask")) {
      const answer = window.prompt("What's your name?") ?? "friend";
      return say(`Hi ${answer}! 👋`, 2.5);
    }
    if (label.startsWith("mouse")) return say("Following mouse 🖱️", 1.2);

    // Operators
    if (label.includes("+")) {
      const r = Math.floor(Math.random() * 9) + 2;
      return say(`2 + ${r} = ${r + 2}`, 1.6);
    }
    if (label.startsWith("pick random")) {
      const r = Math.floor(Math.random() * 10) + 1;
      return say(`🎲 ${r}`, 1.6);
    }
    if (label.includes(">")) {
      return say("5 > 3 ✅", 1.5);
    }

    // Variables
    if (label.startsWith("set ") && label.includes("0")) {
      return setS((p) => ({ ...p, score: 0 }));
    }
    if (label.startsWith("change ")) {
      return setS((p) => ({ ...p, score: p.score + 1 }));
    }

    // Fallback
    say("✨", 1);
  };

  const costume = costumes[s.costume % Math.max(1, costumes.length)] ?? "🐱";

  return (
    <div className="kid-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">🎮 Try it live!</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded-lg bg-sunshine font-bold">score: {s.score}</span>
          <button
            onClick={reset}
            className="px-3 py-1 rounded-lg bg-muted font-bold hover:bg-muted/70"
          >
            ↺ reset
          </button>
        </div>
      </div>

      <div
        className="relative mx-auto rounded-2xl bg-white border-2 border-border overflow-hidden"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        {/* grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <AnimatePresence>
          {s.visible && (
            <motion.div
              key="sprite"
              animate={{
                x: s.x,
                y: -s.y,
                rotate: s.rot,
                scale: s.size / 100,
                opacity: 1 - s.ghost / 100,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl select-none"
              style={{ filter: `hue-rotate(${s.hue}deg)` }}
            >
              {costume}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {s.say && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-3 -translate-x-1/2 bg-white border-2 border-border rounded-2xl px-3 py-1 text-sm font-bold shadow-md"
            >
              {s.say}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        Click any block below to run it on the sprite ⬇️
      </p>

      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {blocks.map((b, i) => (
          <button
            key={i}
            onClick={() => run(b)}
            className={`font-bold rounded-xl px-3 py-2 text-sm shadow-md hover:-translate-y-0.5 active:translate-y-0 transition ${blockColorClass[b.color]}`}
            title={b.description}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
