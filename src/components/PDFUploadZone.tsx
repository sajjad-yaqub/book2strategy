import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles } from 'lucide-react';

interface PDFUploadZoneProps {
  onUpload: (file: File) => void;
}

export function PDFUploadZone({ onUpload }: PDFUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') onUpload(file);
  }, [onUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            SNEPOA Extraction Engine
          </span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Book → Strategy Cards
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Upload any business book PDF. Get swipeable, actionable strategy cards powered by behavioral psychology.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`upload-zone cursor-pointer p-12 flex flex-col items-center gap-4 ${isDragging ? 'upload-zone-active' : ''}`}
      >
        <motion.div
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center"
        >
          {isDragging ? (
            <FileText className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </motion.div>
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">
            {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to browse'}
          </p>
          <p className="text-sm text-muted-foreground">
            Business books, strategy docs, research papers
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
