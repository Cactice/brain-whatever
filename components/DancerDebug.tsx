
import { usePose } from '@hooks/usePose'
import { NormalizedLandmark } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList } from '@mediapipe/pose'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { FC, Suspense, useEffect, useRef, useState } from "react"
import { Bone, Clock, Euler, Matrix3, Matrix4, Object3D, Quaternion, SkinnedMesh, Vector2, Vector3 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { blazeposeToMixamoMap } from './utils'

export const useDebugDancer = () => {
  const gltf = useGLTF('dancer.glb', '/') as GLTF & { nodes: { [e in string]: (Object3D | Bone | SkinnedMesh) } }
  const { nodes } = gltf
  const debug = (clock: Clock) => {
    Object.entries(blazeposeToMixamoMap).map(([blazeposeIndex, boneName]) => {
      const bone = nodes[boneName]
      const sin = Math.sin(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
      const cos = Math.cos(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)
      const tan = Math.tan(clock.getElapsedTime() % (Math.PI * 2) - Math.PI)

      const vec3a = new Vector3(0, Math.PI / 2, sin)
      const vec3b = new Vector3(1, 1, 1)
      const vec3c = new Vector3(1, 1, 1)
      // const vec3c = vec3a.cross(vec3b)
      const vec3d = new Vector3(0, 0, 0)
      // const m = new Matrix4();
      // m.set(...vec3a.toArray(), 0, ...vec3b.toArray(), 0, ...vec3c.toArray(), 0, ...vec3d.toArray(), 1)
      // const angle = new Euler().setFromRotationMatrix(m)
      // const q = new Quaternion(0, sin * 3, sin, cos)
      const RotationAxis = new Vector3(0, 2, 0).normalize()
      const RotationAngle = clock.getElapsedTime() % (Math.PI * 2) - Math.PI
      const x = RotationAxis.x * Math.sin(RotationAngle / 2)
      const y = RotationAxis.y * Math.sin(RotationAngle / 2)
      const z = RotationAxis.z * Math.sin(RotationAngle / 2)
      const w = Math.cos(RotationAngle / 2)
      const q = new Quaternion(x, y, z, w)
      const currentAngle = new Quaternion()

      bone.setRotationFromEuler(new Euler().setFromVector3(vec3a))
      if (boneName === 'mixamorigLeftArm' || boneName === 'mixamorigLeftForeArm') {
        bone.setRotationFromQuaternion(q)
      }
      else {
        bone.parent?.getWorldQuaternion(currentAngle)
        bone.setRotationFromQuaternion(currentAngle)
      }
    })
  }
  return { debug }
}
