import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type LiveDot = {
  mesh: THREE.Mesh;
  born: number;
  duration: number;
};

const CONTINENTS: number[][][] = [
  [[-168,72],[-145,70],[-130,55],[-124,48],[-126,30],[-117,28],[-108,24],[-98,18],[-90,20],[-83,9],[-78,8],[-80,25],[-97,31],[-105,40],[-118,50],[-130,50],[-145,60]],
  [[-81,12],[-70,10],[-60,5],[-50,-2],[-45,-12],[-50,-23],[-55,-34],[-66,-55],[-73,-48],[-76,-30],[-80,-10]],
  [[-10,72],[15,70],[35,60],[50,50],[42,40],[30,35],[25,20],[15,10],[5,5],[-10,12],[-17,30],[-10,45],[-20,58]],
  [[40,55],[60,60],[85,65],[110,60],[135,55],[160,60],[178,55],[165,45],[145,40],[130,35],[120,20],[105,10],[95,5],[80,8],[70,20],[60,25],[50,35]],
  [[40,35],[50,30],[60,20],[52,5],[45,-12],[38,-25],[25,-35],[15,-34],[12,-20],[18,-5],[25,10]],
  [[112,-10],[130,-12],[145,-18],[153,-28],[145,-40],[130,-43],[115,-30],[112,-18]],
  [[-8,58],[-5,50],[2,50],[1,57]],
  [[-24,66],[-18,60],[-40,65],[-52,75],[-42,82],[-25,80]],
];

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#061a3d");
  ocean.addColorStop(0.5, "#07366a");
  ocean.addColorStop(1, "#03132e");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft ocean glow and subtle bathymetric curves.
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.ellipse(
      canvas.width * (0.12 + (i % 6) * 0.16),
      canvas.height * (0.18 + Math.floor(i / 6) * 0.31),
      180 + i * 11,
      55 + i * 4,
      (i % 4) * 0.25,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = `rgba(45, 174, 255, ${0.025 + (i % 3) * 0.012})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const project = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * canvas.width,
    ((90 - lat) / 180) * canvas.height,
  ];

  CONTINENTS.forEach((polygon, index) => {
    ctx.beginPath();
    polygon.forEach(([lon, lat], i) => {
      const safeLon = Number.isFinite(lon) ? lon : 0;
      const safeLat = Number.isFinite(lat) ? lat : 0;
      const [x, y] = project(safeLon, safeLat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    const land = ctx.createLinearGradient(0, 120, canvas.width, 820);
    land.addColorStop(0, "#0a3972");
    land.addColorStop(0.5, "#0b5aa2");
    land.addColorStop(1, "#082b5d");
    ctx.fillStyle = land;
    ctx.fill();

    ctx.strokeStyle = "rgba(71, 206, 255, .85)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(0, 177, 255, .65)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fine internal map texture.
    ctx.save();
    ctx.clip();
    for (let j = 0; j < 28; j++) {
      const x = (j / 28) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 150, canvas.height);
      ctx.strokeStyle = `rgba(95, 203, 255, ${index % 2 ? 0.035 : 0.05})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  });

  // Subtle latitude/longitude texture on the map.
  ctx.strokeStyle = "rgba(111, 218, 255, .12)";
  ctx.lineWidth = 2;
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = project(0, lat)[1];
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lon = -165; lon <= 180; lon += 15) {
    const x = project(lon, 0)[0];
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function makeGrid(radius: number) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x58dfff,
    transparent: true,
    opacity: 0.2,
  });

  for (let lat = -75; lat <= 75; lat += 15) {
    const points: THREE.Vector3[] = [];
    for (let lon = -180; lon <= 180; lon += 3) {
      points.push(latLonToVector(lat, lon, radius));
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        material
      )
    );
  }

  for (let lon = -180; lon < 180; lon += 20) {
    const points: THREE.Vector3[] = [];
    for (let lat = -90; lat <= 90; lat += 3) {
      points.push(latLonToVector(lat, lon, radius));
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        material
      )
    );
  }
  return group;
}

