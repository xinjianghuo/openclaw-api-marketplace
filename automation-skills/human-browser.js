/**
 * Human-Like Mouse Movement for Playwright
 *
 * Simulates realistic human mouse movement with:
 * - Bezier curve trajectories (natural arc)
 * - Variable speed (acceleration/deceleration)
 * - Micro-jitter (hand tremor)
 * - Random pauses (thinking/aiming)
 */

import { random, triangular } from 'simple-statistics';

export class HumanMouse {
  constructor(page) {
    this.page = page;
    this.currentX = 0;
    this.currentY = 0;

    // Human movement parameters (tweak for realism)
    this.minSpeed = 300;      // px/s - slow deliberate movement
    this.maxSpeed = 2000;     // px/s - fast flick
    this.jitterAmplitude = 1.5; // pixels of shake
    this.pauseProbability = 0.15; // 15% chance to pause mid-move
  }

  /**
   * Move mouse to target position with human-like behavior
   */
  async moveTo(targetX, targetY, options = {}) {
    const {
      steps = null,           // override step count
      pauseBefore = 0,        // ms pause before starting
      pauseAfter = 0,         // ms pause after completing
      overshoot = false       // allow slight overshoot and correct
    } = options;

    if (pauseBefore > 0) {
      await this.sleep(pauseBefore);
    }

    const startX = this.currentX;
    const startY = this.currentY;
    const distance = Math.sqrt(
      Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
    );

    // Determine number of steps (more steps for longer distance)
    const stepCount = steps || Math.max(20, Math.floor(distance / 5));

    // Generate smooth path with control points
    const path = this.generateBezierPath(startX, startY, targetX, targetY, stepCount);

    // Calculate duration based on distance and random speed
    const speed = random(this.minSpeed, this.maxSpeed);
    const baseDuration = (distance / speed) * 1000; // ms

    // Execute movement with timing
    await this.followPath(page, path, baseDuration);

    // Optional overshoot and correction (simulate overshooting slightly)
    if (overshoot && distance > 100 && Math.random() < 0.3) {
      const overshootAmount = random(5, 15);
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const overX = targetX + Math.cos(angle) * overshootAmount;
      const overY = targetY + Math.sin(angle) * overshootAmount;

      await this.sleep(random(50, 150));
      await this.moveTo(overX, overY, { pauseBefore: 0, overshoot: false });
      await this.sleep(random(30, 100));
      await this.moveTo(targetX, targetY, { pauseBefore: 0, overshoot: false });
    }

    this.currentX = targetX;
    this.currentY = targetY;

    if (pauseAfter > 0) {
      await this.sleep(pauseAfter);
    }
  }

  /**
   * Generate a bezier curve path with jitter
   */
  generateBezierPath(x0, y0, x1, y1, steps) {
    const path = [];

    // Random control points for natural arc
    const cx = x0 + (x1 - x0) * triangular(0.3, 0.5, 0.7);
    const cy = y0 + (y1 - y0) * triangular(0.3, 0.5, 0.7);

    // Perpendicular offset for secondary control (creates arc)
    const dx = x1 - x0;
    const dy = y1 - y0;
    const perpX = -dy / 10 * (Math.random() - 0.5);
    const perpY = dx / 10 * (Math.random() - 0.5);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      // Cubic bezier
      let x = Math.pow(1-t, 3) * x0 +
              3 * Math.pow(1-t, 2) * t * cx +
              3 * (1-t) * t * t * (x1 + perpX) +
              Math.pow(t, 3) * x1;
      let y = Math.pow(1-t, 3) * y0 +
              3 * Math.pow(1-t, 2) * t * cy +
              3 * (1-t) * t * t * (y1 + perpY) +
              Math.pow(t, 3) * y1;

      // Add jitter (more at start/end, less in middle)
      const tJitter = t < 0.5 ? t * 2 : (1 - t) * 2; // 0 at ends, 1 at middle actually invert
      const jitterAmount = this.jitterAmplitude * Math.sin(t * Math.PI);
      x += random(-jitterAmount, jitterAmount);
      y += random(-jitterAmount, jitterAmount);

      // Random mid-point pause
      if (i > 0 && i < steps && Math.random() < this.pauseProbability / steps) {
        path.push({ x, y, pause: random(30, 150) });
      } else {
        path.push({ x, y });
      }
    }

