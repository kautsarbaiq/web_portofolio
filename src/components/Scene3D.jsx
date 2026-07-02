import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a living glass-crystal composition (imperative three.js).

   • Shell: faceted icosahedron with MeshPhysicalMaterial transmission +
     iridescence and a gentle vertex-noise morph (onBeforeCompile).
   • Nucleus: a fresnel-glow energy core INSIDE the glass, visible through
     refraction, softly pulsing and counter-rotating.
   • Rings: two thin precessing rings around the gem (refract through it).
   • Shards: small iridescent fragments orbiting on tilted pivots.
   • Dust: ~140 twinkling sparkle points in a shell around the crystal.
   • Interaction: cursor parallax, DRAG to spin with inertia, click pulse
     (morph spike + nucleus flash), scroll parallax as the hero exits.
   Theme-aware (light/dark) via a MutationObserver on data-theme.
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

const NUCLEUS_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const NUCLEUS_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIntensity;
uniform float uPulse;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec3 vN;
varying vec3 vV;
void main(){
  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  vec3 col = mix(uColA, uColB, fres);
  float breathe = 0.86 + 0.14 * sin(uTime * 1.4);
  col *= uIntensity * breathe * (1.0 + uPulse * 1.6);
  gl_FragColor = vec4(col, 1.0);
}
`

const DUST_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
attribute float aScale;
varying float vTw;
void main(){
  vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 43.0));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * uPixelRatio * (26.0 / -mv.z);
}
`

