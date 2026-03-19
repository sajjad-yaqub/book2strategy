import { AnimatePresence } from 'framer-motion';
import { useStrategyEngine } from '@/hooks/useStrategyEngine';
import { PDFUploadZone } from '@/components/PDFUploadZone';
import { AnalyzingAnimation } from '@/components/AnalyzingAnimation';
import { CardStack } from '@/components/CardStack';
import { CompletionView } from '@/components/CompletionView';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const engine = useStrategyEngine();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground tracking-tight">SNEPOA Engine</span>
        </div>
        <div className="flex items-center gap-4">
          {engine.phase === 'swiping' && (
            <span className="text-xs text-muted-foreground font-mono">
              {engine.remainingCards} cards remaining
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {engine.phase === 'upload' && (
            <PDFUploadZone key="upload" onUpload={engine.processUpload} />
          )}
          {engine.phase === 'analyzing' && (
            <AnalyzingAnimation key="analyzing" />
          )}
          {engine.phase === 'swiping' && (
            <CardStack
              key="swiping"
              cards={engine.cards}
              currentIndex={engine.currentIndex}
              onSwipe={engine.swipeCard}
              totalCards={engine.totalCards}
            />
          )}
          {engine.phase === 'complete' && (
            <CompletionView
              key="complete"
              savedCards={engine.savedCards}
              archivedCards={engine.archivedCards}
              onReset={engine.reset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
