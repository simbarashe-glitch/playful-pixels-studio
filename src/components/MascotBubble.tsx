import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MascotBubble({
  children,
  emoji = "🐱",
  tone = "primary",
}: {
  children: React.ReactNode;
  emoji?: string;
  tone?: "primary" | "mint" | "sunshine" | "coral";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl select-none"
      >
        {emoji}
      </motion.div>
      <div
        className={cn(
          "relative kid-card px-5 py-3 text-base sm:text-lg font-semibold max-w-prose",
          tone === "primary" && "bg-card",
          tone === "mint" && "bg-mint/30",
          tone === "sunshine" && "bg-sunshine/30",
          tone === "coral" && "bg-coral/20",
        )}
      >
        <span className="absolute -left-2 top-5 w-4 h-4 bg-inherit border-l-2 border-b-2 border-border rotate-45" />
        {children}
      </div>
    </motion.div>
  );
}
