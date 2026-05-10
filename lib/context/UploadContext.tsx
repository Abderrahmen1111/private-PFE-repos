'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type UploadStatus = 'uploading' | 'processing' | 'success' | 'error' | 'cancelled';

export interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  xhr?: XMLHttpRequest;
}

interface UploadContextType {
  tasks: UploadTask[];
  startUpload: (file: File, options: { 
    preset: string; 
    cloudName: string; 
    folder?: string;
    onSuccess: (result: any) => Promise<void>;
  }) => string;
  cancelUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const tasksRef = useRef<UploadTask[]>([]);

  // Update both state and ref
  const updateTasks = useCallback((updater: (prev: UploadTask[]) => UploadTask[]) => {
    setTasks(prev => {
      const next = updater(prev);
      tasksRef.current = next;
      return next;
    });
  }, []);

  const cancelUpload = useCallback((id: string) => {
    const task = tasksRef.current.find(t => t.id === id);
    if (task?.xhr) {
      task.xhr.abort();
      updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' as const } : t));
      toast.info(`Upload annulé: ${task.fileName}`);
      
      // Remove from list after 3s
      setTimeout(() => {
        updateTasks(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
  }, [updateTasks]);

  const startUpload = useCallback((file: File, options: { 
    preset: string; 
    cloudName: string; 
    folder?: string;
    onSuccess: (result: any) => Promise<void>;
  }) => {
    const id = Math.random().toString(36).substring(7);
    const xhr = new XMLHttpRequest();
    
    const newTask: UploadTask = {
      id,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      xhr
    };

    updateTasks(prev => [newTask, ...prev]);

    const isVideo = file.type.startsWith('video/');
    const url = `https://api.cloudinary.com/v1_1/${options.cloudName}/${isVideo ? 'video' : 'image'}/upload`;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        updateTasks(prev => prev.map(t => t.id === id ? { ...t, progress: percent } : t));
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'processing' as const, progress: 100 } : t));
        
        try {
          const result = JSON.parse(xhr.responseText);
          await options.onSuccess(result);
          updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'success' as const } : t));
          toast.success(`Publication réussie: ${file.name}`);
        } catch (err) {
          console.error('Success callback failed:', err);
          updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' as const } : t));
          toast.error(`Erreur après upload: ${file.name}`);
        }
      } else {
        updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' as const } : t));
        toast.error(`Échec upload: ${file.name}`);
      }

      // Cleanup after delay
      setTimeout(() => {
        updateTasks(prev => prev.filter(t => t.id !== id));
      }, 5000);
    });

    xhr.addEventListener('error', () => {
      updateTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' as const } : t));
      toast.error(`Erreur réseau: ${file.name}`);
      setTimeout(() => updateTasks(prev => prev.filter(t => t.id !== id)), 5000);
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', options.preset);
    if (options.folder) {
        formData.append('folder', options.folder.replace(/\//g, '-'));
    }

    xhr.open('POST', url, true);
    xhr.send(formData);

    return id;
  }, [updateTasks]);

  return (
    <UploadContext.Provider value={{ tasks, startUpload, cancelUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}
