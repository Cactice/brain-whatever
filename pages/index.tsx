import { usePose } from "@hooks/usePose"
import { FC, useEffect, useRef, useCallback, Suspense, useState } from "react"
import { Canvas, Node, useFrame, useLoader, useThree, } from '@react-three/fiber'
import { POSE_CONNECTIONS } from "@mediapipe/pose"
import StacySample from '../components/StacySample'
import { Bone, Euler, Object3D, Scene, SkinnedMesh, Vector3, AnimationMixer, SkeletonHelper } from "three"
import { useGLTF } from '@react-three/drei'
import React from "react"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

const Box: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.1, 0.1]} />
</mesh>

const BoxBlue: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.4, 0.1]} />
  <meshStandardMaterial color='orange' />
</mesh>
function moveJoint(joint: Bone) {
  joint.rotation.x = Math.random() * 3.14
  joint.rotation.y = Math.random() * 3.14
}

const Dancer = () => {
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf

  const [mixer] = useState(() => new AnimationMixer(nodes.Armature))
  useFrame((state, delta) => mixer.update(delta))

  const { size } = useThree()
  useFrame((state, delta) => {
    moveJoint(nodes.mixamorigNeck as Bone)
    moveJoint(nodes.mixamorigSpine as Bone)
  })

  useEffect(() => {
    console.log(nodes); setInterval(() => {
      if ('skeleton' in nodes.Beta_Surface) {
        const { skeleton } = nodes.Beta_Surface
        console.log(skeleton.bones)
        nodes.mixamorigSpine.scale.x += 1
        moveJoint(skeleton.bones[0])
        moveJoint(skeleton.bones[1])
        moveJoint(skeleton.bones[2])
      }
    }, 3000)
  }, [])


  return (
    <group dispose={null}>
      {
        'geometry' in nodes.Beta_Surface ?
          <skinnedMesh geometry={nodes.Beta_Surface.geometry} skeleton={nodes.Beta_Surface.skeleton} />
          : null
      }
    </group>
  )
}

const pose: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mesh = useRef<THREE.Mesh>(null!)

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err0r) => {
          console.log("Something went wrong!")
          console.log(err0r)
        });
    }
  }, [])
  const landmarks = usePose({ videoRef })


  return <>
    <Canvas style={{ height: '100vh' }}>
      {landmarks?.length && landmarks.map((landmark, i) => {
        const { x, y, z } = landmark
        return <Box key={i} position={[x, -y, z]} />
      })}
      {landmarks?.length && POSE_CONNECTIONS
        .map((connection, i) => {
          const { x: x1, y: y1, z: z1 } = landmarks[connection[0]]
          const { x: x2, y: y2, z: z2 } = landmarks[connection[1]]
          const point1 = new Vector3(x1, -y1, z1)
          const point2 = new Vector3(x2, -y2, z2)
          return <BoxBlue
            position={point1.add(point2.sub(point1).divideScalar(2))}
            rotation={new Euler().setFromVector3(point2.sub(point1))}
          ></BoxBlue>
        })}
      <Suspense fallback={null}>
        {/* <StacySample /> */}
        <Dancer />
      </Suspense>
    </Canvas>
    <video autoPlay={true} ref={videoRef} width={300} />
  </>
}
export default pose
