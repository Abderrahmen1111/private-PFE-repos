'use client';

export function ReviewSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
      </div>

      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>

      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="w-24 h-7 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
}

export function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <ReviewSkeleton key={i} />
      ))}
    </div>
  );
}
