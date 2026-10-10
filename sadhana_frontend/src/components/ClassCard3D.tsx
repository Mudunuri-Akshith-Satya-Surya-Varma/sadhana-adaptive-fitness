import React, { useState } from 'react';

interface ClassCard3DProps {
  classSlug: string;
  classNameTitle?: string;
  className?: string;
  compact?: boolean;
  showHint?: boolean;
  allowDesignedToggle?: boolean;
  onFlip?: (flipped: boolean) => void;
}

export const ClassCard3D: React.FC<ClassCard3DProps> = ({
  classSlug,
  classNameTitle,
  className = '',
  compact = false,
  showHint = true,
  allowDesignedToggle = true,
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'tarot' | 'designed'>('tarot');

  // Normalize slug
  const normalizedSlug = (classSlug || 'dhruva').toLowerCase().trim();
  const validSlugs = ['sthira', 'vistara', 'yodha', 'dhruva', 'samanvaya'];
  const safeSlug = validSlugs.includes(normalizedSlug) ? normalizedSlug : 'dhruva';

  const title = classNameTitle || safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1);

  const handleToggleFlip = () => {
    const next = !isFlipped;
    setIsFlipped(next);
    if (onFlip) onFlip(next);
  };

  return (
    <div className={`class-card-3d-wrapper relative flex flex-col items-center ${className}`}>
      {viewMode === 'tarot' ? (
        <article
          className={`class-card visual-class ${safeSlug} ${isFlipped ? 'is-flipped' : ''}`}
          style={{
            width: compact ? '130px' : '170px',
            height: compact ? '220px' : '285px',
            margin: 0,
          }}
          aria-label={`${title} class card`}
        >
          <button
            className="class-flip-target"
            type="button"
            aria-pressed={isFlipped}
            aria-label={`Show ${title} class details`}
            onClick={handleToggleFlip}
            style={{ width: '100%', height: '100%' }}
          >
            <span className="flip-inner">
              <span className="flip-face flip-front">
                <img
                  src={`/assets/card_${safeSlug}_front.jpg`}
                  alt={`${title} class front artwork`}
                  draggable="false"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </span>
              <span className="flip-face flip-back">
                <img
                  src={`/assets/card_${safeSlug}_back.jpg`}
                  alt={`${title} class explanation and training focus`}
                  draggable="false"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </span>
            </span>
          </button>
        </article>
      ) : (
        <button
          type="button"
          className="designed-class-card"
          onClick={() => {
            const el = document.getElementById('classExplanation');
            if (el) {
              el.classList.add('class-reason-highlight');
              setTimeout(() => el.classList.remove('class-reason-highlight'), 1200);
            }
          }}
          style={{
            width: compact ? '130px' : '170px',
            margin: 0,
          }}
          aria-label={`Designed ${title} class card`}
        >
          <img
            src={`/assets/class_${safeSlug}_designed.jpg`}
            alt={`Designed ${title} class card`}
            style={{
              width: '100%',
              height: compact ? '220px' : '285px',
              objectFit: 'contain',
              background: '#f8f4e8',
              borderRadius: '8px',
              border: '2px solid #31536a',
              boxShadow: '0 4px 0 #182f40',
            }}
          />
        </button>
      )}

      {/* Control bar */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
        {showHint && viewMode === 'tarot' && (
          <button
            type="button"
            onClick={handleToggleFlip}
            className="text-[10px] font-bold text-[#b47c38] hover:text-[#573317] flex items-center gap-1 cursor-pointer transition select-none tracking-wide bg-[#fff0cf] px-2 py-0.5 rounded border border-[#b88b4a] shadow-xs"
            title="Click to flip front / back"
          >
            <span>↻</span> {isFlipped ? 'Artwork' : 'Details'}
          </button>
        )}

        {allowDesignedToggle && (
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'tarot' ? 'designed' : 'tarot')}
            className="text-[10px] font-bold text-[#573317] hover:text-[#8b2e1e] flex items-center gap-1 cursor-pointer transition select-none tracking-wide bg-[#fbe7bc] px-2 py-0.5 rounded border border-[#a8793d] shadow-xs"
            title="Switch between Tarot and Designed Card view"
          >
            <span>{viewMode === 'tarot' ? '📜 Designed' : '🃏 Tarot'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassCard3D;