export default function GlobalMailGlobe() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      mount.classList.add("gm-webgl-unavailable");
      return;
    }

    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "gm-webgl-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.prepend(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6cbfff, 1.25));
    const keyLight = new THREE.DirectionalLight(0x8cecff, 2.4);
    keyLight.position.set(-3, 2, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x087dff, 2.1, 10);
    rimLight.position.set(3, -1, -2);
    scene.add(rimLight);

    const globe = new THREE.Group();
    scene.add(globe);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.48, 96, 96),
      new THREE.MeshPhongMaterial({
        map: createEarthTexture(),
        color: 0x9bcfff,
        specular: 0x55dfff,
        shininess: 28,
      })
    );
    globe.add(earth);
    globe.add(makeGrid(1.493));

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.525, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x1bbcff,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      })
    );
    globe.add(atmosphere);

    // Holographic orbital ellipses around the Earth.
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    [0, 1].forEach((index) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        2.05 + index * 0.12,
        0.58 + index * 0.08,
        0, Math.PI * 2,
        false,
        index ? 0.38 : -0.25
      );
      const points = curve.getPoints(160).map(
        (point) => new THREE.Vector3(point.x, point.y, 0)
      );
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: index ? 0xa45bff : 0x12dfff,
          transparent: true,
          opacity: 0.72,
        })
      );
      line.rotation.x = index ? 0.55 : -0.45;
      line.rotation.y = index ? -0.28 : 0.25;
      orbitGroup.add(line);
    });

    const dotGeometry = new THREE.SphereGeometry(0.026, 12, 12);
    const liveDots: LiveDot[] = [];
    const spawnDot = () => {
      const lat = THREE.MathUtils.randFloat(-58, 72);
      const lon = THREE.MathUtils.randFloat(-180, 180);
      const material = new THREE.MeshBasicMaterial({
        color: 0x087dff,
        transparent: true,
        opacity: 0.95,
      });
      const dot = new THREE.Mesh(dotGeometry, material);
      dot.position.copy(latLonToVector(lat, lon, 1.515));
      globe.add(dot);
      liveDots.push({ mesh: dot, born: performance.now(), duration: 2000 });
    };

    let lastSpawn = 0;
    let frame = 0;
    let previous = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;

      if (!reduceMotion) {
        globe.rotation.y += delta * 0.105;
        globe.rotation.x = Math.sin(now * 0.00012) * 0.035;
        orbitGroup.rotation.z += delta * 0.035;
      }

      if (!reduceMotion && now - lastSpawn > 650) {
        spawnDot();
        lastSpawn = now;
      }

      for (let i = liveDots.length - 1; i >= 0; i--) {
        const item = liveDots[i];
        const age = now - item.born;
        const progress = Math.min(age / item.duration, 1);
        (item.mesh.material as THREE.MeshBasicMaterial).opacity =
          Math.sin(progress * Math.PI) * 0.95;
        const scale = 0.75 + Math.sin(progress * Math.PI) * 0.65;
        item.mesh.scale.setScalar(scale);
        if (age >= item.duration) {
          globe.remove(item.mesh);
          (item.mesh.material as THREE.Material).dispose();
          liveDots.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      liveDots.forEach(({ mesh }) => {
        globe.remove(mesh);
        (mesh.material as THREE.Material).dispose();
      });
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="hero-art global-mail-art" aria-label="Three-dimensional rotating Earth showing the global mail network">
      <div className="gm-back-glow" />
      <div className="gm-orbit-glow gm-orbit-glow-one" />
      <div className="gm-orbit-glow gm-orbit-glow-two" />
      <div className="gm-globe-wrap" ref={mountRef}>
        <div className="gm-mail-core" aria-hidden="true">
          <span className="gm-mail-core-ring" />
          <svg viewBox="0 0 64 64">
            <rect x="8" y="15" width="48" height="34" rx="7" />
            <path d="M10 20l22 17 22-17" />
          </svg>
        </div>
      </div>

      <div className="float-chip globe-chip globe-chip-a">
        <span className="globe-shield">✓</span>
        PRIVATE BY DESIGN
      </div>
      <div className="float-chip globe-chip globe-chip-b">
        <span className="activity-wave">⌁</span>
        GLOBAL MAIL NETWORK
      </div>
      <div className="globe-caption">
        <span className="globe-caption-dot" />
        CONNECTING THE WORLD, ONE INBOX AT A TIME
      </div>
      <div className="spark s1" aria-hidden="true">✦</div>
      <div className="spark s2" aria-hidden="true">✧</div>
    </div>
  );
}
