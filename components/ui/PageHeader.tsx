import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 pl-4 border-l-4 border-[var(--end-yellow)] relative"
    >
      {/* Decorative Top Line */}
      <div className="absolute -top-2 left-0 w-8 h-[2px] bg-[var(--end-yellow)]" />

      <h1 className="text-3xl font-bold text-[var(--end-text-main)] tracking-tight uppercase">
        {title}
      </h1>
      {description && (
        <p className="text-[var(--end-text-sub)] mt-1 text-sm tracking-wide font-mono">
          // {description}
        </p>
      )}
    </motion.div>
  );
}
