import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a bespoke particle sphere written directly against three.js.
   ~7k points distributed on a Fibonacci sphere, displaced by 3D simplex
   noise in the vertex shader and tinted violet→cyan. Additive blending
   gives the glow. The whole cloud drifts toward the cursor.
   Imperative (no react-three-fiber) so it's framework-version-proof.
   ------------------------------------------------------------------------- */

// Classic Ashima 3D simplex noise — used inside the vertex shader.
const SIMPLEX = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uDisplace;
uniform vec3 uMouse;
attribute float aSeed;
attribute float aScale;
varying float vMix;
varying float vGlow;
${SIMPLEX}
void main(){
  vec3 pos = position;
  float n = snoise(pos * 1.1 + vec3(uTime * 0.18));
  float n2 = snoise(pos * 2.4 - vec3(uTime * 0.12));
  float disp = n * 0.55 + n2 * 0.22;
  pos += normalize(pos) * disp * uDisplace;

  // gentle pull toward the cursor direction
  pos += uMouse * (0.18 + 0.12 * n);

  vMix = clamp(0.5 + n * 0.6, 0.0, 1.0);
  vGlow = 0.45 + 0.55 * smoothstep(-0.2, 0.6, n);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (12.0 / -mv.z);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vMix;
varying float vGlow;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.22, 0.0, d);
  vec3 col = mix(uColorA, uColorB, vMix);
  col += core * 0.6;                 // hot white-ish core
  float alpha = soft * uOpacity * vGlow;
  gl_FragColor = vec4(col, alpha);
}
`

function fibonacciSphere(count, radius) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const scales = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions[i * 3] = Math.cos(theta) * r * radius
    positions[i * 3 + 1] = y * radius
    positions[i * 3 + 2] = Math.sin(theta) * r * radius
    seeds[i] = Math.random()
    scales[i] = 0.5 + Math.random() * 1.6
  }
  return { positions, seeds, scales }
}

export default function Scene3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (e) {
      // No WebGL — fail silently, the CSS aurora still carries the look.
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 9)

    const COUNT = window.innerWidth < 720 ? 4200 : 7200
    const { positions, seeds, scales } = fibonacciSphere(COUNT, 3.2)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 9.0 },
      uPixelRatio: { value: dpr },
      uDisplace: { value: 0.9 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uColorA: { value: new THREE.Color('#7c5cff') },
      uColorB: { value: new THREE.Color('#22d3ee') },
      uOpacity: { value: 0.0 }, // fades in
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // --- interaction state ---
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onPointer = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      target.x = x
      target.y = y
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // pause rendering when the hero scrolls out of view
    let visible = true
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0 },
    )
    io.observe(mount)

    const clock = new THREE.Clock()
    let raf
    let opacity = 0

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      const t = clock.getElapsedTime()
      uniforms.uTime.value = reduceMotion ? 0 : t

      // smooth mouse + idle drift
      current.x += (target.x - current.x) * 0.045
      current.y += (target.y - current.y) * 0.045
      uniforms.uMouse.value.set(current.x * 0.9, current.y * 0.9, 0)

      // graceful intro fade
      opacity += (0.95 - opacity) * 0.02
      uniforms.uOpacity.value = opacity

      points.rotation.y = (reduceMotion ? 0 : t * 0.06) + current.x * 0.5
      points.rotation.x = current.y * -0.35
      uniforms.uDisplace.value = 0.9 + Math.hypot(current.x, current.y) * 0.6

      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      io.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
