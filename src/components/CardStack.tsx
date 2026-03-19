import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import type { StrategyCard as StrategyCardType } from '@/types/strategy';
import { StrategyCardFace } from './StrategyCardFace';
import { Archive, BookmarkPlus, ArrowLeft, ArrowRight } from 'lucide-react';

interface CardStackProps {
  cards: StrategyCardType[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
  totalCards: number;
}

export function CardStack({ cards, currentIndex, onSwipe, totalCards }: CardStackProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const archiveOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const saveOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitDirection('right');
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      setExitDirection('left');
      onSwipe('left');
    }
  }, [onSwipe]);

  const handleButtonSwipe = useCallback((dir: 'left' | 'right') => {
    setExitDirection(dir);
    onSwipe(dir);
  }, [onSwipe]);

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-mono">{currentIndex + 1}</span>
        <div className="w-32 h-1 rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <span className="font-mono">{totalCards}</span>
      </div>

      {/* Swipe indicators */}
      <div className="relative w-full" style={{ minHeight: 520 }}>
        <motion.div
          style={{ opacity: archiveOpacity }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/20 border border-destructive/30"
        >
          <Archive className="w-4 h-4 text-destructive" />
          <span className="text-xs font-medium text-destructive">Archive</span>
        </motion.div>
        <motion.div
          style={{ opacity: saveOpacity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 border border-primary/30"
        >
          <BookmarkPlus className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Save</span>
        </motion.div>

        {/* Card stack */}
        <div className="relative h-full flex items-start justify-center">
          {/* Background card */}
          {nextCard && (
            <div className="absolute top-2 w-full max-w-xl opacity-40 scale-[0.97] pointer-events-none">
              <StrategyCardFace card={nextCard} />
            </div>
          )}

          {/* Active card */}
          <AnimatePresence mode="popLayout">
            {currentCard && (
              <motion.div
                key={currentCard.id}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{
                  x: exitDirection === 'left' ? -400 : 400,
                  opacity: 0,
                  rotate: exitDirection === 'left' ? -20 : 20,
                  transition: { duration: 0.3 },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-xl cursor-grab active:cursor-grabbing relative z-20"
              >
                <StrategyCardFace card={currentCard} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => handleButtonSwipe('left')}
          className="w-14 h-14 rounded-full bg-secondary/80 border border-border/50 flex items-center justify-center transition-all hover:bg-destructive/20 hover:border-destructive/40 group"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
        <div className="text-xs text-muted-foreground text-center">
          <p>← Archive</p>
          <p className="mt-0.5">Save →</p>
        </div>
        <button
          onClick={() => handleButtonSwipe('right')}
          className="w-14 h-14 rounded-full bg-secondary/80 border border-border/50 flex items-center justify-center transition-all hover:bg-primary/20 hover:border-primary/40 group"
        >
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
}
