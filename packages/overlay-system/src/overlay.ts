export interface RuleEvaluation {
  ruleId: string;
  success: boolean;
  message: string;
  anchor?: string;
  hint?: string;
}

const INJECTED_CSS = `
/* Learning Engine Overlay Styles - Premium Glassmorphic Layout */

.learning-anchor-wrapper {
  position: relative !important;
}

.learning-pulse-dot {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 99999;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 2px solid #ffd85c;
}

.learning-pulse-dot:hover {
  transform: scale(1.3);
}

.learning-pulse-dot.error {
  background-color: #ef4444;
  animation: learning-pulse-red 2s infinite;
}

.learning-pulse-dot.success {
  background-color: #22c55e;
  animation: learning-pulse-green 2s infinite;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  border: 2px solid white;
}

.learning-pulse-dot.warning {
  background-color: #eab308;
  animation: learning-pulse-yellow 2s infinite;
  box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
}

@keyframes learning-pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

@keyframes learning-pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@keyframes learning-pulse-yellow {
  0% {
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(234, 179, 8, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0);
  }
}

/* Floating Tooltip Card */
.learning-overlay-card {
  position: absolute;
  background: rgba(12, 13, 20, 0.85) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6) !important;
  padding: 1rem 1.25rem !important;
  border-radius: 16px !important;
  width: 320px !important;
  z-index: 100000 !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 0.825rem !important;
  color: #e5e7eb !important;
  line-height: 1.4 !important;
  pointer-events: auto !important;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  opacity: 0;
  transform: translateY(8px);
}

.learning-overlay-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.learning-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
}

.learning-card-header.success {
  color: #4ade80;
}

.learning-card-header.error {
  color: #f87171;
}

.learning-card-header.warning {
  color: #facc15;
}

.learning-card-msg {
  color: #d1d5db;
  margin-bottom: 0.6rem;
}

.learning-card-hint {
  background: rgba(255, 255, 255, 0.04);
  padding: 0.5rem 0.65rem;
  border-radius: 4px 8px 8px 4px;
  font-size: 0.75rem;
  color: #9ca3af;
}

.learning-card-hint strong {
  color: #f3f4f6;
  font-family: 'Outfit', sans-serif;
}
`;

export class OverlaySystem {
  private indicators: Map<HTMLElement, HTMLElement> = new Map();
  private activeCard: HTMLElement | null = null;
  private resizeListener: (() => void) | null = null;

  constructor() {
    this.injectStyles();
  }

  private injectStyles() {
    if (typeof document === 'undefined') return;
    const styleId = 'learning-engine-overlay-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = INJECTED_CSS;
    document.head.appendChild(style);
  }

  update(evaluations: RuleEvaluation[]) {
    console.log('Updating overlays with evaluations:', evaluations);
    if (typeof document === 'undefined') return;
    this.clear();

    evaluations.forEach(ev => {
      if (!ev.anchor) return;
      
      const anchorElements = document.querySelectorAll(`[data-learning-anchor="${ev.anchor}"]`);
      anchorElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        this.createIndicator(htmlEl, ev);
      });
    });

    // Handle resizing window to keep absolute positions correct
    if (!this.resizeListener) {
      this.resizeListener = () => {
        if (this.activeCard) {
          this.clearActiveCard();
        }
      };
      window.addEventListener('resize', this.resizeListener);
      window.addEventListener('scroll', this.resizeListener, true);
    }
  }

  private createIndicator(target: HTMLElement, ev: RuleEvaluation) {
    console.log('Creating indicator for', ev.ruleId, 'on anchor:', ev.anchor);
    target.classList.add('learning-anchor-wrapper');

    const dot = document.createElement('div');
    dot.className = `learning-pulse-dot ${ev.success ? 'success' : 'error'}`;
    
    // Position dot in relative terms on top-right corner of wrapper
    target.appendChild(dot);
    this.indicators.set(target, dot);

    // Hover logic to show glassmorphic card
    let hoverTimeout: any = null;

    const showCard = () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      this.clearActiveCard();

      const card = document.createElement('div');
      card.className = 'learning-overlay-card';

      const statusEmoji = ev.success ? '🟢' : '⚡';
      const statusTitle = ev.success ? 'Completado' : 'Reto Pendiente';
      const headerClass = ev.success ? 'success' : 'error';

      card.innerHTML = `
        <div class="learning-card-header ${headerClass}">
          <span>${statusEmoji}</span>
          <span>${statusTitle} - ${ev.ruleId.replace('L1_', '').replace('_', ' ')}</span>
        </div>
        <div class="learning-card-msg">${ev.message}</div>
        ${ev.hint ? `<div class="learning-card-hint"><strong>Pista:</strong> ${ev.hint}</div>` : ''}
      `;

      document.body.appendChild(card);
      this.activeCard = card;

      // Position the card floating directly above the indicator dot
      const dotRect = dot.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Center the card on the dot
      const cardWidth = 290;
      let left = dotRect.left + scrollX - (cardWidth / 2) + 7;
      let top = dotRect.top + scrollY - 10; // position above dot

      // Adjust if out of boundary
      if (left < 10) left = 10;
      if (left + cardWidth > window.innerWidth - 10) {
        left = window.innerWidth - cardWidth - 10;
      }

      card.style.left = `${left}px`;
      
      // Calculate top position correctly (height is known only after render)
      const cardHeight = card.offsetHeight;
      const relativeTop = dotRect.top - 10 - cardHeight;

      if (relativeTop < 10) {
        // If it goes off-screen at the top of the viewport, position it below the dot
        card.style.top = `${dotRect.bottom + scrollY + 10}px`;
      } else {
        // Otherwise, position it above the dot (default)
        card.style.top = `${top - cardHeight}px`;
      }

      // Trigger animation
      requestAnimationFrame(() => {
        card.classList.add('visible');
      });

      // Keep open if hovering card itself
      card.addEventListener('mouseenter', () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
      });

      card.addEventListener('mouseleave', () => {
        hideCard();
      });
    };

    const hideCard = () => {
      hoverTimeout = setTimeout(() => {
        this.clearActiveCard();
      }, 300);
    };

    dot.addEventListener('mouseenter', showCard);
    dot.addEventListener('mouseleave', hideCard);
  }

  private clearActiveCard() {
    if (this.activeCard) {
      this.activeCard.remove();
      this.activeCard = null;
    }
  }

  clear() {
    this.clearActiveCard();
    this.indicators.forEach((dot, target) => {
      dot.remove();
      target.classList.remove('learning-anchor-wrapper');
    });
    this.indicators.clear();
  }

  destroy() {
    this.clear();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      window.removeEventListener('scroll', this.resizeListener, true);
      this.resizeListener = null;
    }
  }
}

export const overlaySystem = new OverlaySystem();
