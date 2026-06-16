"use client";

import * as THREE from "three";
import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, Lightformer, useGLTF } from "@react-three/drei";

function Tooth() {
  const { scene } = useGLTF("/Tooth.glb");
  const ref = useRef<THREE.Group>(null);

  // Apply the clean white enamel material and work out a scale that fits the view.
  const fitScale = useMemo(() => {
    scene.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#ffffff"), // clean bright white
          roughness: 0.33,
          metalness: 0.0,
          clearcoat: 1, // glossy enamel sheen
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.6,
        });
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return 3.4 / maxDim;
  }, [scene]);

  // Spin the model on its OWN vertical axis (centred), independent of the camera.
  // This stays identical in dev and production, unlike camera auto-rotate.
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref}>
      <Center>
        <primitive object={scene} scale={fitScale} />
      </Center>
    </group>
  );
}

useGLTF.preload("/Tooth.glb");

export default function ToothScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Light source fixed on the LEFT — matches the top-left gold gradient.
          Lights are world-fixed, so the left face stays lit as the tooth rotates. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[-6, 5, 4]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[5, 1, 2]} intensity={0.35} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#e7ce8c" />

      <Suspense fallback={null}>
        <Tooth />

        {/* Reflections weighted to the LEFT (brightest panel on the left) */}
        <Environment resolution={256}>
          <Lightformer form="rect" position={[-5, 2, 3]} scale={[5, 6, 1]} color="#ffffff" intensity={2.0} />
          <Lightformer form="rect" position={[0, 4, 3]} scale={[6, 3, 1]} color="#ffffff" intensity={0.8} />
          <Lightformer form="rect" position={[-4, -1, 2]} scale={[3, 3, 1]} color="#efe2c0" intensity={0.6} />
          <Lightformer form="rect" position={[4, 0, 2]} scale={[2, 4, 1]} color="#ffffff" intensity={0.35} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
