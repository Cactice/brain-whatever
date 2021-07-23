import { blazeposeToMixamoMap, landmarkToVec3, mixamoToBlazepose, SkeletonNodes } from '@components/utils'
import { usePose } from '@hooks/usePose'
import { NormalizedLandmark } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList } from '@mediapipe/pose'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { FC, Suspense, useEffect, useRef, useState } from "react"
import { Bone, Clock, Euler, Matrix3, Matrix4, Object3D, Quaternion, SkinnedMesh, Vector2, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"


const BoxBlue: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.1, 0.1]} />
  <meshBasicMaterial color='blue' />
</mesh>

const BoxRed: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.1, 0.1]} />
  <meshBasicMaterial color='red' />
</mesh>

const applyLandmarksToModel =
  (landmarks: NormalizedLandmarkList,
    skeletonNodes: SkeletonNodes
  ) => {
    Object.entries(blazeposeToMixamoMap).map(([blazeposeIndex, boneName]) => {
      const landmark = landmarks[Number(blazeposeIndex)]
      const bone = skeletonNodes[boneName]
      if (bone) {
        const parentLandmark = bone?.parent?.name ? landmarks[Number(mixamoToBlazepose[bone.parent.name])] : { x: 0, y: 0, z: 0 }
        const landmarkVec3 = landmarkToVec3(landmark)
        const parentLandmarkVec3 = landmarkToVec3(parentLandmark ?? { x: 0, y: 0, z: 0 })
        const angle = new Euler().setFromVector3(parentLandmarkVec3.sub(landmarkVec3))
        const currentAngle = new Quaternion()
        bone.parent?.getWorldQuaternion(currentAngle)
        if (boneName === 'mixamorigLeftForeArm') {
          bone.parent?.getWorldQuaternion(currentAngle)
          bone.setRotationFromQuaternion(currentAngle.invert())
        } else {
          const angleQ = new Quaternion().setFromEuler(angle)
          const angleDiff = currentAngle.multiply(angleQ)
          bone.setRotationFromEuler(new Euler().setFromQuaternion(angleDiff))
        }
      }
    })
  }
const defaultScale = new Vector3(0.02, 0.02, 0.02)

const Dancer: FC<{ landmarks: NormalizedLandmarkList }> = ({ landmarks }) => {
  const texture = useTexture('stacy.jpg')
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf
  const dancer = nodes.Beta_Surface as SkinnedMesh
  const [initialE, setInitialE] = useState<Euler>(new Euler())


  useEffect(() => { applyLandmarksToModel(landmarks, nodes as SkeletonNodes) }, [landmarks])


  return (
    <group dispose={null}>
      {
        'geometry' in dancer ?
          <>
            <BoxBlue rotation={initialE} />
            <group rotation={[Math.PI / 2, 0, Math.PI]} scale={defaultScale}>
              <primitive object={nodes["mixamorigHips"]} />
              <skinnedMesh receiveShadow castShadow geometry={dancer.geometry} skeleton={dancer.skeleton} >
                <meshBasicMaterial map={texture} map-flipY={false} skinning />
              </skinnedMesh>
            </group>
          </>
          : null
      }
    </group>
  )
}

const Camera: FC = () => {
  const { camera } = useThree()
  return <OrbitControls camera={camera} />
}
export default function Pose() {
  const videoRef = useRef<HTMLVideoElement>(null)

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
    <Canvas style={{ height: '70vh' }}>
      {landmarks?.length && landmarks.map((landmark, i) => {
        const { x, y, z } = landmark

        return i !== 11 && i !== 13 ? <BoxBlue key={i} position={[-x, -y, z]} /> : <BoxRed key={i} position={[-x, -y, z]} />
      })}
      <Suspense fallback={null}>
        {/* <Dancer /> */}
        {landmarks && <Dancer landmarks={landmarks} />}
      </Suspense>
      <Camera />
    </Canvas>
    <video autoPlay={true} ref={videoRef} width={300} />
  </>
}
