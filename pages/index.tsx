import { usePose } from "@hooks/usePoseDebugger"
import { FC, useEffect, useRef } from "react"

const pose: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
  useEffect(() => {
    if (canvasRef.current && videoRef.current) {
      usePose({ canvasElement: canvasRef.current, videoElement: videoRef.current })
    }
  }, [canvasRef, videoRef])

  return <><canvas ref={canvasRef} width={videoRef.current?.width} height={225} />
    <video autoPlay={true} ref={videoRef} width={300} /> </>
}
export default pose
