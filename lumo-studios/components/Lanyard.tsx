
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// Define PascalCase aliases to bypass JSX intrinsic element property errors for custom R3F elements
const MeshLineGeometryTag = 'meshLineGeometry' as any;
const MeshLineMaterialTag = 'meshLineMaterial' as any;
const AmbientLightTag = 'ambientLight' as any;
const SpotLightTag = 'spotLight' as any;
const GroupTag = 'group' as any;
const MeshTag = 'mesh' as any;
const BoxGeometryTag = 'boxGeometry' as any;
const MeshPhysicalMaterialTag = 'meshPhysicalMaterial' as any;
const PlaneGeometryTag = 'planeGeometry' as any;
const MeshBasicMaterialTag = 'meshBasicMaterial' as any;
const MeshStandardMaterialTag = 'meshStandardMaterial' as any;

// Refined sunburst logo texture matching the uploaded image
const LOGO_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="white" stroke-width="28" stroke-linecap="butt">
    ${Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 10) * (Math.PI / 180);
      const innerRadius = 140;
      const outerRadius = 240;
      const x1 = 256 + Math.cos(angle) * innerRadius;
      const y1 = 256 + Math.sin(angle) * innerRadius;
      const x2 = 256 + Math.cos(angle) * outerRadius;
      const y2 = 256 + Math.sin(angle) * outerRadius;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }).join('')}
  </g>
</svg>
`;

const LOGO_DATA_URL = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function Lanyard({
  position = [0, 0, 15],
  gravity = [0, -30, 0],
  fov = 25,
  transparent = true
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        {/* Use PascalCase aliases for lights */}
        <AmbientLightTag intensity={1.5} />
        <SpotLightTag position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <Physics gravity={gravity as any} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment preset="city">
          <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Euler();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2
  };

  const texture = useTexture(LOGO_DATA_URL);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]));
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.2]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2, j3].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      
      const cardBody = card.current;
      ang.copy(cardBody.angvel());
      const currentRot = cardBody.rotation();
      rot.setFromQuaternion(new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w));
      cardBody.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      {/* Use PascalCase aliases for Group and Mesh tags */}
      <GroupTag position={[0, 5, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[1, 1.4, 0.05]} />
          <GroupTag
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* Main Card Body */}
            <MeshTag position={[0, -1.2, 0]}>
              <BoxGeometryTag args={[2.2, 3.2, 0.1]} />
              <MeshPhysicalMaterialTag 
                color="#0a0a0a" 
                roughness={0.1} 
                metalness={0.8} 
                clearcoat={1} 
                clearcoatRoughness={0.1} 
              />
            </MeshTag>
            {/* Logo on Front */}
            <MeshTag position={[0, -1.2, 0.051]}>
              <PlaneGeometryTag args={[1.6, 1.6]} />
              <MeshBasicMaterialTag map={texture} transparent={true} />
            </MeshTag>
            {/* Logo on Back */}
            <MeshTag position={[0, -1.2, -0.051]} rotation-y={Math.PI}>
              <PlaneGeometryTag args={[1.6, 1.6]} />
              <MeshBasicMaterialTag map={texture} transparent={true} />
            </MeshTag>
            {/* Clip part */}
            <MeshTag position={[0, 0.5, 0]}>
              <BoxGeometryTag args={[0.3, 0.3, 0.15]} />
              <MeshStandardMaterialTag color="#888" metalness={1} roughness={0.3} />
            </MeshTag>
          </GroupTag>
        </RigidBody>
      </GroupTag>
      <MeshTag ref={band}>
        {/* Use PascalCase aliases for custom geometries and materials */}
        <MeshLineGeometryTag />
        <MeshLineMaterialTag
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 1000] : [window.innerWidth, window.innerHeight]}
          lineWidth={0.15}
          transparent
          opacity={0.6}
        />
      </MeshTag>
    </>
  );
}
