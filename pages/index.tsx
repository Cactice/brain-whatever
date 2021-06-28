import { usePose } from '@hooks/usePose'
import { NormalizedLandmark } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList } from '@mediapipe/pose'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { reverse } from 'dns'
import React, { FC, Suspense, useEffect, useRef } from "react"
import { Bone, Euler, Object3D, SkinnedMesh, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

const Box: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.1, 0.1]} />
</mesh>

const BoxBlue: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.4, 0.1]} />
  <meshStandardMaterial color='orange' />
</mesh>

function moveJoint(joint: Bone, frame = 0) {
  joint.rotation.x = Math.random() * 0.14
  joint.rotation.y = Math.random() * 0.14
  joint.rotation.z = Math.random() * 0.14 + Math.sin(frame % 3.14) - 0.5
}

const landmarkToVec3 = (landmark: NormalizedLandmark): Vector3 => new Vector3(landmark.x, landmark.y, landmark.z)
const blazeposeLeftToMixamoMap = Object.fromEntries(Object.entries({
  11: 'LeftArm',
  13: 'LeftForeArm',
  15: 'LeftHand',
  23: 'LeftUpLeg',
  25: 'LeftLeg',
  27: 'LeftLeg',
}).map(([blazeposeIndex, mixamoBoneId]) => [blazeposeIndex, `mixamorig${mixamoBoneId}`]))
const blazeposeRightToMixamoMap = Object.fromEntries(Object.entries(blazeposeLeftToMixamoMap).map<[number, string]>(
  ([blazeposeIndex, mixamoBoneId]) => [Number(blazeposeIndex) + 1, mixamoBoneId.replace('Left', 'Right')]))
const blazeposeToMixamoMap = { ...blazeposeLeftToMixamoMap, ...blazeposeRightToMixamoMap }
const reverseDict = (obj: { [e in string]: string }) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
const mixamoToBlazepose = reverseDict(blazeposeToMixamoMap)

const applyLandmarksToModel =
  (landmarks: NormalizedLandmarkList,
    skeletonNodes: { [e in string]: Bone | undefined }
  ) => {
    Object.keys(blazeposeToMixamoMap).map((blazeposeIndex) => {
      const landmark = landmarks[Number(blazeposeIndex)]
      // Get parent landmark
      const bone = skeletonNodes[blazeposeToMixamoMap[blazeposeIndex]]
      if (!bone) { debugger }
      const parentLandmark = bone?.parent?.name ? landmarks[Number(mixamoToBlazepose[bone.parent.name])] : { x: 0, y: 0, z: 0 }
      const landmarkVec3 = landmarkToVec3(landmark)
      const parentLandmarkVec3 = landmarkToVec3(parentLandmark ?? { x: 0, y: 0, z: 0 })
      const angle = new Euler().setFromVector3(parentLandmarkVec3.sub(landmarkVec3))
      bone && bone.setRotationFromEuler(angle)
    })
  }

const Dancer: FC<{ landmarks: NormalizedLandmarkList }> = ({ landmarks }) => {
  const texture = useTexture('stacy.jpg')
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf
  const dancer = nodes.Beta_Surface as SkinnedMesh
  const { camera } = useThree()


  useEffect(() => { console.log(nodes); camera.translateX(500) }, [])
  useEffect(() => { applyLandmarksToModel(landmarks, nodes as { [e in string]: Bone }) }, [landmarks])


  return (
    <group dispose={null}>
      {
        'geometry' in dancer ?
          <>
            <group rotation={[Math.PI / 2, Math.PI / 2, 0]}>
              <primitive object={nodes["mixamorigHips"]} />
              <skinnedMesh receiveShadow castShadow geometry={dancer.geometry} skeleton={dancer.skeleton} >
                <meshStandardMaterial map={texture} map-flipY={false} skinning />
              </skinnedMesh>
              <OrbitControls camera={camera} />
            </group>
          </>
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
    <Canvas style={{ height: '70vh' }}>
      {/* {landmarks?.length && landmarks.map((landmark, i) => {
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
            key={i}
            position={point1.add(point2.sub(point1).divideScalar(2))}
            rotation={new Euler().setFromVector3(point2.sub(point1))}
          ></BoxBlue>
        })} */}
      <Suspense fallback={null}>
        {/* <StacySample /> */}
        {landmarks && <Dancer landmarks={landmarks} />}
      </Suspense>
    </Canvas>
    <video autoPlay={true} ref={videoRef} width={300} />
  </>
}
export default pose
