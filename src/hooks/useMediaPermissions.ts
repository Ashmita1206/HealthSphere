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
    let active = true;
    let removeListeners = () => {};

    const checkPermissions = async () => {
      try {
        const micStatus = await navigator.permissions.query({ name: "microphone" as any });
        const cameraStatus = await navigator.permissions.query({ name: "camera" as any });
        if (!active) return;

        setMicPermission(micStatus.state as PermissionStatus);
        setCameraPermission(cameraStatus.state as PermissionStatus);

        const handleMicChange = () => {
          setMicPermission(micStatus.state as PermissionStatus);
        };
        const handleCameraChange = () => {
          setCameraPermission(cameraStatus.state as PermissionStatus);
        };

        micStatus.addEventListener("change", handleMicChange);
        cameraStatus.addEventListener("change", handleCameraChange);
        removeListeners = () => {
          micStatus.removeEventListener("change", handleMicChange);
          cameraStatus.removeEventListener("change", handleCameraChange);
        };
      } catch {
        if (active) {
          setMicPermission("unknown");
          setCameraPermission("unknown");
        }
      }
    };

    void checkPermissions();

    return () => {
      active = false;
      removeListeners();
    };
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
        setMicPermission("unknown");
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
        setCameraPermission("unknown");
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
