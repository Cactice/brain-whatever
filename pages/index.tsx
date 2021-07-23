import { usePose } from '@hooks/usePose'
import { NormalizedLandmark } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList } from '@mediapipe/pose'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { FC, Suspense, useEffect, useRef } from "react"
import { Bone, Euler, Matrix3, Matrix4, Object3D, Quaternion, SkinnedMesh, Vector2, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"

const Box: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[0.1, 0.1, 0.1]} />
</mesh>

const BoxBlue: FC<JSX.IntrinsicElements['mesh']> = (props) => <mesh {...props}>
  <boxGeometry args={[10, 10, 10]} />
  <meshBasicMaterial color='blue' />
</mesh>

function moveJoint(joint: Bone, frame = 0) {
  joint.rotation.x = Math.random() * 0.14
  joint.rotation.y = Math.random() * 0.14
  joint.rotation.z = Math.random() * 0.14 + Math.sin(frame % 3.14) - 0.5
}

const landmarkToVec3 = (landmark: NormalizedLandmark): Vector3 => new Vector3(landmark.x, -landmark.y, landmark.z)
const blazeposeLeftToMixamoMap = Object.fromEntries(Object.entries({
  11: 'LeftArm',
  // 13: 'LeftForeArm',
  // 15: 'LeftHand',
  // 23: 'LeftUpLeg',
  // 25: 'LeftLeg',
  // 27: 'LeftLeg',
}).map(([blazeposeIndex, mixamoBoneId]) => [blazeposeIndex, `mixamorig${mixamoBoneId}`]))
const blazeposeRightToMixamoMap = Object.fromEntries(Object.entries(blazeposeLeftToMixamoMap).map<[number, string]>(
  ([blazeposeIndex, mixamoBoneId]) => [Number(blazeposeIndex) + 1, mixamoBoneId.replace('Left', 'Right')]))
const blazeposeToMixamoMap = {
  ...blazeposeLeftToMixamoMap,
  // ...blazeposeRightToMixamoMap
}
const reverseDict = (obj: { [e in string]: string }) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
const mixamoToBlazepose: { [e in string]: string | undefined } = { ...reverseDict(blazeposeToMixamoMap), 'LeftShoulder': '11', 'RightShoulder': '12' }

const applyLandmarksToModel =
  (landmarks: NormalizedLandmarkList,
    skeletonNodes: { [e in string]: Bone | undefined }
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
        bone?.getWorldQuaternion(currentAngle)
        // const angleDiff = angle.multiply(currentAngle)
        bone.setRotationFromEuler(angle)
      }
    })
  }
const defaultScale = new Vector3(0.02, 0.02, 0.02)
const defaultCameraVector = new Vector3(0, 0, -30)
const logGraph = (x: number) => {
  const bar = '□□□□□△□□□□□'.split('')
  bar.splice(Math.round(x * 5) + 5, 1, '■')
  console.log(bar.join('') + ' ' + x)
}
const Dancer: FC<{ landmarks?: NormalizedLandmarkList }> = ({ landmarks }) => {
  const texture = useTexture('stacy.jpg')
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf
  const dancer = nodes.Beta_Surface as SkinnedMesh
  const { camera } = useThree()


  // useEffect(() => { applyLandmarksToModel(landmarks, nodes as { [e in string]: Bone }) }, [landmarks])
  useFrame(({ clock }) => {
    Object.entries(blazeposeToMixamoMap).map(([blazeposeIndex, boneName]) => {
      // const landmark = landmarks[Number(blazeposeIndex)]
      const bone = nodes[boneName]
      const sin = Math.sin(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
      const cos = Math.cos(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
      const tan = Math.tan(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
      logGraph(sin)
      const vec3a = new Vector3(1, 0, 0)
      const vec3b = new Vector3(0, cos, -sin)
      const vec3c = new Vector3(0, sin, cos)
      // const vec3c = vec3a.cross(vec3b)
      const vec3d = new Vector3(0, 0, 0)
      const m = new Matrix4();
      m.set(...vec3a.toArray(), 0, ...vec3b.toArray(), 0, ...vec3c.toArray(), 0, ...vec3d.toArray(), 1)
      // const angle = new Euler().setFromRotationMatrix(m)

      bone.setRotationFromMatrix(m)
    })
  })


  return (
    <group dispose={null}>
      {
        'geometry' in dancer ?
          <>
            <group rotation={[Math.PI / 2, 0, Math.PI]} scale={defaultScale}>
              <primitive object={nodes["mixamorigHips"]} />
              <skinnedMesh receiveShadow castShadow geometry={dancer.geometry} skeleton={dancer.skeleton} >
                <meshBasicMaterial map={texture} map-flipY={false} skinning />
              </skinnedMesh>
              <OrbitControls camera={camera} />
            </group>
          </>
          : null
      }
    </group>
  )
}

export default function Pose() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // useEffect(() => {
  //   if (navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices.getUserMedia({ video: true })
  //       .then((stream) => {
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream
  //         }
  //       })
  //       .catch((err0r) => {
  //         console.log("Something went wrong!")
  //         console.log(err0r)
  //       });
  //   }
  // }, [])
  // const landmarks = usePose({ videoRef })


  return <>
    <Canvas style={{ height: '70vh' }}>
      {/* {landmarks?.length && landmarks.map((landmark, i) => {
        const { x, y, z } = landmark
        return <BoxBlue key={i} position={[-x * 100, -y * 100, z * 100]} />
      })} */}
      <Suspense fallback={null}>
        <Dancer />
        {/* {landmarks && <Dancer landmarks={landmarks} />} */}
      </Suspense>
    </Canvas>
    <video autoPlay={true} ref={videoRef} width={300} />
  </>
}
