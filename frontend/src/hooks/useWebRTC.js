import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function useWebRTC({ socket, currentUser }) {
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const pendingCallRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");

  const cleanupPeer = useCallback((stopTracks = false) => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    setPeerConnection(null);
    setRemoteStream(null);
    if (stopTracks) {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      cameraStreamRef.current = null;
      setLocalStream(null);
    }
    setIsScreenSharing(false);
    setCallStatus("ended");
  }, []);

  const initializeMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      cameraStreamRef.current = stream;
      setLocalStream(stream);
      setIsMuted(!stream.getAudioTracks().some((track) => track.enabled));
      setIsCameraOff(!stream.getVideoTracks().some((track) => track.enabled));
      return stream;
    } catch (error) {
      console.error("Media initialization failed", error);
      toast.error("Camera or microphone access was blocked.");
      return null;
    }
  }, []);

  const ensurePeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const stream = localStreamRef.current || (await initializeMedia());
    if (!stream) {
      return null;
    }

    const connection = new RTCPeerConnection(ICE_SERVERS);
    const inboundStream = new MediaStream();
    setRemoteStream(inboundStream);

    stream.getTracks().forEach((track) => connection.addTrack(track, stream));
    connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => inboundStream.addTrack(track));
      setRemoteStream(inboundStream);
    };
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        const pendingCall = pendingCallRef.current;
        socket?.emit("webrtc-ice-candidate", {
          candidate: event.candidate,
          roomId: pendingCall?.roomId,
          targetId: pendingCall?.targetId,
        });
      }
    };
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "connected") {
        setCallStatus("active");
      }
      if (["failed", "disconnected"].includes(connection.connectionState)) {
        setCallStatus("reconnecting");
      }
      if (connection.connectionState === "closed") {
        setCallStatus("ended");
      }
    };

    peerConnectionRef.current = connection;
    setPeerConnection(connection);
    return connection;
  }, [initializeMedia, socket]);

  const startCall = useCallback(async (roomId, targetId) => {
    const connection = await ensurePeerConnection();
    if (!connection) {
      return;
    }
    pendingCallRef.current = { roomId, targetId };
    setCallStatus("calling");
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    socket?.emit("webrtc-offer", { offer, roomId, targetId, senderId: currentUser?.user_id });
  }, [currentUser?.user_id, ensurePeerConnection, socket]);

  const answerCall = useCallback(async (payload) => {
    const connection = await ensurePeerConnection();
    if (!connection || !payload?.offer) {
      return;
    }
    pendingCallRef.current = { roomId: payload.roomId, targetId: payload.senderId };
    setCallStatus("ringing");
    await connection.setRemoteDescription(new RTCSessionDescription(payload.offer));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    socket?.emit("webrtc-answer", {
      answer,
      roomId: payload.roomId,
      targetId: payload.senderId,
      senderId: currentUser?.user_id,
    });
    setCallStatus("active");
  }, [currentUser?.user_id, ensurePeerConnection, socket]);

  const handleAnswer = useCallback(async (answer) => {
    if (!peerConnectionRef.current || !answer) {
      return;
    }
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setCallStatus("active");
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    if (!peerConnectionRef.current || !candidate) {
      return;
    }
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Failed to add ICE candidate", error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const nextOff = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextOff;
    });
    setIsCameraOff(nextOff);
  }, [isCameraOff]);

  const stopScreenShare = useCallback(async () => {
    if (!cameraStreamRef.current || !peerConnectionRef.current) {
      setIsScreenSharing(false);
      return;
    }

    const cameraTrack = cameraStreamRef.current.getVideoTracks()[0];
    const sender = peerConnectionRef.current.getSenders().find((item) => item.track?.kind === "video");
    if (cameraTrack && sender) {
      await sender.replaceTrack(cameraTrack);
    }
    setLocalStream(cameraStreamRef.current);
    localStreamRef.current = cameraStreamRef.current;
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find((item) => item.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }
      screenTrack.onended = () => stopScreenShare();
      localStreamRef.current = screenStream;
      setLocalStream(screenStream);
      setIsScreenSharing(true);
      socket?.emit("screen-share-started", { roomId: pendingCallRef.current?.roomId });
    } catch (error) {
      console.error("Screen share failed", error);
      toast.error("Unable to start screen sharing.");
    }
  }, [socket, stopScreenShare]);

  const endCall = useCallback(() => {
    socket?.emit("call-end", { roomId: pendingCallRef.current?.roomId, endedBy: currentUser?.user_id });
    cleanupPeer(true);
  }, [cleanupPeer, currentUser?.user_id, socket]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const onOffer = (payload) => answerCall(payload);
    const onAnswer = (payload) => handleAnswer(payload?.answer || payload);
    const onCandidate = (payload) => addIceCandidate(payload?.candidate || payload);
    const onEnded = () => cleanupPeer(true);
    const onRejected = () => {
      toast.error("Call was rejected.");
      cleanupPeer(true);
    };

    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice-candidate", onCandidate);
    socket.on("call-ended", onEnded);
    socket.on("call-rejected", onRejected);

    return () => {
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("webrtc-ice-candidate", onCandidate);
      socket.off("call-ended", onEnded);
      socket.off("call-rejected", onRejected);
    };
  }, [addIceCandidate, answerCall, cleanupPeer, handleAnswer, socket]);

  return {
    localStream,
    remoteStream,
    peerConnection,
    isMuted,
    isCameraOff,
    isScreenSharing,
    callStatus,
    initializeMedia,
    startCall,
    answerCall,
    handleAnswer,
    addIceCandidate,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    endCall,
  };
}
