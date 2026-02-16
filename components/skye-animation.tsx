"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

const LIGHT_COLORS = {
  main:  { r: 0x00, g: 0x97, b: 0xB2 },
  mid:   { r: 0x59, g: 0xBB, b: 0xCD },
  light: { r: 0xB2, g: 0xE0, b: 0xE8 },
};

const DARK_COLORS = {
  main:  { r: 0x7B, g: 0x2D, b: 0xCF },
  mid:   { r: 0xA8, g: 0x6E, b: 0xE0 },
  light: { r: 0xD4, g: 0xB8, b: 0xF0 },
};

interface SkyeAnimationProps {
  width?: number;
  height?: number;
  fill?: boolean;
  disassemble?: boolean;
  onDisassembleComplete?: () => void;
}

export default function SkyeAnimation({
  width = 400,
  height = 200,
  fill = false,
  disassemble = false,
  onDisassembleComplete,
}: SkyeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const animRef = useRef<number>(0);
  const disassembleRef = useRef(false);
  const onCompleteRef = useRef(onDisassembleComplete);

  // Keep callback ref fresh
  onCompleteRef.current = onDisassembleComplete;

  // When disassemble prop changes to true, set the ref flag
  useEffect(() => {
    if (disassemble) {
      disassembleRef.current = true;
    }
  }, [disassemble]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const COLORS = resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS;
    const ASSEMBLE_DURATION = 2.5;
    const DISASSEMBLE_DURATION = 1.5;

    let W: number, H: number;
    if (fill && container) {
      W = container.clientWidth;
      H = container.clientHeight;
    } else {
      W = width;
      H = height;
    }

    const PIXEL_SIZE = fill ? 3 : 2;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let logoPixels: Array<{ targetX: number; targetY: number; r: number; g: number; b: number }> = [];
    let particles: Array<{
      x: number; y: number; targetX: number; targetY: number;
      scatterX: number; scatterY: number;
      r: number; g: number; b: number;
      vx: number; vy: number; delay: number; size: number; settled: boolean;
    }> = [];
    let time = 0;
    let assembled = false;
    let assembleStart = performance.now() / 1000;
    let mouse = { x: -9999, y: -9999 };

    // Disassemble state
    let isDisassembling = false;
    let disassembleStart = 0;
    let disassembleTriggered = false;
    let globalAlpha = 1;

    function triggerDisassemble() {
      isDisassembling = true;
      disassembleStart = performance.now() / 1000;
      // Assign each particle a scatter target well outside the screen
      for (const p of particles) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(W, H) * 1.5 + Math.random() * 300;
        p.scatterX = p.targetX + Math.cos(angle) * dist;
        p.scatterY = p.targetY + Math.sin(angle) * dist;
        p.delay = Math.random() * 1.2;
        p.settled = false;
      }
    }

    function extractLogoPixels() {
      logoPixels = [];
      const fontSize = fill ? Math.min(W * 0.12, 120) : Math.min(W * 0.18, 60);
      const scale = fontSize / 200;
      const shadowStep = Math.max(PIXEL_SIZE, Math.round(5 * scale));
      const letterPositions = [0, 193, 355, 548].map(p => Math.round(p * scale));
      const contentWidth = Math.round(723 * scale);
      const totalWidth = contentWidth + shadowStep * 2;
      const letters = ["S", "K", "Y", "E"];

      const offCanvas = document.createElement("canvas");
      offCanvas.width = W;
      offCanvas.height = H;
      const offCtx = offCanvas.getContext("2d")!;
      offCtx.font = `${fontSize}px "Press Start 2P", monospace`;
      offCtx.textBaseline = "top";

      const testMetrics = offCtx.measureText("S");
      const textHeight = testMetrics.fontBoundingBoxAscent !== undefined
        ? testMetrics.fontBoundingBoxAscent + testMetrics.fontBoundingBoxDescent
        : fontSize;
      const totalHeight = textHeight + shadowStep * 2;

      const startX = Math.round((W - totalWidth) / 2);
      const startY = Math.round((H - totalHeight) / 2);

      const layerDefs = [
        { ox: shadowStep * 2, oy: shadowStep * 2, color: COLORS.light },
        { ox: shadowStep, oy: shadowStep, color: COLORS.mid },
        { ox: 0, oy: 0, color: COLORS.main },
      ];

      const layerCanvases = layerDefs.map(layer => {
        const lc = document.createElement("canvas");
        lc.width = W;
        lc.height = H;
        const lctx = lc.getContext("2d")!;
        lctx.font = `${fontSize}px "Press Start 2P", monospace`;
        lctx.textBaseline = "top";
        lctx.fillStyle = `rgb(${layer.color.r},${layer.color.g},${layer.color.b})`;
        for (let i = 0; i < letters.length; i++) {
          lctx.fillText(letters[i], startX + layer.ox + letterPositions[i], startY + layer.oy);
        }
        return { canvas: lc, color: layer.color };
      });

      const layerData = layerCanvases.map(lc =>
        lc.canvas.getContext("2d")!.getImageData(0, 0, W, H).data
      );

      for (let y = 0; y < H; y += PIXEL_SIZE) {
        for (let x = 0; x < W; x += PIXEL_SIZE) {
          const pixIdx = (y * W + x) * 4;
          for (let li = 2; li >= 0; li--) {
            if (layerData[li][pixIdx + 3] > 128) {
              const lc = layerCanvases[li];
              logoPixels.push({
                targetX: x, targetY: y,
                r: lc.color.r, g: lc.color.g, b: lc.color.b,
              });
              break;
            }
          }
        }
      }

      particles = logoPixels.map(p => {
        const angle = Math.random() * Math.PI * 2;
        const dist = fill
          ? Math.random() * Math.max(W, H) * 0.8 + 200
          : Math.random() * Math.max(W, H) * 0.6 + 100;
        return {
          x: p.targetX + Math.cos(angle) * dist,
          y: p.targetY + Math.sin(angle) * dist,
          targetX: p.targetX, targetY: p.targetY,
          scatterX: 0, scatterY: 0,
          r: p.r, g: p.g, b: p.b,
          vx: 0, vy: 0,
          delay: Math.random() * 1.5,
          size: PIXEL_SIZE,
          settled: false,
        };
      });
      assembleStart = performance.now() / 1000;
      assembled = false;
    }

    function easeOutExpo(t: number) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update() {
      const now = performance.now() / 1000;
      const elapsed = now - assembleStart;

      // Check if we need to trigger disassembly
      if (disassembleRef.current && !disassembleTriggered) {
        disassembleTriggered = true;
        triggerDisassemble();
      }

      if (isDisassembling) {
        const disElapsed = now - disassembleStart;
        const totalDis = DISASSEMBLE_DURATION + 1.2;
        const overallT = Math.min(1, disElapsed / totalDis);
        globalAlpha = 1;

        // Ease particles outward — starts slow, accelerates (ease-in)
        for (const p of particles) {
          if (disElapsed > p.delay) {
            const t = Math.min(1, (disElapsed - p.delay) / DISASSEMBLE_DURATION);
            const ease = t * t * t; // cubic ease-in: gradual start, fast finish
            p.x = p.targetX + (p.scatterX - p.targetX) * ease;
            p.y = p.targetY + (p.scatterY - p.targetY) * ease;
          }
        }

        if (overallT >= 1) {
          onCompleteRef.current?.();
        }
        return;
      }

      for (const p of particles) {
        if (elapsed < p.delay + ASSEMBLE_DURATION) {
          if (elapsed > p.delay) {
            const t = Math.min(1, (elapsed - p.delay) / ASSEMBLE_DURATION);
            const ease = easeOutExpo(t);
            p.x += (p.targetX - p.x) * ease * 0.08;
            p.y += (p.targetY - p.y) * ease * 0.08;
          }
        } else {
          if (!p.settled) { p.x = p.targetX; p.y = p.targetY; p.settled = true; }
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = fill ? 80 : 60;
          if (dist < repelRadius && dist > 0) {
            const force = ((repelRadius - dist) / repelRadius) * (fill ? 8 : 6);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx += (p.targetX - p.x) * 0.15;
          p.vy += (p.targetY - p.y) * 0.15;
          p.vx *= 0.75;
          p.vy *= 0.75;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

    }

    function drawLogoGlow() {
      if (!assembled && (performance.now() / 1000 - assembleStart) < 3) return;

      const pulse = 0.6 + Math.sin(time * 1.5) * 0.15;
      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (const p of logoPixels) {
        if (p.targetX < minX) minX = p.targetX;
        if (p.targetX > maxX) maxX = p.targetX;
        if (p.targetY < minY) minY = p.targetY;
        if (p.targetY > maxY) maxY = p.targetY;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = (maxX - minX) / 2 + 60;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      gradient.addColorStop(0, `rgba(${COLORS.light.r},${COLORS.light.g},${COLORS.light.b},${0.15 * pulse * globalAlpha})`);
      gradient.addColorStop(0.5, `rgba(${COLORS.light.r},${COLORS.light.g},${COLORS.light.b},${0.06 * pulse * globalAlpha})`);
      gradient.addColorStop(1, `rgba(${COLORS.light.r},${COLORS.light.g},${COLORS.light.b},0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (fill && !isDisassembling) {
        drawLogoGlow();
      }

      for (const p of particles) {
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    }

    let lastTime = performance.now();
    function loop(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      time += dt;
      if (!assembled && (performance.now() / 1000 - assembleStart) > ASSEMBLE_DURATION + 2) {
        assembled = true;
      }
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    document.fonts.ready.then(() => {
      extractLogoPixels();
      animRef.current = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [resolvedTheme, width, height, fill]);

  if (fill) {
    return (
      <div ref={containerRef} className="w-full h-full" style={{ position: "absolute", inset: 0 }}>
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="cursor-crosshair"
    />
  );
}
