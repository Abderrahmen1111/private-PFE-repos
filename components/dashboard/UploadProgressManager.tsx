'use client';

import React from 'react';
import { useUpload, UploadTask } from '@/lib/context/UploadContext';
import { X, Loader2, CheckCircle2, AlertCircle, Film, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function UploadProgressManager() {
  const { tasks, cancelUpload } = useUpload();

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 space-y-3 pointer-events-none">
      {tasks.map((task) => (
        <UploadCard key={task.id} task={task} onCancel={() => cancelUpload(task.id)} />
      ))}
    </div>
  );
}

function UploadCard({ task, onCancel }: { task: UploadTask; onCancel: () => void }) {
  const isError = task.status === 'error';
  const isSuccess = task.status === 'success';
  const isCancelled = task.status === 'cancelled';
  const isProcessing = task.status === 'processing';

  return (
    <div className={cn(
      "pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl transition-all duration-500 transform translate-y-0",
      isCancelled && "opacity-0 scale-95 translate-y-4 pointer-events-none"
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-xl bg-white/5 border border-white/10",
          isSuccess && "bg-emerald-500/10 border-emerald-500/20",
          isError && "bg-rose-500/10 border-rose-500/20"
        )}>
          {task.fileName.match(/\.(mp4|mov|webm)$/i) ? (
            <Film className={cn("w-4 h-4", isSuccess ? "text-emerald-400" : "text-slate-400")} />
          ) : (
            <ImageIcon className={cn("w-4 h-4", isSuccess ? "text-emerald-400" : "text-slate-400")} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate pr-6">{task.fileName}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            {task.status === 'uploading' && `Envoi... ${task.progress}%`}
            {task.status === 'processing' && 'Finalisation...'}
            {task.status === 'success' && 'Terminé !'}
            {task.status === 'error' && 'Échec'}
            {task.status === 'cancelled' && 'Annulé'}
          </p>
        </div>

        {task.status === 'uploading' && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white absolute top-4 right-4"
            onClick={onCancel}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute top-0 left-0 h-full transition-all duration-300 rounded-full",
              task.status === 'uploading' && "bg-blue-500",
              task.status === 'processing' && "bg-violet-500 animate-pulse",
              task.status === 'success' && "bg-emerald-500",
              task.status === 'error' && "bg-rose-500"
            )}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-bold animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Traitement par Cloudinary...</span>
          </div>
        )}
      </div>
    </div>
  );
}
