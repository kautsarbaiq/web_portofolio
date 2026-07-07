import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a polished holo-chrome knot sculpture (imperative three.js).

   A torus-knot "infinity sculpture" in mirror metal with a thin-film
   iridescent sheen, lit by a custom gradient studio environment (white
   softbox + cyan/violet/pink panels through PMREM). Crisp, structured,
   jewellery-like — reads as intentional design from every angle.

   Interaction: slow tumble, cursor parallax, drag-to-spin with inertia,
   click pop, and SCROLL-DRIVEN rotation — the sculpture turns over as the
   page scrolls, then sinks away. Theme-aware and reduced-motion safe.
   ------------------------------------------------------------------------- */

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

    // Custom gradient studio environment — the chrome reflects this.
    const envScene = new THREE.Scene()
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(20, 64, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          cTop: { value: new THREE.Color('#39c8f5') },
          cMid: { value: new THREE.Color('#121024') },
          cBot: { value: new THREE.Color('#6a48f0') },
        },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec3 vP;
          uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cBot;
          void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 col = mix(cBot, cMid, smoothstep(0.0, 0.55, h));
            col = mix(col, cTop, smoothstep(0.6, 1.0, h));
            col += vec3(1.0, 0.85, 1.0) * 0.25 * smoothstep(0.03, 0.0, abs(vP.y - 0.02));
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    )
    envScene.add(dome)
    const addPanel = (color, pos, w, h) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color }))
      p.position.copy(pos)
      p.lookAt(0, 0, 0)
      envScene.add(p)
    }
    addPanel(new THREE.Color(6, 6, 6), new THREE.Vector3(0, 9, 2), 8, 3)
    addPanel(new THREE.Color(0.4, 3.2, 5.0), new THREE.Vector3(8, 1, 3), 5, 2.4)
    addPanel(new THREE.Color(3.6, 1.6, 6.0), new THREE.Vector3(-8, 0, -2), 5, 2.4)
    addPanel(new THREE.Color(4.0, 1.2, 2.6), new THREE.Vector3(0, -3, -8), 4, 1.6)
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(envScene, 0.06)
    scene.environment = envRT.texture
    envScene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })

    // accent lights for tinted speculars + white rim
    const amb = new THREE.AmbientLight(0xffffff, 0.2)
    const l1 = new THREE.PointLight(0x7c5cff, 26, 25)
    l1.position.set(-4, 2.5, 4)
    const l2 = new THREE.PointLight(0x2dd4ff, 22, 25)
    l2.position.set(4, -1.5, 3)
    const l3 = new THREE.PointLight(0xf472b6, 16, 25)
    l3.position.set(0, 3.5, -3)
    const rim = new THREE.PointLight(0xffffff, 24, 20)
    rim.position.set(0, 1.5, -4)
    scene.add(amb, l1, l2, l3, rim)

    const isMobile = window.innerWidth < 720
    const SCALE = isMobile ? 0.78 : 1.0
    const group = new THREE.Group()
    group.scale.setScalar(SCALE)
    scene.add(group)

    // ---- the sculpture: a smooth interlocking torus knot ----
    const geometry = new THREE.TorusKnotGeometry(0.92, 0.3, 512, 96)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.08,
      iridescence: 1,
      iridescenceIOR: 1.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.15,
    })
    const knot = new THREE.Mesh(geometry, material)
    group.add(knot)

    // ---- theme handling ----
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      renderer.toneMappingExposure = dark ? 1.05 : 0.92
      material.color.set(dark ? '#ffffff' : '#e6e9f2')
      material.roughness = dark ? 0.07 : 0.11
      material.envMapIntensity = dark ? 1.2 : 0.95
      amb.intensity = dark ? 0.15 : 0.25
      l1.intensity = dark ? 26 : 20
      l2.intensity = dark ? 22 : 17
      l3.intensity = dark ? 16 : 12
      rim.intensity = dark ? 26 : 13
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // ---- interaction ----
    const targetN = { x: 0, y: 0 }
    const curN = { x: 0, y: 0 }
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

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      const t = clock.getElapsedTime()

      curN.x += (targetN.x - curN.x) * 0.07
      curN.y += (targetN.y - curN.y) * 0.07
      clickPulse *= 0.93

      if (!dragging) {
        spinY += velY
        spinX = THREE.MathUtils.clamp(spinX + velX, -1.2, 1.2)
        velY *= 0.95
        velX *= 0.95
      }

      const scTarget = Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1)
      scroll += (scTarget - scroll) * 0.08

      // orientation: slow tumble + cursor parallax + drag + SCROLL rotation
      const idleY = reduceMotion ? 0 : t * 0.16
      const idleX = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.25
      group.rotation.y = idleY + curN.x * 0.35 + spinY + scroll * 2.2
      group.rotation.x = idleX + curN.y * -0.28 + spinX + scroll * 0.8
      group.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.18) * 0.1

      // drift toward the cursor + bob + click pop + scroll sink/shrink
      group.position.x = curN.x * 0.18
      const bob = reduceMotion ? 0 : Math.sin(t * 0.8) * 0.1
      group.position.y = bob + curN.y * 0.12 - scroll * 1.2
      const breathe = reduceMotion ? 1 : 1 + Math.sin(t * 0.7) * 0.008
      group.scale.setScalar(SCALE * breathe * (1 + clickPulse * 0.06) * (1 - scroll * 0.15))

      if (!reduceMotion) {
        // drifting lights keep the reflections alive
        l1.position.x = Math.cos(t * 0.35) * 4
        l1.position.z = Math.sin(t * 0.35) * 4
        l2.position.y = Math.sin(t * 0.45) * 3
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
