import { useState, useCallback, useRef, useEffect } from "react";

export type PermissionStatus = "granted" | "denied" | "prompt" | "unknown";

interface UseMediaPermissionsReturn {
  micPermission: PermissionStatus;
  cameraPermission: PermissionStatus;
  requestMicPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  requestBothPermissions: () => Promise<boolean>;
  stream: MediaStream | null;
  releaseStream: () => void;
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [micPermission, setMicPermission] = useState<PermissionStatus>("prompt");
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>("prompt");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check initial permission status
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const micStatus = await navigator.permissions.query({ name: "microphone" as any });
        setMicPermission(micStatus.state as PermissionStatus);

        const cameraStatus = await navigator.permissions.query({ name: "camera" as any });
        setCameraPermission(cameraStatus.state as PermissionStatus);

        micStatus.addEventListener("change", () => {
          setMicPermission(micStatus.state as PermissionStatus);
        });

        cameraStatus.addEventListener("change", () => {
          setCameraPermission(cameraStatus.state as PermissionStatus);
        });

        return () => {
          micStatus.removeEventListener("change", () => {});
          cameraStatus.removeEventListener("change", () => {});
        };
      } catch (err) {
        console.warn("Permission API not supported:", err);
      }
    };

    checkPermissions();
  }, []);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setMicPermission("granted");
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
      } else if (err.name === "NotFoundError") {
        console.error("No microphone found");
      }
      return false;
    }
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraPermission("granted");
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraPermission("denied");
      } else if (err.name === "NotFoundError") {
        console.error("No camera found");
      }
      return false;
    }
  }, []);

  const requestBothPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setMicPermission("granted");
      setCameraPermission("granted");
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
        setCameraPermission("denied");
      }
      return false;
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      releaseStream();
    };
  }, [releaseStream]);

  return {
    micPermission,
    cameraPermission,
    requestMicPermission,
    requestCameraPermission,
    requestBothPermissions,
    stream,
    releaseStream,
  };
}
