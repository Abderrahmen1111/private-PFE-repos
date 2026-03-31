'use client';

import type {
  ComponentProps,
  HTMLAttributes,
  VideoHTMLAttributes,
} from 'react';
import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Play } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Container ────────────────────────────────────────────────────────────────

export type StoriesProps = ComponentProps<typeof Carousel>;

export const Stories = ({ className, opts, ...props }: StoriesProps) => (
  <Carousel
    className={cn('w-full', className)}
    opts={{
      align: 'start',
      loop: false,
      dragFree: true,
      ...opts,
    }}
    {...props}
  />
);

// ─── Scrollable row ───────────────────────────────────────────────────────────

export type StoriesContentProps = ComponentProps<typeof CarouselContent>;

export const StoriesContent = ({
  className,
  ...props
}: StoriesContentProps) => (
  <CarouselContent className={cn('-ml-0 gap-0', className)} {...props} />
);

// ─── Individual card slot ─────────────────────────────────────────────────────

export type StoryProps = HTMLAttributes<HTMLDivElement> & {
  /** show a red "new" dot on the thumbnail corner */
  isNew?: boolean;
};

export const Story = ({ className, isNew, children, ...props }: StoryProps) => (
  <CarouselItem className={cn('basis-auto pl-3 first:pl-0', className)}>
    <div
      className={cn(
        'group relative flex flex-col gap-2 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}

      {/* Red "new/unwatched" dot */}
      {isNew && (
        <span className="absolute top-2 right-2 z-30 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-black/40" />
      )}

      {/* Play button overlay — appears on hover, positioned over thumbnail only */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-20 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'bottom-[72px]',
        )}
      >
        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-xl">
          <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
        </div>
      </div>
    </div>
  </CarouselItem>
);

// ─── Thumbnail wrapper (9:16) ─────────────────────────────────────────────────

export type StoryThumbnailProps = HTMLAttributes<HTMLDivElement>;

export const StoryThumbnail = ({ className, ...props }: StoryThumbnailProps) => (
  <div
    className={cn(
      'relative w-full overflow-hidden rounded-xl bg-muted aspect-[9/16]',
      'transition-transform duration-200 group-hover:scale-[1.02] group-hover:shadow-xl',
      className
    )}
    {...props}
  />
);

// ─── Image inside thumbnail ───────────────────────────────────────────────────

export type StoryImageProps = ComponentProps<'img'> & { alt: string };

export const StoryImage = ({ className, alt, ...props }: StoryImageProps) => (
  <img
    alt={alt}
    className={cn(
      'absolute inset-0 h-full w-full object-cover',
      'transition-opacity duration-200 group-hover:opacity-90',
      className
    )}
    {...props}
  />
);

// ─── Video inside thumbnail ───────────────────────────────────────────────────

export type StoryVideoProps = VideoHTMLAttributes<HTMLVideoElement>;

const tRegex = /t=(\d+(?:\.\d+)?)/;

export const StoryVideo = ({ className, ...props }: StoryVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const initialTimeRef = useRef<number>(0);

  useEffect(() => {
    const src = (props.src ?? '') as string;
    let initialTime = 0;
    if (typeof src === 'string') {
      const hashIndex = src.indexOf('#');
      if (hashIndex !== -1) {
        const hash = src.slice(hashIndex + 1);
        const tMatch = hash.match(tRegex);
        if (tMatch) initialTime = Number.parseFloat(tMatch[1]);
      }
    }
    initialTimeRef.current = initialTime;
  }, [props.src]);

  const handleMouseOver = () => { videoRef.current?.play(); };
  const handleMouseOut = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = initialTimeRef.current;
    }
  };

  return (
    <video
      className={cn(
        'absolute inset-0 size-full object-cover',
        'transition-opacity duration-200 group-hover:opacity-90',
        className
      )}
      loop muted preload="metadata"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onFocus={handleMouseOver}
      onBlur={handleMouseOut}
      ref={videoRef}
      tabIndex={0}
      {...props}
    />
  );
};


// ─── Duration label (bottom-right) ───────────────────────────────────────────

export type StoryDurationProps = HTMLAttributes<HTMLSpanElement>;

export const StoryDuration = ({ className, children, ...props }: StoryDurationProps) => (
  <span
    className={cn(
      'absolute bottom-2 right-2 z-20',
      'px-1 py-0.5 rounded text-[10px] font-bold text-white bg-black/70',
      className
    )}
    {...props}
  >
    {children}
  </span>
);

// ─── Gradient overlay ─────────────────────────────────────────────────────────