const DUST_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
varying float vTw;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(uColor + soft * 0.25, soft * vTw * uAlpha);
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, init.w / init.h, 0.1, 100)
    camera.position.set(0, 0, 6)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture

    // lights — coloured for chromatic facet highlights + a white rim
    const amb = new THREE.AmbientLight(0xffffff, 0.35)
    const l1 = new THREE.PointLight(0x7c5cff, 40, 25)
    l1.position.set(-4, 2.5, 4)
    const l2 = new THREE.PointLight(0x2dd4ff, 36, 25)
    l2.position.set(4, -1.5, 3)
    const l3 = new THREE.PointLight(0xf472b6, 30, 25)
    l3.position.set(0, 3.5, -3)
    const rim = new THREE.PointLight(0xffffff, 20, 20)
    rim.position.set(0, 1.5, -4)
    scene.add(amb, l1, l2, l3, rim)

    const isMobile = window.innerWidth < 720
    const SCALE = isMobile ? 0.95 : 1.15
    const group = new THREE.Group()
    group.scale.setScalar(SCALE)
    scene.add(group)

    // ---- shell: refractive faceted glass ----
    const shellGeo = new THREE.IcosahedronGeometry(1.5, 2)
    const shellMat = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 1.6,
      roughness: 0.16,
      ior: 1.45,
      iridescence: 1,
      iridescenceIOR: 1.34,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.22,
      color: 0xffffff,
      attenuationColor: new THREE.Color('#bcd0ff'),
      attenuationDistance: 2.2,
      envMapIntensity: 1.2,
      flatShading: true,
    })
    let shellShader = null
    shellMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uAmp = { value: 0.14 }
      shader.vertexShader =
        SIMPLEX +
        '\nuniform float uTime;\nuniform float uAmp;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vec3 dir = normalize(position);
           float nA = snoise(dir * 1.7 + vec3(uTime * 0.4));
           float nB = snoise(dir * 3.2 - vec3(uTime * 0.3));
           transformed += normalize(objectNormal) * (nA * 0.7 + nB * 0.3) * uAmp;`,
        )
      shellShader = shader
    }
    const shell = new THREE.Mesh(shellGeo, shellMat)
    group.add(shell)

    // ---- nucleus: glowing fresnel core inside the glass ----
    const nucleusGeo = new THREE.IcosahedronGeometry(0.62, 3)
    const nucleusUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1.3 },
      uPulse: { value: 0 },
      uColA: { value: new THREE.Color('#4c2fe0') },
      uColB: { value: new THREE.Color('#59e6ff') },
    }
    const nucleusMat = new THREE.ShaderMaterial({
      uniforms: nucleusUniforms,
      vertexShader: NUCLEUS_VERT,
      fragmentShader: NUCLEUS_FRAG,
    })
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat)
    group.add(nucleus)

    // ---- rings: two thin precessing hoops (opaque → refract through glass) ----
    const ringGeo = new THREE.TorusGeometry(1.95, 0.011, 8, 128)
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8b6dff })
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x2dd4ff })
    const ring1 = new THREE.Mesh(ringGeo, ringMat1)
    const ring2 = new THREE.Mesh(ringGeo, ringMat2)
    ring1.rotation.set(Math.PI / 2.4, 0.4, 0)
    ring2.rotation.set(Math.PI / 1.8, -0.5, 0.6)
    group.add(ring1, ring2)

    // ---- shards: small iridescent fragments on tilted orbits ----
    const shardMat = new THREE.MeshPhysicalMaterial({
      metalness: 0.15,
      roughness: 0.12,
      iridescence: 1,
      iridescenceIOR: 1.3,
      clearcoat: 1,
      color: 0xdfe6ff,
      envMapIntensity: 1.4,
    })
    const shardGeo = new THREE.OctahedronGeometry(1, 0)
    const SHARD_COUNT = isMobile ? 5 : 8
    const shards = []
    for (let i = 0; i < SHARD_COUNT; i++) {
      const pivot = new THREE.Object3D()
      pivot.rotation.set(Math.random() * 1.6 - 0.8, Math.random() * Math.PI * 2, Math.random() * 1.2 - 0.6)
      const m = new THREE.Mesh(shardGeo, shardMat)
      const r = 1.85 + Math.random() * 0.9
      m.position.set(r, 0, 0)
      m.scale.setScalar(0.05 + Math.random() * 0.075)
      pivot.add(m)
      group.add(pivot)
      shards.push({ pivot, mesh: m, speed: (0.12 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1) })
    }

    // ---- dust: twinkling sparkle shell ----
    const DUST_COUNT = isMobile ? 90 : 140
    const dustPos = new Float32Array(DUST_COUNT * 3)
    const dustSeed = new Float32Array(DUST_COUNT)
    const dustScale = new Float32Array(DUST_COUNT)
    for (let i = 0; i < DUST_COUNT; i++) {
      const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
      const r = 1.9 + Math.random() * 1.6
      dustPos[i * 3] = dir.x * r
      dustPos[i * 3 + 1] = dir.y * r
      dustPos[i * 3 + 2] = dir.z * r
      dustSeed[i] = Math.random()
      dustScale[i] = 0.5 + Math.random() * 1.4
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1))
    dustGeo.setAttribute('aScale', new THREE.BufferAttribute(dustScale, 1))
    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uColor: { value: new THREE.Color('#7c5cff') },
      uAlpha: { value: 0.55 },
    }
    const dustMat = new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
    })
    const dust = new THREE.Points(dustGeo, dustMat)
    group.add(dust)

    // ---- theme handling ----
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      renderer.toneMappingExposure = dark ? 1.15 : 0.95
      shellMat.transmission = dark ? 1.0 : 0.88
      shellMat.roughness = dark ? 0.16 : 0.22
      shellMat.envMapIntensity = dark ? 0.6 : 0.7
      shellMat.attenuationColor.set(dark ? '#7c5cff' : '#6d5efc')
      shellMat.attenuationDistance = dark ? 1.8 : 0.85
      amb.intensity = dark ? 0.18 : 0.28
      l1.intensity = dark ? 70 : 62
      l2.intensity = dark ? 62 : 54
      l3.intensity = dark ? 52 : 46
      rim.intensity = dark ? 30 : 14
      nucleusUniforms.uIntensity.value = dark ? 1.75 : 1.15
      nucleusUniforms.uColA.value.set(dark ? '#5b2fe0' : '#4c2fd0')
      nucleusUniforms.uColB.value.set(dark ? '#6ff2ff' : '#37c9f0')
      ringMat1.color.set(dark ? '#a48fff' : '#b3a5ff')
      ringMat2.color.set(dark ? '#5fe6ff' : '#8fd8f5')
      dustUniforms.uColor.value.set(dark ? '#9d8bff' : '#6d5efc')
      dustUniforms.uAlpha.value = dark ? 0.85 : 0.5
      dustMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      dustMat.needsUpdate = true
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // ---- interaction: cursor parallax + drag-to-spin with inertia ----
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
      moveImpulse = 1
      if (dragging) {
        const dx = (e.clientX - lastX) / window.innerWidth
        const dy = (e.clientY - lastY) / window.innerHeight
        lastX = e.clientX
        lastY = e.clientY
        velY = dx * 5
        velX = dy * 3
        spinY += velY
        spinX = THREE.MathUtils.clamp(spinX + velX, -0.9, 0.9)
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

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      const t = clock.getElapsedTime()

      curN.x += (targetN.x - curN.x) * 0.06
      curN.y += (targetN.y - curN.y) * 0.06
      moveImpulse *= 0.94
      clickPulse *= 0.92

      // drag inertia decay
      if (!dragging) {
        spinY += velY
        spinX = THREE.MathUtils.clamp(spinX + velX, -0.9, 0.9)
        velY *= 0.95
        velX *= 0.95
      }

      // scroll parallax (0 → 1 across the first viewport)
      const scTarget = Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1)
      scroll += (scTarget - scroll) * 0.08

      if (shellShader && !reduceMotion) {
        shellShader.uniforms.uTime.value = t
        shellShader.uniforms.uAmp.value = 0.13 + moveImpulse * 0.1 + clickPulse * 0.28
      }
      nucleusUniforms.uTime.value = t
      nucleusUniforms.uPulse.value = clickPulse
      dustUniforms.uTime.value = t

      // group orientation: idle spin + cursor parallax + user drag + scroll
      const idle = reduceMotion ? 0 : t * 0.14
      group.rotation.y = idle + curN.x * 0.55 + spinY + scroll * 0.7
      group.rotation.x = (reduceMotion ? 0 : Math.sin(t * 0.3) * 0.12) + curN.y * -0.42 + spinX + scroll * 0.2
      group.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.2) * 0.06

      // bob + click pulse + gentle breathe + scroll shrink/sink
      const bob = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.12
      group.position.y = bob - scroll * 1.1
      const breathe = reduceMotion ? 1 : 1 + Math.sin(t * 0.8) * 0.012
      group.scale.setScalar(SCALE * breathe * (1 + clickPulse * 0.07) * (1 - scroll * 0.12))

      // inner life: shell spins slowly, nucleus counter-rotates
      if (!reduceMotion) {
        shell.rotation.y = t * 0.08
        nucleus.rotation.y = -t * 0.35
        nucleus.rotation.x = t * 0.22
        ring1.rotation.z = t * 0.16
        ring2.rotation.z = -t * 0.12
        for (const s of shards) {
          s.pivot.rotation.y += s.speed * 0.016
          s.mesh.rotation.x += 0.02
          s.mesh.rotation.y += 0.014
        }
        dust.rotation.y = t * 0.03
        // drifting lights for moving facet highlights
        l1.position.x = Math.cos(t * 0.4) * 4
        l1.position.z = Math.sin(t * 0.4) * 4
        l2.position.y = Math.sin(t * 0.5) * 3
      }

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
      shellGeo.dispose()
      shellMat.dispose()
      nucleusGeo.dispose()
      nucleusMat.dispose()
      ringGeo.dispose()
      ringMat1.dispose()
      ringMat2.dispose()
      shardGeo.dispose()
      shardMat.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
