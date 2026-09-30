import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  FiTrendingUp,
  FiUsers,
  FiGlobe,
  FiRotateCw,
  FiImage,
} from "react-icons/fi";
import { FaAward } from "react-icons/fa";
import heroIllustration from "../../assets/job-search-hero.jpg";

export default function Hero3DVisual() {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState("illustration"); // "illustration" | "globe"
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeHub, setActiveHub] = useState("Tokyo");

  // Three.js 3D Globe Scene (active when viewMode === "globe")
  useEffect(() => {
    if (viewMode !== "globe") return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 7.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Main 3D World Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Core Atmospheric Glow Sphere
    const atmosphereGeo = new THREE.SphereGeometry(2.32, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    worldGroup.add(atmosphere);

    // Inner Dark Solid Globe
    const coreGeo = new THREE.SphereGeometry(1.98, 48, 48);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0b112c,
      roughness: 0.85,
      metalness: 0.15,
      emissive: 0x090e26,
      emissiveIntensity: 0.5,
    });
    const coreGlobe = new THREE.Mesh(coreGeo, coreMat);
    worldGroup.add(coreGlobe);

    // 3D Hexagonal / Icosahedron Geodesic Lattice
    const latticeGeo = new THREE.IcosahedronGeometry(2.02, 2);
    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x4f6bff,
      wireframe: true,
      wireframeLinewidth: 1.8,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.45,
    });
    const lattice = new THREE.Mesh(latticeGeo, latticeMat);
    worldGroup.add(lattice);

    // Latitudinal Coordinate Ring
    const ringGeo = new THREE.TorusGeometry(2.03, 0.012, 12, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const latitudeRing = new THREE.Mesh(ringGeo, ringMat);
    latitudeRing.position.y = -0.15;
    latitudeRing.rotation.x = Math.PI / 2;
    worldGroup.add(latitudeRing);

    // Major Global Talent Hub Coordinates
    const hubs = [
      { lat: 35.6762, lng: 139.6503, name: "Tokyo", color: 0x22d3ee },
      { lat: 37.7749, lng: -122.4194, name: "San Francisco", color: 0xa855f7 },
      { lat: 51.5074, lng: -0.1278, name: "London", color: 0x38bdf8 },
      { lat: 12.9716, lng: 77.5946, name: "Bengaluru", color: 0x34d399 },
      { lat: 1.3521, lng: 103.8198, name: "Singapore", color: 0x22d3ee },
      { lat: 40.7128, lng: -74.006, name: "New York", color: 0xc084fc },
      { lat: 52.52, lng: 13.405, name: "Berlin", color: 0x60a5fa },
    ];

    const convertLatLngToVector3 = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Add Glowing Hub Markers & Halos
    const hubMarkers = [];
    const markerGeo = new THREE.SphereGeometry(0.068, 16, 16);
    const pulseRingGeo = new THREE.RingGeometry(0.08, 0.14, 32);

    hubs.forEach((hub) => {
      const pos = convertLatLngToVector3(hub.lat, hub.lng, 2.04);
      const markerMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      worldGroup.add(marker);

      const pulseMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const pulseRing = new THREE.Mesh(pulseRingGeo, pulseMat);
      pulseRing.position.copy(pos);
      pulseRing.lookAt(pos.clone().multiplyScalar(2));
      worldGroup.add(pulseRing);

      hubMarkers.push({ name: hub.name, mesh: marker, pulseRing, pos });
    });

    // 3D Connecting Career Arcs
    const arcConnections = [
      [0, 4],
      [4, 3],
      [3, 2],
      [2, 6],
      [2, 1],
      [1, 5],
      [0, 1],
    ];

    const animatedArcs = [];

    arcConnections.forEach(([fromIdx, toIdx]) => {
      const v1 = convertLatLngToVector3(hubs[fromIdx].lat, hubs[fromIdx].lng, 2.04);
      const v2 = convertLatLngToVector3(hubs[toIdx].lat, hubs[toIdx].lng, 2.04);

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      const altitude = 2.04 + distance * 0.32;
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
      });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      worldGroup.add(curveLine);

      const packetGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      worldGroup.add(packet);

      animatedArcs.push({
        curve,
        packet,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.004,
      });
    });

    // Orbital Satellite Rings
    const orbitRing1Geo = new THREE.TorusGeometry(3.1, 0.02, 16, 120);
    const orbitRing1Mat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.75,
      roughness: 0.25,
    });
    const orbitRing1 = new THREE.Mesh(orbitRing1Geo, orbitRing1Mat);
    orbitRing1.rotation.x = Math.PI * 0.34;
    orbitRing1.rotation.y = -Math.PI * 0.16;
    orbitRing1.rotation.z = Math.PI * 0.12;
    worldGroup.add(orbitRing1);

    const sat1Geo = new THREE.SphereGeometry(0.065, 16, 16);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    sat1.position.set(0.15, 2.7, 0.8);
    worldGroup.add(sat1);

    const orbitRing2Geo = new THREE.TorusGeometry(3.3, 0.018, 16, 120);
    const orbitRing2Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 0.65,
      roughness: 0.3,
    });
    const orbitRing2 = new THREE.Mesh(orbitRing2Geo, orbitRing2Mat);
    orbitRing2.rotation.x = -Math.PI * 0.28;
    orbitRing2.rotation.y = Math.PI * 0.26;
    orbitRing2.rotation.z = -Math.PI * 0.22;
    worldGroup.add(orbitRing2);

    // Surrounding Particle Dust
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 3.6 + Math.random() * 3.5;

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x818cf8, 2.8);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 4.5, 30);
    rimLight.position.set(-6, -3, -3);
    scene.add(rimLight);

    const interactiveLight = new THREE.PointLight(0xa855f7, 2.5, 25);
    interactiveLight.position.set(0, 0, 5);
    scene.add(interactiveLight);

    // Mouse Interaction
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    const baseRotationSpeed = 0.0025;

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetParallaxX = normY * 0.15;
      targetParallaxY = normX * 0.25;

      interactiveLight.position.x = normX * 5;
      interactiveLight.position.y = normY * 5;

      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;

        worldGroup.rotation.y += deltaX * 0.008;
        worldGroup.rotation.x += deltaY * 0.008;

        velocityX = deltaX * 0.008;
        velocityY = deltaY * 0.008;

        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        worldGroup.rotation.y += velocityX + baseRotationSpeed;
        worldGroup.rotation.x += velocityY;

        velocityX *= 0.94;
        velocityY *= 0.94;
      }

      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;
      camera.position.x = currentParallaxY * 1.2;
      camera.position.y = 0.2 + currentParallaxX * 1.0;
      camera.lookAt(0, 0, 0);

      lattice.rotation.y = elapsedTime * 0.08;
      latitudeRing.rotation.z = -elapsedTime * 0.04;
      orbitRing1.rotation.z = elapsedTime * 0.12;
      orbitRing2.rotation.z = -elapsedTime * 0.1;

      const pulseScale = 1 + (Math.sin(elapsedTime * 4) + 1) * 0.35;
      const pulseOpacity = (Math.cos(elapsedTime * 4) + 1) * 0.45;
      hubMarkers.forEach((hub) => {
        hub.pulseRing.scale.set(pulseScale, pulseScale, pulseScale);
        hub.pulseRing.material.opacity = pulseOpacity;
      });

      animatedArcs.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1;
        const pos = arc.curve.getPoint(arc.progress);
        arc.packet.position.copy(pos);
      });

      particles.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      orbitRing1Geo.dispose();
      orbitRing1Mat.dispose();
      orbitRing2Geo.dispose();
      orbitRing2Mat.dispose();
      sat1Geo.dispose();
      sat1Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [viewMode]);

  // Talent hub cycling timer
  useEffect(() => {
    const hubsList = ["Tokyo", "San Francisco", "London", "Bengaluru", "Singapore", "New York", "Berlin"];
    const hubInterval = setInterval(() => {
      setActiveHub((prev) => {
        const idx = hubsList.indexOf(prev);
        const next = hubsList[(idx + 1) % hubsList.length];
        return next;
      });
    }, 3500);

    return () => clearInterval(hubInterval);
  }, []);

  // 3D Perspective Tilt on Mouse Movement
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        setIsHovered(true);
        handleMouseMove(e);
      }}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-full max-w-lg lg:max-w-none transition-transform duration-300 ease-out select-none"
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Outer ambient glow */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-brand/25 via-cyan-400/20 to-indigo-600/20 blur-3xl opacity-80 pointer-events-none transition duration-500" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-b from-[#131d36] via-[#0d162a] to-[#070b18] shadow-[0_25px_80px_-15px_rgba(3,7,18,0.9)] backdrop-blur-xl">
        {/* Subtle Background Stars / Square Dots */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute left-[4%] top-[56%] h-1.5 w-1.5 rounded-[1px] bg-cyan-400/40" />
          <span className="absolute left-[18%] top-[18%] h-1 w-1 rounded-[1px] bg-white/30" />
          <span className="absolute right-[26%] top-[35%] h-1.5 w-1.5 rounded-[1px] bg-indigo-300/35" />
          <span className="absolute right-[9%] top-[27%] h-1 w-1 rounded-[1px] bg-cyan-300/45" />
          <span className="absolute left-[58%] top-[14%] h-1.5 w-1.5 rounded-[1px] bg-white/50" />
          <span className="absolute right-[45%] bottom-[12%] h-1 w-1 rounded-[1px] bg-indigo-400/30" />
        </div>

        {/* View Switcher Pill at Top-Left */}
        <div className="absolute left-4 top-4 sm:left-5 sm:top-5 z-30 flex items-center rounded-full border border-slate-700/60 bg-[#0c1527]/85 p-1 text-xs text-slate-200 backdrop-blur-md shadow-lg select-none">
          <button
            type="button"
            onClick={() => setViewMode("illustration")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-all ${
              viewMode === "illustration"
                ? "bg-brand text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiImage className="text-xs" />
            <span className="text-[11px]">Illustration</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("globe")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-all ${
              viewMode === "globe"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiRotateCw className="text-xs" />
            <span className="text-[11px]">3D Globe</span>
          </button>
        </div>

        {/* Floating Badge 2: Top-Right Verified Hiring Teams Card */}
        <div
          className="absolute right-4 top-4 sm:right-5 sm:top-5 z-30 rounded-2xl bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl flex items-center gap-3 select-none transition-all duration-300 hover:scale-105"
          style={{ transform: `translateZ(50px) ${isHovered ? "translateY(-2px)" : ""}` }}
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#ede9fe] text-[#6366f1]">
            <FiUsers className="text-lg text-[#6366f1]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">HIRING NETWORK</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              Verified Teams <FaAward className="text-amber-400 text-sm inline ml-1" />
            </p>
          </div>
        </div>

        {/* Content Area: Illustration or 3D Globe */}
        {viewMode === "illustration" ? (
          <div className="relative h-[380px] sm:h-[460px] md:h-[500px] w-full flex items-center justify-center p-3 sm:p-5 pt-14 sm:pt-16 pb-12 sm:pb-14">
            <div className="relative h-full w-full overflow-hidden rounded-2xl flex items-center justify-center group">
              <img
                src={heroIllustration}
                alt="Candidate profile matching and recruitment on desktop"
                className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Soft vignette matching app theme */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b18]/60 via-transparent to-transparent" />
            </div>
          </div>
        ) : (
          <div
            ref={mountRef}
            className={`relative h-[380px] sm:h-[460px] md:h-[500px] w-full flex items-center justify-center ${
              isInteracting ? "cursor-grabbing" : "cursor-grab"
            }`}
            title="Drag 3D Globe to Spin"
          />
        )}

        {/* Bottom subtle crescent accent curve */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 h-[3px] w-48 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70 blur-[1px]" />

        {/* Floating Badge 3: Bottom-Left Career Trajectory Card */}
        <div
          className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 z-30 w-[13.5rem] sm:w-[15rem] rounded-2xl border border-cyan-500/25 bg-[#0b1322]/90 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md select-none transition-all duration-300 hover:scale-105"
          style={{ transform: `translateZ(45px) ${isHovered ? "translateY(-3px)" : ""}` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[#0c2738] border border-cyan-500/30 text-cyan-400">
              <FiTrendingUp className="text-lg sm:text-xl text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Career Trajectory</p>
              <p className="font-mono text-xs sm:text-sm md:text-base font-bold text-white flex items-center gap-2">
                +24% Momentum
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Talent Hub:</span>
            <span className="font-mono font-bold text-cyan-400">{activeHub}</span>
          </div>
        </div>

        {/* Floating Badge 4: Bottom-Right Live Opportunities Pill */}
        <div
          className="absolute right-4 bottom-4 sm:right-5 sm:bottom-5 z-30 flex items-center gap-2 rounded-full border border-slate-700/60 bg-[#0c1527]/85 px-3.5 py-1.5 text-xs text-slate-200 backdrop-blur-md shadow-lg select-none transition-transform duration-300"
          style={{ transform: `translateZ(35px) ${isHovered ? "translateY(-1px)" : ""}` }}
        >
          <FiGlobe className="text-xs text-[#818cf8]" />
          <span className="text-[11px] sm:text-xs text-slate-200 font-medium">7 Global Career Arcs Live</span>
        </div>
      </div>
    </div>
  );
}