export type StoryOverlayProps = HTMLAttributes<HTMLDivElement> & {
  side?: 'top' | 'bottom';
};

export const StoryOverlay = ({ className, side = 'bottom', ...props }: StoryOverlayProps) => {
  const positionClasses =
    side === 'top' ? 'top-0 bg-gradient-to-b' : 'bottom-0 bg-gradient-to-t';
  return (
    <div
      className={cn(
        'absolute inset-x-0 h-16 from-black/50 to-transparent pointer-events-none',
        positionClasses,
        className
      )}
      {...props}
    />
  );
};

// ─── Info row below thumbnail ─────────────────────────────────────────────────

export type StoryInfoProps = HTMLAttributes<HTMLDivElement>;

export const StoryInfo = ({ className, ...props }: StoryInfoProps) => (
  <div className={cn('flex items-start gap-2 px-0.5', className)} {...props} />
);

// ─── Channel avatar ───────────────────────────────────────────────────────────

export type StoryAvatarProps = ComponentProps<typeof Avatar> & {
  src?: string;
  name?: string;
  fallback?: string;
};

export const StoryAvatar = ({ src, fallback, name, className, ...props }: StoryAvatarProps) => (
  <Avatar className={cn('size-7 shrink-0 mt-0.5 border border-border', className)} {...props}>
    {src && <AvatarImage alt={name} src={src} />}
    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
      {fallback || name?.charAt(0)?.toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

// ─── Meta text column (title + views) ────────────────────────────────────────

export type StoryMetaProps = HTMLAttributes<HTMLDivElement>;

export const StoryMeta = ({ className, ...props }: StoryMetaProps) => (
  <div className={cn('flex flex-col min-w-0', className)} {...props} />
);

export type StoryTitleProps = HTMLAttributes<HTMLParagraphElement>;

export const StoryTitle = ({ className, ...props }: StoryTitleProps) => (
  <p
    className={cn(
      'text-[13px] font-semibold leading-snug line-clamp-2 text-foreground',
      className
    )}
    {...props}
  />
);

export type StoryViewsProps = HTMLAttributes<HTMLSpanElement>;

export const StoryViews = ({ className, ...props }: StoryViewsProps) => (
  <span className={cn('text-[11px] text-muted-foreground mt-0.5', className)} {...props} />
);

// ─── Legacy compat exports ────────────────────────────────────────────────────

export type StoryAuthorProps = HTMLAttributes<HTMLDivElement>;
export const StoryAuthor = ({ className, children, ...props }: StoryAuthorProps) => (
  <div className={cn('absolute right-0 bottom-0 left-0 z-10 p-3 text-white', className)} {...props}>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

export type StoryAuthorImageProps = ComponentProps<typeof Avatar> & {
  src?: string; name?: string; fallback?: string;
};
export const StoryAuthorImage = ({ src, fallback, name, className, ...props }: StoryAuthorImageProps) => (
  <Avatar className={cn('size-6 border border-white/20', className)} {...props}>
    {src && <AvatarImage alt={name} src={src} />}
    <AvatarFallback className="bg-white/10 text-white text-xs">
      {fallback || name?.charAt(0)?.toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

export type StoryAuthorNameProps = HTMLAttributes<HTMLSpanElement>;
export const StoryAuthorName = ({ className, ...props }: StoryAuthorNameProps) => (
  <span className={cn('truncate font-medium text-sm', className)} {...props} />
);

// ─── Composite Carousel (High level API) ──────────────────────────────────────

export interface StoriesCarouselProps {
  stories: {
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    author: {
      name: string;
      avatar?: string;
    };
    caption?: string;
  }[];
}

export function StoriesCarousel({ stories }: StoriesCarouselProps) {
  return (
    <Stories>
      <StoriesContent>
        {stories.map((story) => (
          <Story key={story.id}>
            <StoryThumbnail>
              {story.media_type === 'video' ? (
                <StoryVideo src={story.media_url} />
              ) : (
                <StoryImage src={story.media_url} alt={story.author.name} />
              )}
              
              <StoryOverlay side="bottom" />
              
              <StoryAuthor>
                <StoryAuthorImage 
                  src={story.author.avatar} 
                  name={story.author.name} 
                />
                <StoryAuthorName>{story.author.name}</StoryAuthorName>
              </StoryAuthor>
            </StoryThumbnail>

            {story.caption && (
              <StoryInfo className="mt-2">
                <StoryMeta>
                  <StoryTitle>{story.caption}</StoryTitle>
                </StoryMeta>
              </StoryInfo>
            )}
          </Story>
        ))}
      </StoriesContent>
    </Stories>
  );
}