import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import {
  NormalizedLandmarkList,
  Pose,
  POSE_CONNECTIONS,
  ResultsListener,
} from '@mediapipe/pose';
import { RefObject, useEffect, useState } from 'react';

export const usePose = ({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const [landmarkList, setLandmarkList] =
    useState<NormalizedLandmarkList | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const onResults: ResultsListener = (results) => {
      if (results.poseLandmarks) {
        setLandmarkList([...results.poseLandmarks]);
      }
    };
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    pose.onResults(onResults);
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await pose.send({ image: videoElement });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, [videoRef]);
  return landmarkList;
};
