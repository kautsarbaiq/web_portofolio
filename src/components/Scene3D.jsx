import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a dotted contour-line sphere (imperative three.js).

   ~50k tiny points arranged in ORDERED latitude rings (that ordering is
   what creates the striped, moiré contour look), folded by layered simplex
   noise in the vertex shader into deep organic waves — a monochrome
   particle sculpture: ink dots on concrete in light mode, bone dots on
   charcoal in dark mode.

   Interaction: slow rotation, cursor parallax, drag-to-spin with inertia,
   cursor proximity deepens the folds, click sends a ripple through the
   surface, and scroll rotates/sinks the sphere as the hero exits.
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
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uPulse;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uPoke;
varying float vShade;
${SIMPLEX}
void main(){
  vec3 dir = normalize(position);
  float t = uTime;

  // layered folds — a deep slow field plus fine detail.
  // Gentle time rates keep the surface morphing fluid rather than busy.
  float n1 = snoise(dir * 1.35 + vec3(t * 0.09, t * 0.07, -t * 0.08));
  float n2 = snoise(dir * 3.1 - vec3(t * 0.05));
  float n3 = snoise(dir * 6.5 + vec3(t * 0.035));
  float fold = n1 * 0.75 + n2 * 0.2 + n3 * 0.05;

  // cursor-facing bulge
  float facing = max(0.0, dot(dir, uPoke));
  fold += facing * facing * 0.25 * uPoke.z;

  // click ripple sweeping across the sphere (soft, slow wave)
  fold += uPulse * 0.32 * sin(dot(dir, vec3(0.7, 0.5, 0.5)) * 8.0 - t * 9.0);

  float r = length(position) * (1.0 + fold * uAmp);
  vec3 p = dir * r;

  // shade: compressed (inner) folds darker, crests brighter
  vShade = clamp(0.78 + fold * 0.5, 0.3, 1.3);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (5.2 / -mv.z);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
varying float vShade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.12, d);
  gl_FragColor = vec4(uColor, soft * uAlpha * vShade);
}
`

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
      return
    }

    const sizeOf = () => ({
      w: mount.clientWidth || window.innerWidth,
      h: mount.clientHeight || window.innerHeight,
    })

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const init = sizeOf()
    renderer.setPixelRatio(dpr)
    renderer.setSize(init.w, init.h)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, init.w / init.h, 0.1, 100)
    camera.position.set(0, 0, 6)

    const isMobile = window.innerWidth < 720

    // ---- ordered latitude rings of dots (the ordering makes the contours) ----
    const RINGS = isMobile ? 150 | 0 : 210
    const R = 1.5
    const positions = []
    for (let i = 0; i < RINGS; i++) {
      const phi = (Math.PI * (i + 0.5)) / RINGS
      const ringR = Math.sin(phi)
      const y = Math.cos(phi)
      // constant angular density → more dots on bigger rings
      const count = Math.max(24, Math.round(ringR * (isMobile ? 240 : 300)))
      for (let j = 0; j < count; j++) {
        const theta = (Math.PI * 2 * j) / count
        positions.push(Math.cos(theta) * ringR * R, y * R, Math.sin(theta) * ringR * R)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.34 },
      uPulse: { value: 0 },
      uSize: { value: isMobile ? 2.0 : 2.3 },
      uPixelRatio: { value: dpr },
      uPoke: { value: new THREE.Vector3(0, 0, 0) },
      uColor: { value: new THREE.Color('#171716') },
      uAlpha: { value: 0.85 },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    })
    const sphere = new THREE.Points(geometry, material)
    const group = new THREE.Group()
    const SCALE = isMobile ? 0.85 : 1.0
    group.scale.setScalar(SCALE)
    group.add(sphere)
    scene.add(group)

    // ---- theme handling: ink on concrete / bone on charcoal ----
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      uniforms.uColor.value.set(dark ? '#f2f0e9' : '#1b1b1a')
      uniforms.uAlpha.value = dark ? 1.0 : 0.85
      material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      material.needsUpdate = true
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // ---- interaction ----
    const targetN = { x: 0, y: 0 }
    const curN = { x: 0, y: 0 }
    let moveImpulse = 0
    let clickPulse = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let spinY = 0
    let spinX = 0
    let velY = 0
    let velX = 0

    const onPointerMove = (e) => {
      targetN.x = (e.clientX / window.innerWidth) * 2 - 1
      targetN.y = -((e.clientY / window.innerHeight) * 2 - 1)
      moveImpulse = Math.min(moveImpulse + 0.2, 1)
      if (dragging) {
        const dx = (e.clientX - lastX) / window.innerWidth
        const dy = (e.clientY - lastY) / window.innerHeight
        lastX = e.clientX
        lastY = e.clientY
        velY = dx * 5
        velX = dy * 3
        spinY += velY
        spinX = THREE.MathUtils.clamp(spinX + velX, -1.2, 1.2)
      }
    }
    const onPointerDown = (e) => {
      clickPulse = 1
      if (e.target.closest?.('.hero')) {
        dragging = true
        lastX = e.clientX
        lastY = e.clientY
        velX = 0
        velY = 0
      }
    }
    const onPointerUp = () => {
      dragging = false
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    const onResize = () => {
      const { w, h } = sizeOf()
      if (w <= 0 || h <= 0) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    io.observe(mount)

    const clock = new THREE.Clock()
    let raf
    let scroll = 0
    let elapsed = 0
    const poke = new THREE.Vector3()

    // Frame-rate-independent smoothing helpers.
    // damp() glides a value toward a target at a rate `lambda` (higher = snappier);
    // decay() scales a value's per-frame falloff to real time. Both stay
    // buttery whether the display runs at 60Hz or 120Hz.
    const damp = THREE.MathUtils.damp
    const decay = (rate, dt) => Math.exp(-rate * dt)

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      // cap dt so returning from a background tab doesn't jump the animation
      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt
      const t = elapsed

      // gentle cursor glide (lambda 3.4 → smoother, more gliding follow)
      curN.x = damp(curN.x, targetN.x, 3.4, dt)
      curN.y = damp(curN.y, targetN.y, 3.4, dt)
      moveImpulse *= decay(3.1, dt)
      clickPulse *= decay(3.7, dt)

      if (!dragging) {
        spinY += velY * dt * 60
        spinX = THREE.MathUtils.clamp(spinX + velX * dt * 60, -1.2, 1.2)
        velY *= decay(3.1, dt)
        velX *= decay(3.1, dt)
      }

      const scTarget = Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1)
      scroll = damp(scroll, scTarget, 5, dt)

      uniforms.uTime.value = reduceMotion ? 0 : t
      // ease amplitude toward its target too, so cursor-driven swells breathe in
      uniforms.uAmp.value = damp(uniforms.uAmp.value, 0.34 + moveImpulse * 0.08, 6, dt)
      uniforms.uPulse.value = reduceMotion ? 0 : clickPulse
      // cursor direction in view space; z carries the strength
      poke.set(curN.x * 0.8, curN.y * 0.8, 0.6).normalize()
      uniforms.uPoke.value.set(poke.x, poke.y, moveImpulse)

      const idleY = reduceMotion ? 0 : t * 0.12
      group.rotation.y = idleY + curN.x * 0.3 + spinY + scroll * 1.6
      group.rotation.x = curN.y * -0.22 + spinX + scroll * 0.4
      group.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.15) * 0.06

      const bob = reduceMotion ? 0 : Math.sin(t * 0.8) * 0.08
      group.position.y = bob - scroll * 1.1
      group.scale.setScalar(SCALE * (1 + clickPulse * 0.04) * (1 - scroll * 0.14))

      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      io.disconnect()
      themeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
