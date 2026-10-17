"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Flowing cloth: curved, domain-warped fold bands with a lit crest and a soft shadow.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

const vec3 DEEP  = vec3(0.11, 0.17, 0.80);
const vec3 BASE  = vec3(0.20, 0.33, 0.94);
const vec3 CYAN  = vec3(0.33, 0.68, 0.98);
const vec3 LIGHT = vec3(0.55, 0.82, 1.00);

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;

  // Warp space so the folds bend and drift like fabric.
  vec2 q = p;
  q.x += 0.25 * sin(q.y * 2.3 + t * 0.35);
  q.y += 0.18 * sin(q.x * 3.1 - t * 0.30);

  float f = q.y * 1.4
          + 0.55 * sin(q.x * 2.2 + t * 0.40)
          + 0.30 * sin(q.x * 4.3 - q.y * 1.7 - t * 0.28)
          + 0.12 * sin(q.x * 7.0 + q.y * 3.0 + t * 0.50);

  float wave = 0.5 + 0.5 * sin(f * 3.2);
  float crest = pow(wave, 5.0);
  float shadow = pow(1.0 - wave, 3.0);

  // Broad light pools: top-left and bottom are brighter, centre deeper.
  float pool = smoothstep(0.6, 1.0, uv.y) * smoothstep(0.9, 0.0, uv.x)
             + smoothstep(0.4, 0.0, uv.y);

  vec3 col = mix(BASE, DEEP, 0.35 * (1.0 - pool));
  col = mix(col, CYAN, crest * (0.30 + 0.20 * pool));
  col = mix(col, DEEP, shadow * 0.22);
  col += LIGHT * pow(wave, 14.0) * 0.06;

  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function SilkBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!canvas || !gl) return; // CSS background colour stays as fallback

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      gl.uniform1f(uTime, reduceMotion ? 4 : ((now - start) / 1000) * 0.5 + 4);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className={className} />;
}
