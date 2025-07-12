import { useEffect, useRef } from 'react';

function WebcamCard() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function enableWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    }

    enableWebcam();
  }, []);

  return (
    <div className="bg-gray-200 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-56 object-cover transform -scale-x-100"
      />
    </div>
  );
}

export default WebcamCard;
