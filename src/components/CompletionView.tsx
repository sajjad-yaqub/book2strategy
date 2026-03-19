import { motion } from 'framer-motion';
import type { StrategyCard } from '@/types/strategy';
import { Trophy, Archive, RotateCcw, BookmarkPlus } from 'lucide-react';

interface CompletionViewProps {
  savedCards: StrategyCard[];
  archivedCards: StrategyCard[];
  onReset: () => void;
}

export function CompletionView({ savedCards, archivedCards, onReset }: CompletionViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Strategy Review Complete</h2>
        <p className="text-muted-foreground">
          Your high-leverage insights are ready for execution.
        </p>
      </div>

      <div className="flex justify-center gap-8 mb-8">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
          <BookmarkPlus className="w-5 h-5 text-primary" />
          <span className="text-2xl font-bold text-foreground">{savedCards.length}</span>
          <span className="text-sm text-muted-foreground">Saved</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border/50">
          <Archive className="w-5 h-5 text-muted-foreground" />
          <span className="text-2xl font-bold text-foreground">{archivedCards.length}</span>
          <span className="text-sm text-muted-foreground">Archived</span>
        </div>
      </div>

      {savedCards.length > 0 && (
        <div className="mb-8 text-left">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Strategy Stack</h3>
          <div className="space-y-3">
            {savedCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-4"
              >
                <h4 className="font-semibold text-foreground text-sm mb-1">{card.headline}</h4>
                <p className="text-xs text-primary">{card.pl_impact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border/50 text-foreground hover:bg-secondary/80 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Analyze Another Book
      </button>
    </motion.div>
  );
}
