import { useEffect, useMemo, useRef, useState } from "react";
import CallControls from "./CallControls";

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function AvatarTile({ name }) {
  return <div className="video-avatar">{(name || "VC").slice(0, 2).toUpperCase()}</div>;
}

export default function VideoCall({
  appointment,
  localStream,
  remoteStream,
  peerConnection,
  isCameraOff,
  isMuted,
  isScreenSharing,
  callStatus,
  unreadCount,
  chatOpen,
  onToggleChat,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onAudioOnly,
}) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const mobile = window.innerWidth < 768;

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (callStatus !== "active") {
      return undefined;
    }
    const intervalId = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [callStatus]);

  useEffect(() => {
    if (!peerConnection?.getStats) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      const stats = await peerConnection.getStats();
      let packetsLost = 0;
      let packetsReceived = 0;
      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && !report.isRemote) {
          packetsLost += report.packetsLost || 0;
          packetsReceived += report.packetsReceived || 0;
        }
      });
      const total = packetsLost + packetsReceived;
      const lossRate = total > 0 ? (packetsLost / total) * 100 : 0;
      if (lossRate > 25) {
        setConnectionQuality("poor");
      } else if (lossRate > 10) {
        setConnectionQuality("unstable");
      } else {
        setConnectionQuality("good");
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [peerConnection]);

  const remoteName = useMemo(() => {
    const currentUserId = Number(localStorage.getItem("loggedInUser") ? JSON.parse(localStorage.getItem("loggedInUser")).user_id : null);
    return Number(appointment?.doctor?.id) === currentUserId ? appointment?.patient?.name : appointment?.doctor?.name;
  }, [appointment]);

  return (
    <div className="video-call-shell">
      <div className="video-call-stage">
        {remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        ) : (
          <div className="remote-video placeholder">
            <AvatarTile name={remoteName} />
          </div>
        )}

        {(callStatus === "calling" || callStatus === "ringing" || callStatus === "reconnecting") && (
          <div className="call-overlay-card">
            <div className="loading-wrap">
              {callStatus === "calling" ? `Connecting to ${remoteName}...` : callStatus === "ringing" ? "Joining call..." : "Reconnecting..."}
            </div>
          </div>
        )}

        {connectionQuality !== "good" && (
          <div className={`connection-banner ${connectionQuality}`}>
            {connectionQuality === "poor" ? "Poor connection. Consider switching to audio only." : "Unstable connection"}
          </div>
        )}

        <div className="video-top-bar">
          <div>MediConnect · #{appointment?.id}</div>
          <div>{formatDuration(elapsed)}</div>
          <div className="video-top-meta">
            <span>{remoteName}</span>
            <span className={`quality-dot ${connectionQuality}`} />
          </div>
        </div>

        <div className={`local-video-tile ${mobile ? "mobile" : ""} ${isScreenSharing ? "sharing" : ""}`}>
          {localStream && !isCameraOff ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          ) : (
            <AvatarTile name={localStorage.getItem("loggedInUser") ? JSON.parse(localStorage.getItem("loggedInUser")).name : "You"} />
          )}
        </div>

        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          unreadCount={unreadCount}
          mobile={mobile}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onToggleScreenShare={onToggleScreenShare}
          onToggleChat={onToggleChat}
          onAudioOnly={onAudioOnly}
          onEnd={onEndCall}
        />

        {!chatOpen && (
          <button className="chat-fab" onClick={onToggleChat}>
            Chat{unreadCount ? ` (${unreadCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
