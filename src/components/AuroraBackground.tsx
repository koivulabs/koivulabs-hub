'use client';

import { useEffect, useRef, useState } from 'react';

interface AuroraBackgroundProps {
    /** 1 = full hero strength, ~0.35 = ambient on content pages */
    intensity?: number;
}

const TRAIL_LENGTH = 14;

const VERTEX_SRC = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 uRes;
uniform float uT;
uniform float uIntensity;
uniform vec3 uTrail[${TRAIL_LENGTH}];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
}

void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 q = uv; q.x *= uRes.x / uRes.y;

    float warp = 0.0;
    float spark = 0.0;
    for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
        vec2 tp = uTrail[i].xy; tp.x *= uRes.x / uRes.y;
        float w = uTrail[i].z;
        float d = distance(q, tp);
        warp += w * 0.55 * exp(-d * d * 9.0);
        spark += w * exp(-d * d * 60.0);
    }

    vec2 np = vec2(q.x * 1.6, q.y * 2.6 - uT * 0.10);
    float band = fbm(np + warp * 1.4 + fbm(np * 1.7 + uT * 0.04));
    float curtain = smoothstep(0.32, 0.78, band) * (0.35 + 0.65 * smoothstep(1.05, 0.12, uv.y));
    curtain += warp * 0.45;

    vec3 teal = vec3(0.11, 0.83, 0.74);
    vec3 violet = vec3(0.42, 0.32, 0.86);
    vec3 green = vec3(0.22, 0.86, 0.45);

    vec3 col = vec3(0.008, 0.02, 0.055);
    col += uIntensity * curtain * mix(teal, violet, fbm(np * 0.6 + 3.7)) * 0.85;
    col += uIntensity * curtain * curtain * green * 0.35;
    col += uIntensity * spark * vec3(0.65, 1.0, 0.92) * 0.5;

    float stars = step(0.9985, hash(floor(gl_FragCoord.xy / 1.5)))
        * smoothstep(0.5, 0.0, uv.y)
        * (0.5 + 0.5 * sin(uT * 2.0 + hash(floor(gl_FragCoord.xy)) * 40.0));
    col += stars * 0.5 * uIntensity;

    col *= 1.0 - 0.45 * length(uv - 0.5);
    gl_FragColor = vec4(col, 1.0);
}`;

/** Static gradient fallback: no WebGL, reduced motion, or coarse pointer. */
function StaticAurora({ intensity }: { intensity: number }) {
    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                opacity: intensity,
                background:
                    'radial-gradient(ellipse 55% 40% at 35% 18%, rgba(45,212,191,0.16), transparent 65%),' +
                    'radial-gradient(ellipse 45% 35% at 75% 30%, rgba(110,86,207,0.12), transparent 65%),' +
                    'radial-gradient(ellipse 50% 30% at 55% 8%, rgba(52,211,153,0.08), transparent 60%),' +
                    '#020617',
            }}
        />
    );
}

type AuroraMode = 'animated' | 'still' | 'static';

export default function AuroraBackground({ intensity = 1 }: AuroraBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // null = undecided (SSR/first paint renders static — no flash, no hydration mismatch)
    // 'still' = reduced motion: render ONE rich shader frame, zero movement
    const [mode, setMode] = useState<AuroraMode | null>(null);

    // Intensity lives in a ref so route changes do NOT re-run the GL effect.
    // Tearing the effect down calls loseContext(), and a canvas whose context
    // was lost can never be re-initialized — subpages would go dark.
    const intensityRef = useRef(intensity);
    const redrawStillRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        intensityRef.current = intensity;
        redrawStillRef.current?.();
    }, [intensity]);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        if (coarsePointer) setMode('static');
        else if (reducedMotion) setMode('still');
        else setMode('animated');
    }, []);

    useEffect(() => {
        if (mode !== 'animated' && mode !== 'still') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
        if (!gl) { setMode('static'); return; }

        const compile = (type: number, src: string) => {
            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('[Aurora] shader compile failed:', gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
        const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
        if (!vs || !fs) { setMode('static'); return; }

        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, 'uRes');
        const uT = gl.getUniformLocation(program, 'uT');
        const uIntensity = gl.getUniformLocation(program, 'uIntensity');
        const uTrail = gl.getUniformLocation(program, 'uTrail');

        // Render at 60% resolution — the aurora is soft, full res is wasted GPU
        const RENDER_SCALE = 0.6;
        const resize = () => {
            canvas.width = Math.max(1, Math.floor(window.innerWidth * RENDER_SCALE));
            canvas.height = Math.max(1, Math.floor(window.innerHeight * RENDER_SCALE));
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        const trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0.5, y: 0.5, w: 0 }));
        const flat = new Float32Array(TRAIL_LENGTH * 3);

        const drawFrame = (timeSeconds: number) => {
            for (let i = 0; i < TRAIL_LENGTH; i++) {
                trail[i].w *= 0.962;
                flat[i * 3] = trail[i].x;
                flat[i * 3 + 1] = trail[i].y;
                flat[i * 3 + 2] = trail[i].w;
            }
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uT, timeSeconds);
            gl.uniform1f(uIntensity, intensityRef.current);
            gl.uniform3fv(uTrail, flat);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        // Reduced motion: one rich frozen frame, zero movement, no listeners
        if (mode === 'still') {
            drawFrame(21.7);
            redrawStillRef.current = () => drawFrame(21.7);
            const redraw = () => { resize(); drawFrame(21.7); };
            window.removeEventListener('resize', resize);
            window.addEventListener('resize', redraw);
            return () => {
                redrawStillRef.current = null;
                window.removeEventListener('resize', redraw);
                gl.getExtension('WEBGL_lose_context')?.loseContext();
            };
        }

        // Canvas sits behind content (pointer-events: none) — track the pointer on window
        let lastAdd = 0;
        const onPointerMove = (e: PointerEvent) => {
            const now = performance.now();
            if (now - lastAdd < 28) return;
            lastAdd = now;
            trail.pop();
            trail.unshift({ x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight, w: 1 });
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });

        let raf = 0;
        let running = true;
        const render = (t: number) => {
            if (!running) return;
            drawFrame(t * 0.001);
            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);

        // Save GPU + battery when the tab is hidden
        const onVisibility = () => {
            running = !document.hidden;
            if (running) raf = requestAnimationFrame(render);
            else cancelAnimationFrame(raf);
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('visibilitychange', onVisibility);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [mode]);

    if (mode !== 'animated' && mode !== 'still') return <StaticAurora intensity={mode === null ? 0 : intensity} />;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 z-0 h-full w-full pointer-events-none"
        />
    );
}
