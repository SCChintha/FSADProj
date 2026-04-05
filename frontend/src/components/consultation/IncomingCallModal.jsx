import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useSocket from "../../hooks/useSocket";

export default function IncomingCallModal() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const audioRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const onIncomingCall = (payload) => {
      setIncomingCall(payload);
      setCountdown(30);
    };

    socket.on("incoming-call", onIncomingCall);
    return () => socket.off("incoming-call", onIncomingCall);
  }, [socket]);

  useEffect(() => {
    if (!incomingCall) {
      return undefined;
    }

    audioRef.current?.play?.().catch(() => {});
    const intervalId = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          socket?.emit("call-missed", { appointmentId: incomingCall.appointmentId });
          setIncomingCall(null);
          return 30;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      audioRef.current?.pause?.();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
  }, [incomingCall, socket]);

  if (!incomingCall) {
    return null;
  }

  return (
    <div className="incoming-call-overlay">
      <audio ref={audioRef} loop src="data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAAAAA=" />
      <div className="incoming-call-card">
        <div className="incoming-ring">{countdown}</div>
        <div className="incoming-avatar">{incomingCall.doctorName?.slice(0, 2)?.toUpperCase() || "DR"}</div>
        <h2>Incoming Video Call</h2>
        <strong>{incomingCall.doctorName}</strong>
        <p>{incomingCall.specialization || "Consulting Doctor"}</p>
        <p>Scheduled consultation · {incomingCall.time}</p>
        <div className="incoming-actions">
          <button
            className="btn secondary-btn"
            onClick={() => {
              socket?.emit("call-reject", { appointmentId: incomingCall.appointmentId, reason: "declined" });
              toast.success("Call declined");
              setIncomingCall(null);
            }}
          >
            Decline
          </button>
          <button
            className="btn"
            onClick={() => {
              socket?.emit("call-accept", { appointmentId: incomingCall.appointmentId });
              setIncomingCall(null);
              navigate(`/consultation/${incomingCall.appointmentId}?role=patient&incoming=true`);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
