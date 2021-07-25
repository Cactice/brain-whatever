
import { NormalizedLandmarkList } from '@mediapipe/pose'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import THREE, { Bone, Clock, Euler, Mesh, Object3D, Quaternion, SkinnedMesh, Vector2, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { Box, Cone } from './BasicObjects'
import { blazeposeToMixamoMap, logGraph } from './utils'

const defaultScale = new Vector3(0.02, 0.02, 0.02)
export const useDebugDancer = ({ nodes }: { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }) => {
  const [vec] = useState(() => new Vector3())
  const [q] = useState(() => new Quaternion())
  const [e] = useState(() => new Euler())
  const [coneE, setConeE] = useState<Euler>(new Euler())
  const [coneVec3, setConeVec3] = useState<Vector3>(new Vector3())
  const coneRef = useRef<Mesh>(null)
  const debug = (clock: Clock, mouse: Vector2) => {
    const sin = Math.sin(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
    const cos = Math.cos(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
    const tan = Math.tan(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)

    const direction = vec.set(mouse.x * 10, mouse.y * 10, 0)
    setConeVec3(direction)
    if (coneRef.current) {
      coneRef.current.position.x = direction.x
      coneRef.current.position.y = direction.y
      const directionQ = q.setFromUnitVectors(new Vector3(0, -1, 0), direction.clone().normalize())
      const directionE = e.setFromQuaternion(directionQ)
      coneRef.current.setRotationFromQuaternion(directionQ)
      console.log(coneRef)
    }
    // console.log(clock.getElapsedTime())
    // setConeE(directionE)
    // const vec3a = new Vector3(0, Math.PI / 2, sin)
    // const vec3b = new Vector3(1, 1, 1)
    // const vec3c = new Vector3(1, 1, 1)
    Object.entries(blazeposeToMixamoMap).map(([blazeposeIndex, boneName]) => {
      const bone = nodes[boneName]
      // const vec3c = vec3a.cross(vec3b)
      const vec3d = new Vector3(0, 0, 0)
      // const m = new Matrix4();
      // m.set(...vec3a.toArray(), 0, ...vec3b.toArray(), 0, ...vec3c.toArray(), 0, ...vec3d.toArray(), 1)
      // const angle = new Euler().setFromRotationMatrix(m)
      // const q = new Quaternion(0, sin * 3, sin, cos)
      // const RotationAxis = new Vector3(0, 2, 0).normalize()
      // const RotationAngle = mouse.x * Math.PI * 3 % (Math.PI * 2) - Math.PI
      // const x = RotationAxis.x * Math.sin(RotationAngle / 2)
      // const y = RotationAxis.y * Math.sin(RotationAngle / 2)
      // const z = RotationAxis.z * Math.sin(RotationAngle / 2)
      // const w = Math.cos(RotationAngle / 2)
      // const q = new Quaternion(x, y, z, w)
      const currentAngle = new Quaternion()

      // bone.setRotationFromEuler(new Euler().setFromVector3(direction))
      // if (boneName === 'mixamorigLeftArm' || boneName === 'mixamorigLeftForeArm') {
      // bone.setRotationFromQuaternion(q)
      // }
      // else {
      // bone.parent?.getWorldQuaternion(currentAngle)
      // const targetQ = currentAngle.invert().multiply(directionQ)
      // bone.setRotationFromQuaternion(targetQ)
      // }
    })
  }
  return { debug, coneE, coneVec3, coneRef }
}

export const DancerDebug: FC = () => {
  const texture = useTexture('stacy.jpg')
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf
  const dancer = nodes.Beta_Surface as SkinnedMesh
  const { debug: debugDancer, coneE, coneVec3, coneRef } = useDebugDancer({ nodes })


  useFrame(({ clock, mouse }) => { debugDancer(clock, mouse) })


  return (
    <group dispose={null}>
      {
        'geometry' in dancer ?
          <>
            <Cone props={{ rotation: coneE, position: coneVec3, ref: coneRef }} color={'green'} />
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