    return path;
  }

  /**
   * Follow the generated path with realistic timing
   */
  async followPath(page, path, totalDuration) {
    const baseDelay = totalDuration / path.length;

    for (let i = 0; i < path.length; i++) {
      const point = path[i];

      if (point.pause) {
        await new Promise(resolve => setTimeout(resolve, point.pause));
      }

      await page.mouse.move(point.x, point.y);

      // Variable delay (simulates uneven hand movement)
      const delayVariation = random(-0.3, 0.5) * baseDelay;
      const delay = Math.max(5, baseDelay + delayVariation);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Click with human-like behavior (pause before, double-click chance)
   */
  async click(x, y, options = {}) {
    const {
      delayBefore = random(100, 400),
      delayAfter = random(50, 200),
      doubleClick = false,
      button = 'left'
    } = options;

    if (this.currentX !== x || this.currentY !== y) {
      await this.moveTo(x, y);
    }

    await this.sleep(delayBefore);

    if (doubleClick && Math.random() < 0.1) {
      await this.page.mouse.dblclick(x, y, { button });
    } else {
      await this.page.mouse.click(x, y, { button });
    }

    await this.sleep(delayAfter);
  }

  /**
   * Drag with human-like behavior (slight zigzag, pauses)
   */
  async drag(fromX, fromY, toX, toY) {
    await this.moveTo(fromX, fromY);
    await this.page.mouse.down();

    // Drag with small random deviations
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t + random(-3, 3);
      const y = fromY + (toY - fromY) * t + random(-3, 3);
      await this.page.mouse.move(x, y);
      await this.sleep(random(10, 40));
    }

    await this.page.mouse.up();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Human-like typing with errors and corrections
 */
export class HumanTyper {
  constructor(page) {
    this.page = page;
    this.wpm = random(60, 100); // Words per minute
    this.errorRate = 0.015; // 1.5% typo rate
    this.pauseAfterPunctuation = 0.2; // 20% chance to pause after comma/period
  }

  /**
   * Type text with human-like mistakes and corrections
   */
  async type(element, text, options = {}) {
    const {
      clearFirst = true,
      backspaceSpeed = 50 // ms between backspaces
    } = options;

    if (clearFirst) {
      await element.click({ clickCount: 3 }); // Triple-click to select all
      await this.page.keyboard.press('Backspace');
      await this.sleep(random(100, 300));
    }

    const chars = text.split('');
    let mistakes = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      // Random pause (thinking)
      if (Math.random() < 0.08) {
        await this.sleep(random(100, 600));
      }

      // Punctuation pause
      if ([',', '.', '!', '?', ';', ':'].includes(char)) {
        if (Math.random() < this.pauseAfterPunctuation) {
          await this.sleep(random(150, 500));
        }
      }

      // Typo!
      if (Math.random() < this.errorRate) {
        const typoChar = this.getRandomCharExcept(char);
        await this.page.keyboard.type(typoChar);
        await this.sleep(random(50, 150));
        await this.page.keyboard.press('Backspace');
        mistakes++;
      }

      // Type correct character
      await this.page.keyboard.type(char);

      // Typing interval based on WPM
      const interval = this.calculateInterval();
      await this.sleep(interval);
    }

    return mistakes;
  }

  calculateInterval() {
    // Average 5 chars per word
    const charsPerMinute = this.wpm * 5;
    const baseInterval = (60 / charsPerMinute) * 1000; // ms per char
    const variance = baseInterval * 0.4; // ±40% variance
    return baseInterval + random(-variance, variance);
  }

  getRandomCharExcept(except) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const candidates = chars.split('').filter(c => c !== except);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Human-like scrolling
 */
export async function humanScroll(page, targetY, duration = 2000) {
  const startY = await page.evaluate(() => window.scrollY);
  const distance = targetY - startY;
  const steps = Math.min(100, Math.max(20, Math.floor(Math.abs(distance) / 30)));
  const stepDelay = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Ease-in-out curve
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const currentY = startY + distance * ease;

    await page.evaluate((y) => window.scrollTo(0, y), currentY);

    // Random pause (reading/viewing)
    if (Math.random() < 0.12) {
      await new Promise(resolve => setTimeout(resolve, random(300, 1200)));
    }

    // Occasional backscroll (re-reading)
    if (Math.random() < 0.06) {
      const backAmount = random(20, 100);
      await page.evaluate((amt) => window.scrollBy(0, -amt), backAmount);
      await new Promise(resolve => setTimeout(resolve, random(100, 400)));
    }

    await new Promise(resolve => setTimeout(resolve, stepDelay + random(-30, 80)));
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Export as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HumanMouse, HumanTyper, humanScroll };
}
