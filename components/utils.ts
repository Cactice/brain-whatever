import { NormalizedLandmark } from '@mediapipe/drawing_utils';
import { Bone, Vector3 } from 'three';
export const landmarkToVec3 = (landmark: NormalizedLandmark): Vector3 =>
  new Vector3(landmark.x, -landmark.y, landmark.z);
export const blazeposeLeftNameToMixamoMap = {
  11: 'LeftArm',
  13: 'LeftForeArm',
  15: 'LeftHand',
  // 23: 'LeftUpLeg',
  // 25: 'LeftLeg',
  // 27: 'LeftLeg',
} as const;
export const blazeposeLeftToMixamoMap = Object.fromEntries(
  Object.entries(blazeposeLeftNameToMixamoMap).map(
    ([blazeposeIndex, mixamoBoneId]) => [
      blazeposeIndex,
      `mixamorig${mixamoBoneId}`,
    ]
  )
);
export const blazeposeRightToMixamoMap = Object.fromEntries(
  Object.entries(blazeposeLeftToMixamoMap).map<[number, string]>(
    ([blazeposeIndex, mixamoBoneId]) => [
      Number(blazeposeIndex) + 1,
      mixamoBoneId.replace('Left', 'Right'),
    ]
  )
);
export const blazeposeToMixamoMap = {
  ...blazeposeLeftToMixamoMap,
  // ...blazeposeRightToMixamoMap
};
export const reverseDict = (obj: { [e in string]: string }) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
export const mixamoToBlazepose: { [e in string]: string | undefined } = {
  ...reverseDict(blazeposeToMixamoMap),
  LeftShoulder: '11',
  RightShoulder: '12',
};
export type SkeletonNodes = { [e in string]: Bone | undefined };

export const logGraph = (x: number) => {
  const bar = '□□□□□△□□□□□'.split('');
  const clampped = Math.min(Math.max(x, -1), 1);
  bar.splice(Math.round(clampped * 5 + 5), 1, '■');
  console.log(bar.join('') + x);
};
