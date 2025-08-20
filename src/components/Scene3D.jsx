import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'



const Scene3D = () => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const animationIdRef = useRef(null)
  const [isLoading3D, setIsLoading3D] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Memuat model 3D...')
  const modelsRef = useRef([])

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(10, 8, 15)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2
    controls.minDistance = 5
    controls.maxDistance = 50
    controls.target.set(0, 2, 0)
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    directionalLight.position.set(20, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(2058, 2048)
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)

    scene.add(new THREE.HemisphereLight(0x87CEEB, 0x4ade80, 0.3))

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshLambertMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const loadingManager = new THREE.LoadingManager()

    const loader = new GLTFLoader(loadingManager)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/') // folder decoder di public
    loader.setDRACOLoader(dracoLoader)

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100
      setLoadingProgress(progress)
    }

    loadingManager.onLoad = () => {
      setLoadingText('Model berhasil dimuat!')
      setTimeout(() => setIsLoading3D(false), 500)
    }

    loadingManager.onError = () => {
      setLoadingText('Gagal memuat model. Menggunakan fallback...')
      createFallbackModels(scene)
      setTimeout(() => setIsLoading3D(false), 1000)
    }

    const modelUrl = '/models/sekolah 1.7.glb'
    
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) child.material.envMapIntensity = 0.5
          }
        })
        model.position.set(0, 0, 0)
        model.scale.setScalar(1)
        scene.add(model)
        modelsRef.current.push(model)

        if (gltf.animations?.length) {
          const mixer = new THREE.AnimationMixer(model)
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play())
          model.userData.mixer = mixer
        }
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100
        setLoadingProgress(percentComplete)
        setLoadingText(`Memuat model sekolah... ${Math.round(percentComplete)}%`)
      },
      () => {
        setLoadingText('Gagal memuat model. Menggunakan fallback...')
        createFallbackModels(scene)
        setTimeout(() => setIsLoading3D(false), 1000)
      }
    )

    const createFallbackModels = (scene) => {
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 10),
        new THREE.MeshLambertMaterial({ color: 0xf0f0f0 })
      )
      building.position.set(0, 3, 0)
      building.castShadow = true
      building.receiveShadow = true
      scene.add(building)

      for (let i = 0; i < 6; i++) {
        const x = Math.cos((i / 6) * Math.PI * 2) * 15
        const z = Math.sin((i / 6) * Math.PI * 2) * 15

        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 3),
          new THREE.MeshLambertMaterial({ color: 0x8b4513 })
        )
        trunk.position.set(x, 1.5, z)
        trunk.castShadow = true

        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(2),
          new THREE.MeshLambertMaterial({ color: 0x228b22 })
        )
        leaves.position.set(x, 4, z)
        leaves.castShadow = true

        scene.add(trunk, leaves)
      }
    }

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      modelsRef.current.forEach(model => model.userData.mixer?.update(0.016))
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationIdRef.current)
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)

      scene.traverse((obj) => {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        } else {
          obj.material?.dispose()
        }
      })

      renderer.dispose()
      controls.dispose()
      dracoLoader.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-200">
      {isLoading3D && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-emerald-700 fo   nt-semibold mb-2">{loadingText}</p>
            <div className="w-64 bg-emerald-200 rounded-full h-2 mt-4">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-emerald-600 text-sm mt-2">{Math.round(loadingProgress)}%</p>
          </div>
        </div>
      )}

      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {!isLoading3D && (
        <div className="absolute top-4 right-3 bg-transparent backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="font-bold text-black mb-0"> 3D Model Sekolah Adiwiyata</h3>
        </div>
      )}
    </div>
  )
}

export default Scene3D
