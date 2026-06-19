import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — an interactive particle nebula (imperative three.js).
   ~7k points on a Fibonacci sphere, driven by multi-octave simplex
   turbulence. The cloud:
     • repels in 3D away from the cursor (a bulge that tracks the pointer)
     • emits an expanding shockwave on click
     • disperses + spins faster as you scroll the hero
     • glows hotter where the cursor is near
   A faint wireframe icosahedron sits inside as structure. All rotation
   happens in the shader (uRot) so the cursor math stays in world space.
   ------------------------------------------------------------------------- */

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
float fbm(vec3 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<4;i++){ v+=a*snoise(p); p*=2.02; a*=0.5; }
  return v;
}
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScroll;
uniform float uMouseStrength;
uniform float uShock;
uniform float uShockPhase;
uniform vec3 uMouse;
uniform vec3 uShockPos;
uniform mat3 uRot;
attribute float aSeed;
attribute float aScale;
varying float vMix;
varying float vGlow;
${SIMPLEX}
void main(){
  vec3 base = position;
  vec3 nrm = normalize(base);
  float t = uTime * 0.16;

  // multi-octave turbulence sampled in stable (un-rotated) space
  float f = fbm(base * 0.55 + vec3(t));
  float f2 = fbm(base * 1.6 - vec3(t * 1.25));
  float disp = f * 0.6 + f2 * 0.4;

  // rotate the whole cloud in the shader (keeps cursor math in world space)
  vec3 p = uRot * base;
  vec3 wn = uRot * nrm;

  // radial turbulence + scroll-driven dispersion
  p += wn * disp * (0.95 + uScroll * 2.2);

  // tangential swirl => flowing motion
  vec3 tang = normalize(cross(wn, vec3(0.0, 1.0, 0.0)) + 1e-4);
  p += tang * f2 * (0.45 + uScroll * 0.6);

  // 3D cursor repulsion — a bulge that follows the pointer
  vec3 toM = p - uMouse;
  float dM = length(toM);
  float push = uMouseStrength * exp(-dM * dM * 0.6);
  p += normalize(toM) * push;
  float near = exp(-dM * dM * 0.5);

  // click shockwave — an expanding ring from the click point
  float dS = length(p - uShockPos);
  float ring = sin(dS * 5.0 - uShockPhase);
  p += wn * ring * uShock * exp(-dS * 0.55) * 0.8;

  vMix = clamp(0.5 + f * 0.7 + sin(t * 0.5 + aSeed * 6.28) * 0.12, 0.0, 1.0);
  vGlow = 0.38 + 0.55 * smoothstep(-0.2, 0.6, f) + near * 0.9 + uShock * abs(ring) * 0.4;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (12.0 / -mv.z) * (1.0 + near * 1.8 + uScroll * 0.6);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uOpacity;
varying float vMix;
varying float vGlow;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.2, 0.0, d);
  vec3 col = mix(uColorA, uColorB, vMix);
  col = mix(col, uColorC, smoothstep(0.62, 1.0, vMix) * 0.7);
  col += core * 0.7;
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
    scales[i] = 0.5 + Math.random() * 1.7
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
      return // no WebGL — CSS aurora still carries the look
    }

    // Fall back to viewport size if the container hasn't been laid out yet
    // (can happen on lazy mount before the hero has width).
    const sizeOf = () => ({
      w: mount.clientWidth || window.innerWidth,
      h: mount.clientHeight || window.innerHeight,
    })

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const init = sizeOf()
    renderer.setPixelRatio(dpr)
    renderer.setSize(init.w, init.h)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const FOV = 42
    const camera = new THREE.PerspectiveCamera(FOV, init.w / init.h, 0.1, 100)
    const CAM_Z = 10
    camera.position.set(0, 0, CAM_Z)

    const RADIUS = 3.2
    const COUNT = window.innerWidth < 720 ? 4500 : 7400
    const { positions, seeds, scales } = fibonacciSphere(COUNT, RADIUS)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 10.0 },
      uPixelRatio: { value: dpr },
      uScroll: { value: 0 },
      uMouseStrength: { value: 0.5 },
      uShock: { value: 0 },
      uShockPhase: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 99) },
      uShockPos: { value: new THREE.Vector3(0, 0, 0) },
      uRot: { value: new THREE.Matrix3() },
      uColorA: { value: new THREE.Color('#7c5cff') },
      uColorB: { value: new THREE.Color('#22d3ee') },
      uColorC: { value: new THREE.Color('#ff5c87') },
      uOpacity: { value: 0.0 },
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

    // faint wireframe core for structure
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(RADIUS * 0.62, 1)),
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#7c5cff'),
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    scene.add(wire)

    // --- view-space mapping for the cursor ---
    let halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z
    let halfW = halfH * camera.aspect
    const computeExtent = () => {
      halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z
      halfW = halfH * camera.aspect
    }
    computeExtent()

    // --- interaction state ---
    const targetN = { x: 0, y: 0 } // normalised cursor (-1..1)
    const curN = { x: 0, y: 0 }
    let moveImpulse = 0
    let hasPointer = false
    let shock = 0
    let shockPhase = 0
    const rotM4 = new THREE.Matrix4()
    const euler = new THREE.Euler()

    const onPointer = (e) => {
      targetN.x = (e.clientX / window.innerWidth) * 2 - 1
      targetN.y = -((e.clientY / window.innerHeight) * 2 - 1)
      moveImpulse = 1
      hasPointer = true
    }
    const onDown = (e) => {
      // start a shockwave at the current cursor position in world space
      shock = 1
      shockPhase = 0
      uniforms.uShockPos.value.set(curN.x * halfW, curN.y * halfH, 1.6)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown)

    const onResize = () => {
      const { w, h } = sizeOf()
      if (w <= 0 || h <= 0) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      computeExtent()
    }
    window.addEventListener('resize', onResize)
    // ResizeObserver catches the container getting its real size after a
    // lazy mount (window 'resize' alone would miss that).
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    io.observe(mount)

    const clock = new THREE.Clock()
    let raf

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible && !window.__FORCE_RENDER__) return // TEMP: __FORCE_RENDER__ for headless capture

      const t = clock.getElapsedTime()
      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value = reduceMotion ? 0 : t

      // smooth the cursor + decay the movement impulse
      curN.x += (targetN.x - curN.x) * 0.07
      curN.y += (targetN.y - curN.y) * 0.07
      moveImpulse *= 0.93

      // scroll progress through the hero (disperse as you leave)
      const scroll = Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1)
      uniforms.uScroll.value += (scroll - uniforms.uScroll.value) * 0.1

      // cursor world position + strength
      if (hasPointer) {
        uniforms.uMouse.value.set(curN.x * halfW, curN.y * halfH, 1.6)
      }
      const strengthTarget = reduceMotion ? 0 : 0.5 + moveImpulse * 0.9
      uniforms.uMouseStrength.value += (strengthTarget - uniforms.uMouseStrength.value) * 0.15

      // shockwave decay
      if (shock > 0.001 && !reduceMotion) {
        shockPhase += dt * 9.0
        shock *= 0.945
      } else {
        shock = 0
      }
      uniforms.uShock.value = shock
      uniforms.uShockPhase.value = shockPhase

      // rotation (time + cursor parallax + scroll), applied in-shader
      const ry = (reduceMotion ? 0 : t * 0.06) + curN.x * 0.55 + uniforms.uScroll.value * 0.6
      const rx = curN.y * -0.4 + uniforms.uScroll.value * 0.25
      euler.set(rx, ry, 0)
      rotM4.makeRotationFromEuler(euler)
      uniforms.uRot.value.setFromMatrix4(rotM4)
      wire.rotation.set(rx * 1.1, -ry * 0.8, 0)

      // intro fade (time-based so it's frame-rate independent) + breathing
      const intro = Math.min(t / 1.2, 1) * 0.95
      uniforms.uOpacity.value = intro
      wire.material.opacity = intro * (0.1 + Math.abs(Math.sin(t * 0.6)) * 0.05) * (1 - uniforms.uScroll.value)
      const breathe = 1 + Math.sin(t * 0.8) * 0.015
      points.scale.setScalar(breathe)

      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      io.disconnect()
      geometry.dispose()
      material.dispose()
      wire.geometry.dispose()
      wire.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
