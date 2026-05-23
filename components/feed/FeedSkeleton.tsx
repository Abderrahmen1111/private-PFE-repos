export function FeedSkeleton({ count = 6 }: { count?: number }) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  
  function SkeletonCard() {
    return (
      <div className="
        overflow-hidden rounded-2xl border border-gray-100
        bg-white shadow-sm
      ">
        {/* Image placeholder */}
        <div className="
          relative h-44 w-full
          animate-pulse bg-gradient-to-br
          from-gray-200 via-gray-100 to-gray-200
          bg-[length:200%_100%]
        ">
          {/* Badge placeholder top-left */}
          <div className="
            absolute left-2 top-2
            h-5 w-14 animate-pulse
            rounded-full bg-gray-300
          " />
          {/* Duration badge top-right */}
          <div className="
            absolute right-2 top-2
            h-5 w-10 animate-pulse
            rounded-full bg-gray-300
          " />
          {/* Heart icon bottom-right */}
          <div className="
            absolute bottom-2 right-2
            h-7 w-7 animate-pulse
            rounded-full bg-gray-300
          " />
        </div>
  
        {/* Content placeholder */}
        <div className="space-y-2 p-3">
          {/* Title */}
          <div className="
            h-4 w-3/4 animate-pulse
            rounded-md bg-gray-200
          " />
          {/* Subtitle */}
          <div className="
            h-3 w-1/2 animate-pulse
            rounded-md bg-gray-100
          " />
  
          {/* Price + Rating row */}
          <div className="flex items-center justify-between pt-1">
            <div className="
              h-4 w-16 animate-pulse
              rounded-md bg-gray-200
            " />
            <div className="
              h-3 w-12 animate-pulse
              rounded-md bg-gray-100
            " />
          </div>
        </div>
      </div>
    )
  }