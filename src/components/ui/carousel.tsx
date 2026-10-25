import * as React from 'react';
import { cn } from '../../lib/utils.js';

interface CarouselProps {
  children?: React.ReactNode;
  className?: string;
  autoPlayInterval?: number; // In milliseconds, default 1500ms
  autoPlay?: boolean;
  pauseOnHover?: boolean;
  showIndicators?: boolean;
  showArrows?: boolean;
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  autoPlayInterval = 1500,
  autoPlay = true,
  pauseOnHover = true,
  showIndicators = true,
  showArrows = true,
  totalSlides,
  currentSlide,
  onSlideChange
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-advance slide every autoPlayInterval ms (default 1.5 seconds)
  React.useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      onSlideChange((currentSlide + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, currentSlide, isHovered, onSlideChange, pauseOnHover, totalSlides]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSlideChange(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSlideChange((currentSlide + 1) % totalSlides);
  };

  return (
    <div
      className={cn('relative w-full overflow-hidden select-none group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Image Carousel"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full overflow-hidden">
        {children}
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            type="button"
            className="carousel-control-btn carousel-prev-btn"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            className="carousel-control-btn carousel-next-btn"
            onClick={handleNext}
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Indicators Dots with live 1.5s countdown animation */}
      {showIndicators && totalSlides > 1 && (
        <div className="carousel-indicators-bar" role="tablist">
          {Array.from({ length: totalSlides }).map((_, index) => {
            const isActive = currentSlide === index;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSlideChange(index);
                }}
                className={cn(
                  'carousel-indicator-dot',
                  isActive && 'carousel-indicator-active'
                )}
              >
                {isActive && autoPlay && !isHovered && (
                  <span
                    className="carousel-indicator-progress"
                    style={{ animationDuration: `${autoPlayInterval}ms` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Carousel;
