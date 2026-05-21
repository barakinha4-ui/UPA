'use client';

import { UapDocument } from '@/types/database';
import DocumentCard from './DocumentCard';
import { motion, Variants } from 'framer-motion';

interface DocumentGridProps {
  docs: UapDocument[];
  locale: 'pt' | 'en';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

export default function DocumentGrid({ docs, locale }: DocumentGridProps) {
  if (docs.length === 0) {
    return (
      <div className="w-full text-center py-24 border border-[#c8a96e]/10 rounded bg-[#0a0a0f] text-[#e8e8e0]/40 font-mono text-sm tracking-widest uppercase">
        No records matching search criteria found.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      {docs.map((doc) => (
        <motion.div key={doc.id} variants={itemVariants}>
          <DocumentCard doc={doc} locale={locale} />
        </motion.div>
      ))}
    </motion.div>
  );
}
