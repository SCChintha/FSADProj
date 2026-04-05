import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiRequest } from "../apiClient";
import { useAuth } from "../AuthContext";
import { normalizeAppointment } from "../liveData";
import useSocket from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";
import useChat from "../hooks/useChat";
import PreCallCheck from "../components/consultation/PreCallCheck";
import VideoCall from "../components/consultation/VideoCall";
import ChatPanel from "../components/consultation/ChatPanel";

function buildSummaryRole(role) {
  return role === "doctor" ? "patient" : "doctor";
}

export default function ConsultationRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token, user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [endedDuration, setEndedDuration] = useState(0);
  const [endingCall, setEndingCall] = useState(false);
  const incoming = searchParams.get("incoming") === "true";
  const requestedRole = searchParams.get("role") || role;

  const { socket, joinRoom, leaveRoom } = useSocket();
  const webrtc = useWebRTC({ socket, currentUser: user });
  const chat = useChat({ appointmentId, socket });

  useEffect(() => {
    if (!appointmentId || !token) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    apiRequest(`/api/appointments/${appointmentId}`, { token })
      .then((data) => {
        if (cancelled) {
          return;
        }
        const normalized = normalizeAppointment(data);
        setAppointment(normalized);
        const allowed = [String(normalized.doctorId), String(normalized.patientId)].includes(String(user?.user_id));
        if (!allowed) {
          toast.error("You cannot access this consultation.");
          navigate(`/${role}`);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message || "Failed to load appointment.");
        navigate(`/${role}`);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentId, navigate, role, token, user?.user_id]);

  useEffect(() => {
    if (!joined || !appointmentId) {
      return undefined;
    }
    joinRoom(`call-${appointmentId}`);
    return () => leaveRoom(`call-${appointmentId}`);
  }, [appointmentId, joinRoom, joined, leaveRoom]);

  const partner = useMemo(() => {
    if (!appointment) {
      return null;
    }
    return requestedRole === "doctor" ? appointment.patient : appointment.doctor;
  }, [appointment, requestedRole]);

  const handleJoin = async (constraints) => {
    const stream = await webrtc.initializeMedia(constraints);
    if (!stream && constraints.audio) {
      return;
    }
    setJoined(true);

    if (requestedRole === "doctor" && !incoming) {
      try {
        const response = await apiRequest("/api/calls/initiate", {
          method: "POST",
          token,
          body: { appointmentId: Number(appointmentId), receiverId: appointment.patientId },
        });
        setActiveRoomId(response.roomId);
        socket?.emit("call-initiate", {
          appointmentId: Number(appointmentId),
          roomId: response.roomId,
          patientId: appointment.patientId,
          doctorName: appointment.doctorName,
          time: `${appointment.date} ${appointment.time}`,
        });
        await webrtc.startCall(response.roomId, appointment.patientId);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to start call.");
      }
    }

    if (requestedRole === "patient" && incoming) {
      try {
        const active = await apiRequest("/api/calls/active", { token });
        setActiveRoomId(active.callSession?.roomId || `call-${appointmentId}`);
        toast.success("Ready to answer incoming call.");
      } catch (error) {
        setActiveRoomId(`call-${appointmentId}`);
      }
    }
  };

  const handleEndCall = async () => {
    webrtc.endCall();
    try {
      setEndingCall(true);
      await apiRequest("/api/calls/end", {
        method: "POST",
        token,
        body: {
          roomId: activeRoomId || `call-${appointmentId}`,
          duration: endedDuration,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to end call cleanly.");
    } finally {
      setActiveRoomId(null);
      setEndingCall(false);
    }
  };

  useEffect(() => {
    if (webrtc.callStatus !== "active") {
      return undefined;
    }
    const intervalId = window.setInterval(() => setEndedDuration((current) => current + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [webrtc.callStatus]);

  useEffect(() => {
    return () => {
      webrtc.endCall();
    };
  }, []);

  if (loading) {
    return <div className="panel"><div className="loading-wrap">Loading consultation room...</div></div>;
  }

  if (!appointment) {
    return null;
  }

  if (!joined) {
    return <PreCallCheck appointment={appointment} onJoin={handleJoin} />;
  }

  return (
    <div className="consultation-room-page">
      <VideoCall
        appointment={appointment}
        localStream={webrtc.localStream}
        remoteStream={webrtc.remoteStream}
        peerConnection={webrtc.peerConnection}
        isCameraOff={webrtc.isCameraOff}
        isMuted={webrtc.isMuted}
        isScreenSharing={webrtc.isScreenSharing}
        callStatus={webrtc.callStatus}
        unreadCount={chat.unreadCount}
        chatOpen={chatOpen}
        onToggleChat={() => {
          setChatOpen((current) => !current);
          if (!chatOpen) {
            chat.markAsRead();
          }
        }}
        onToggleMute={webrtc.toggleMute}
        onToggleCamera={webrtc.toggleCamera}
        onToggleScreenShare={() => (webrtc.isScreenSharing ? webrtc.stopScreenShare() : webrtc.startScreenShare())}
        onEndCall={handleEndCall}
        onAudioOnly={() => {
          if (!webrtc.isCameraOff) {
            webrtc.toggleCamera();
          }
        }}
      />

      <ChatPanel
        open={chatOpen}
        messages={chat.messages}
        typingUsers={chat.typingUsers}
        onClose={() => setChatOpen(false)}
        onSend={chat.sendMessage}
        onSendFile={chat.sendFile}
        onFocus={chat.markAsRead}
        onTyping={chat.sendTyping}
        onBlur={chat.stopTyping}
        mobile={window.innerWidth < 768}
      />

      {webrtc.callStatus === "ended" && (
        <div className="post-call-overlay">
          <div className="post-call-card">
            <h2>{requestedRole === "patient" ? "Call completed" : "Consultation completed"}</h2>
            <p>Duration: {Math.floor(endedDuration / 60)}m {endedDuration % 60}s</p>
            <p>{partner?.name}</p>
            {requestedRole === "doctor" ? (
              <>
                <textarea className="input" rows={4} placeholder="Quick notes" />
                <div className="post-call-actions">
                  <button className="btn secondary-btn" onClick={() => navigate("/doctor")}>Skip</button>
                  <button className="btn" onClick={() => navigate(`/doctor?appointmentId=${appointmentId}`)}>Write Full Prescription</button>
                </div>
              </>
            ) : (
              <div className="post-call-actions">
                <button className="btn secondary-btn" onClick={() => navigate("/patient", { state: { callCompleted: true } })}>Back to Dashboard</button>
                <button className="btn" onClick={() => navigate("/book")}>Book Another Appointment</button>
              </div>
            )}
            {endingCall && <p className="consultation-subtle">Finalizing consultation...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
