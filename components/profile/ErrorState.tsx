'use client';

import { MessageSquare, AlertCircle, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white border border-red-100 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">Something went wrong</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
