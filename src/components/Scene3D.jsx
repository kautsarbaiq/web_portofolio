import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a refractive glass crystal (imperative three.js).
   A faceted icosahedron rendered with MeshPhysicalMaterial transmission +
   iridescence, so it behaves like real frosted glass: it refracts the
   environment, throws coloured highlights, and shifts hue with view angle.
   The surface gently morphs (vertex noise via onBeforeCompile), the whole
   gem bobs + spins, follows the cursor, and pulses on click.
   Theme-aware: lighting/exposure adapt to light vs dark.
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

    // environment for reflections / refraction
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture

    // coloured lights for chromatic highlights
    const amb = new THREE.AmbientLight(0xffffff, 0.35)
    const l1 = new THREE.PointLight(0x7c5cff, 40, 25)
    l1.position.set(-4, 2.5, 4)
    const l2 = new THREE.PointLight(0x2dd4ff, 36, 25)
    l2.position.set(4, -1.5, 3)
    const l3 = new THREE.PointLight(0xf472b6, 30, 25)
    l3.position.set(0, 3.5, -3)
    scene.add(amb, l1, l2, l3)

    // the crystal
    const SCALE = window.innerWidth < 720 ? 1.15 : 1.4
    const geometry = new THREE.IcosahedronGeometry(1.5, 2)
    const material = new THREE.MeshPhysicalMaterial({
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

    // inject a gentle vertex morph (flatShading recomputes normals for us)
    let shaderRef = null
    material.onBeforeCompile = (shader) => {
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
      shaderRef = shader
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.setScalar(SCALE)
    scene.add(mesh)

    // --- theme handling ---
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      renderer.toneMappingExposure = dark ? 1.15 : 0.95
      // light mode: tint the glass body + drop white reflections so it reads on white
      material.transmission = dark ? 1.0 : 0.88
      material.roughness = dark ? 0.16 : 0.22
      material.envMapIntensity = dark ? 0.6 : 0.7
      material.iridescence = dark ? 1.0 : 1.0
      material.attenuationColor.set(dark ? '#7c5cff' : '#6d5efc')
      material.attenuationDistance = dark ? 1.8 : 0.85
      amb.intensity = dark ? 0.18 : 0.28
      l1.intensity = dark ? 70 : 62
      l2.intensity = dark ? 62 : 54
      l3.intensity = dark ? 52 : 46
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // --- interaction ---
    const targetN = { x: 0, y: 0 }
    const curN = { x: 0, y: 0 }
    let moveImpulse = 0
    let clickPulse = 0
    const onPointer = (e) => {
      targetN.x = (e.clientX / window.innerWidth) * 2 - 1
      targetN.y = -((e.clientY / window.innerHeight) * 2 - 1)
      moveImpulse = 1
    }
    const onDown = () => {
      clickPulse = 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown)

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

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      const t = clock.getElapsedTime()

      curN.x += (targetN.x - curN.x) * 0.06
      curN.y += (targetN.y - curN.y) * 0.06
      moveImpulse *= 0.94
      clickPulse *= 0.92

      if (shaderRef && !reduceMotion) {
        shaderRef.uniforms.uTime.value = t
        shaderRef.uniforms.uAmp.value = 0.13 + moveImpulse * 0.12 + clickPulse * 0.3
      }

      // rotation: slow spin + cursor parallax
      mesh.rotation.y = (reduceMotion ? 0 : t * 0.18) + curN.x * 0.8
      mesh.rotation.x = (reduceMotion ? 0 : Math.sin(t * 0.3) * 0.15) + curN.y * -0.6
      mesh.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.2) * 0.08
      // bob + click scale pulse
      mesh.position.y = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.12
      mesh.scale.setScalar(SCALE * (1 + clickPulse * 0.08))

      // drift the coloured lights for moving highlights
      if (!reduceMotion) {
        l1.position.x = Math.cos(t * 0.4) * 4
        l1.position.z = Math.sin(t * 0.4) * 4
        l2.position.y = Math.sin(t * 0.5) * 3
      }

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
      themeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
