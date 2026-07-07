import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import './Scene3D.css'

/* -------------------------------------------------------------------------
   Scene3D — a realistic liquid holo-chrome blob (imperative three.js).

   A high-resolution sphere is displaced on the CPU every frame with layered
   Perlin noise and its normals are recomputed, giving buttery-smooth,
   physically-plausible shading — studio reflections (RoomEnvironment IBL)
   over polished metal with a thin-film iridescent sheen. Four liquid
   droplets orbit the parent blob.

   Interaction: the surface bulges toward the cursor, click sends a ripple
   across the surface, drag spins the whole composition with inertia, and
   the blob sinks/shrinks with scroll as the hero exits. Theme-aware.
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

    // Custom gradient studio environment: a brand-coloured dome plus white
    // softboxes and cyan/violet side panels. This is what the chrome
    // reflects — it sells both the realism and the palette.
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
            // thin bright horizon line for a crisp reflected edge
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
    addPanel(new THREE.Color(6, 6, 6), new THREE.Vector3(0, 9, 2), 8, 3) // overhead white softbox
    addPanel(new THREE.Color(0.4, 3.2, 5.0), new THREE.Vector3(8, 1, 3), 5, 2.4) // cyan right
    addPanel(new THREE.Color(3.6, 1.6, 6.0), new THREE.Vector3(-8, 0, -2), 5, 2.4) // violet left
    addPanel(new THREE.Color(4.0, 1.2, 2.6), new THREE.Vector3(0, -3, -8), 4, 1.6) // pink back-low
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(envScene, 0.06)
    scene.environment = envRT.texture
    envScene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })

    // brand-coloured accent lights for tinted specular highlights + white rim
    const amb = new THREE.AmbientLight(0xffffff, 0.3)
    const l1 = new THREE.PointLight(0x7c5cff, 30, 25)
    l1.position.set(-4, 2.5, 4)
    const l2 = new THREE.PointLight(0x2dd4ff, 26, 25)
    l2.position.set(4, -1.5, 3)
    const l3 = new THREE.PointLight(0xf472b6, 20, 25)
    l3.position.set(0, 3.5, -3)
    const rim = new THREE.PointLight(0xffffff, 24, 20)
    rim.position.set(0, 1.5, -4)
    scene.add(amb, l1, l2, l3, rim)

    const isMobile = window.innerWidth < 720
    const SCALE = isMobile ? 0.9 : 1.05
    const group = new THREE.Group()
    group.scale.setScalar(SCALE)
    scene.add(group)

    // ---- liquid holo-chrome material (shared with the droplets) ----
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.15,
      iridescence: 1,
      iridescenceIOR: 1.32,
      clearcoat: 0.5,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.3,
    })

    // ---- the blob: high-res sphere, morphed on the CPU each frame ----
    // IcosahedronGeometry ships non-indexed (duplicated verts → flat facets),
    // so weld it with mergeVertices to get shared verts and SMOOTH normals.
    const R = 1.45
    const rawGeo = new THREE.IcosahedronGeometry(R, isMobile ? 4 : 5)
    const geometry = mergeVertices(rawGeo)
    rawGeo.dispose()
    const posAttr = geometry.attributes.position
    const count = posAttr.count
    // precompute the unit direction of every vertex once
    const dirs = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)
      const len = Math.hypot(x, y, z) || 1
      dirs[i * 3] = x / len
      dirs[i * 3 + 1] = y / len
      dirs[i * 3 + 2] = z / len
    }
    const perlin = new ImprovedNoise()
    const blob = new THREE.Mesh(geometry, material)
    group.add(blob)

    const morph = (t, poke, pulse) => {
      const f1 = 1.35
      const f2 = 3.1
      const tA = t * 0.22
      const tB = t * 0.16
      const arr = posAttr.array
      for (let i = 0; i < count; i++) {
        const dx = dirs[i * 3]
        const dy = dirs[i * 3 + 1]
        const dz = dirs[i * 3 + 2]
        const n1 = perlin.noise(dx * f1 + tA, dy * f1 + tA * 0.8, dz * f1 - tA * 0.6)
        const n2 = perlin.noise(dx * f2 - tB, dy * f2 + tB, dz * f2 + tB * 0.5)
        // alignment with the cursor direction → interactive bulge
        const m = dx * poke.x + dy * poke.y + dz * poke.z
        const bulge = poke.amp * Math.max(0, m) ** 3
        // click ripple travelling across the surface
        const ripple = pulse * 0.07 * Math.sin(m * 9 - t * 14)
        const r = R * (1 + 0.105 * n1 + 0.05 * n2 + bulge + ripple)
        arr[i * 3] = dx * r
        arr[i * 3 + 1] = dy * r
        arr[i * 3 + 2] = dz * r
      }
      posAttr.needsUpdate = true
      geometry.computeVertexNormals()
    }
    morph(0, { x: 0, y: 0, z: 1, amp: 0 }, 0)

    // ---- orbiting liquid droplets ----
    const dropGeo = new THREE.SphereGeometry(1, 48, 48)
    const droplets = []
    const DROP_COUNT = isMobile ? 3 : 4
    for (let i = 0; i < DROP_COUNT; i++) {
      const pivot = new THREE.Object3D()
      pivot.rotation.set(Math.random() * 1.4 - 0.7, Math.random() * Math.PI * 2, Math.random() * 1.0 - 0.5)
      const m = new THREE.Mesh(dropGeo, material)
      const r = 2.0 + Math.random() * 0.7
      m.position.set(r, 0, 0)
      m.scale.setScalar(0.09 + Math.random() * 0.09)
      pivot.add(m)
      group.add(pivot)
      droplets.push({ pivot, mesh: m, speed: (0.14 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1), base: m.scale.x })
    }

    // ---- theme handling ----
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      renderer.toneMappingExposure = dark ? 1.05 : 0.92
      material.color.set(dark ? '#ffffff' : '#e6e9f2')
      material.roughness = dark ? 0.09 : 0.13
      material.envMapIntensity = dark ? 1.15 : 0.95
      amb.intensity = dark ? 0.15 : 0.25
      l1.intensity = dark ? 30 : 24
      l2.intensity = dark ? 26 : 20
      l3.intensity = dark ? 20 : 15
      rim.intensity = dark ? 28 : 14
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // ---- interaction: cursor bulge + drag-to-spin with inertia ----
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
      moveImpulse = Math.min(moveImpulse + 0.25, 1)
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
    const poke = new THREE.Vector3(0, 0, 1)

    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return

      const t = clock.getElapsedTime()

      curN.x += (targetN.x - curN.x) * 0.07
      curN.y += (targetN.y - curN.y) * 0.07
      moveImpulse *= 0.94
      clickPulse *= 0.93

      if (!dragging) {
        spinY += velY
        spinX = THREE.MathUtils.clamp(spinX + velX, -0.9, 0.9)
        velY *= 0.95
        velX *= 0.95
      }

      const scTarget = Math.min(Math.max(window.scrollY / (window.innerHeight || 1), 0), 1)
      scroll += (scTarget - scroll) * 0.08

      // liquid morph — bulge toward the cursor in view space
      if (!reduceMotion) {
        poke.set(curN.x * 0.9, curN.y * 0.9, 0.55).normalize()
        morph(t, { x: poke.x, y: poke.y, z: poke.z, amp: 0.16 * moveImpulse + 0.05 }, clickPulse)
      }

      // orientation: slow idle turn + cursor parallax + drag + scroll
      const idle = reduceMotion ? 0 : t * 0.1
      group.rotation.y = idle + curN.x * 0.3 + spinY + scroll * 0.6
      group.rotation.x = curN.y * -0.22 + spinX + scroll * 0.15

      // bob + breathe + click swell + scroll sink/shrink
      const bob = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.1
      group.position.y = bob - scroll * 1.1
      const breathe = reduceMotion ? 1 : 1 + Math.sin(t * 0.7) * 0.01
      group.scale.setScalar(SCALE * breathe * (1 + clickPulse * 0.05) * (1 - scroll * 0.12))

      if (!reduceMotion) {
        for (const d of droplets) {
          d.pivot.rotation.y += d.speed * 0.014
          const squish = 1 + Math.sin(t * 2.2 + d.speed * 40) * 0.12
          d.mesh.scale.set(d.base * squish, d.base / squish, d.base * squish)
        }
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
      dropGeo.dispose()
      material.dispose()
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="scene3d" ref={mountRef} aria-hidden="true" />
}
