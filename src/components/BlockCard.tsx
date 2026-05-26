import { motion } from "framer-motion";
import { type BlockCard as BlockCardT, blockColorClass } from "@/data/curriculum";

export function BlockCard({ block }: { block: BlockCardT }) {
  return (
    <motion.div
      whileHover={{ y: -3, rotate: -1 }}
      whileTap={{ scale: 0.97 }}
      className="kid-card p-4 cursor-pointer"
    >
      <div
        className={`inline-flex items-center font-bold rounded-xl px-3 py-2 text-sm shadow-md ${blockColorClass[block.color]}`}
      >
        {block.label}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{block.description}</p>
    </motion.div>
  );
}
