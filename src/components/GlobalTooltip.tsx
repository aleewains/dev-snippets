import React, { useState, useEffect } from 'react';

interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  arrowPercent: number;
  position: 'top' | 'bottom';
}

export const GlobalTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    arrowPercent: 50,
    position: 'top',
  });

  useEffect(() => {
    let timeoutId: number | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip]') as HTMLElement | null;
      if (!target) return;

      const text = target.getAttribute('data-tooltip');
      if (!text || text.trim() === '') {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }

      const rect = target.getBoundingClientRect();
      const preferredPos = target.getAttribute('data-tooltip-pos') as 'top' | 'bottom' | null;

      // Determine whether to show above or below
      let position: 'top' | 'bottom' = 'top';
      if (preferredPos === 'bottom') {
        position = rect.bottom > window.innerHeight - 50 && rect.top > 50 ? 'top' : 'bottom';
      } else if (preferredPos === 'top') {
        position = rect.top < 45 ? 'bottom' : 'top';
      } else {
        // Auto default: if not enough space on top, show bottom
        position = rect.top < 45 ? 'bottom' : 'top';
      }

      const targetCenterX = rect.left + rect.width / 2;
      const y = position === 'top' ? rect.top - 8 : rect.bottom + 8;

      // Estimate tooltip width based on text length to prevent clipping off the right or left edge
      const estimatedWidth = Math.min(360, Math.max(70, text.length * 7.2 + 24));
      const halfW = estimatedWidth / 2;

      // Clamp tooltip center X so it never clips past window borders (min 16px from edges)
      const clampedX = Math.max(halfW + 16, Math.min(window.innerWidth - halfW - 16, targetCenterX));

      // Calculate arrow offset relative to the tooltip bubble
      const arrowPixelFromLeft = targetCenterX - (clampedX - halfW);
      const clampedArrowPixel = Math.max(12, Math.min(estimatedWidth - 12, arrowPixelFromLeft));
      const arrowPercent = Math.max(8, Math.min(92, (clampedArrowPixel / estimatedWidth) * 100));

      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setTooltip({
          visible: true,
          text,
          x: clampedX,
          y,
          arrowPercent,
          position,
        });
      }, 40);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-tooltip]');
      const related = (e.relatedTarget as HTMLElement)?.closest('[data-tooltip]');
      if (target && target !== related) {
        if (timeoutId) window.clearTimeout(timeoutId);
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    const handleDismiss = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    window.addEventListener('scroll', handleDismiss, true);
    document.addEventListener('click', handleDismiss, true);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      window.removeEventListener('scroll', handleDismiss, true);
      document.removeEventListener('click', handleDismiss, true);
    };
  }, []);

  if (!tooltip.visible || !tooltip.text) return null;

  return (
    <div
      className={`portal-tooltip portal-tooltip-${tooltip.position}`}
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }}
      role="tooltip"
    >
      <div
        className="portal-tooltip-arrow"
        style={{ left: `${tooltip.arrowPercent}%` }}
      />
      <span className="portal-tooltip-content">{tooltip.text}</span>
    </div>
  );
};
