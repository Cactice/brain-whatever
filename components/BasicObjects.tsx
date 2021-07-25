import { FC, ReactNode } from "react"

export const Box: FC<{ props: JSX.IntrinsicElements['mesh'], color: string }> = ({ props, color }) => <mesh {...props} >
  <boxGeometry args={[0.1, 0.1, 0.1]} />
  <meshBasicMaterial color={color} />
</mesh>

export const Cone: FC<{ props: JSX.IntrinsicElements['mesh'], color: string }> = ({ props, color }) => <mesh {...props} >
  <coneGeometry args={[0.1, 0.4]} />
  <meshBasicMaterial color={color} />
</mesh>
