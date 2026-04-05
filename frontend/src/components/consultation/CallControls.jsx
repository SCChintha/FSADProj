import { useEffect, useState } from "react";

function ControlButton({ active, danger, label, onClick, badge, children }) {
  return (
    <button className={`call-control-btn ${active ? "active" : ""} ${danger ? "danger" : ""}`} title={label} onClick={onClick}>
      <span>{children}</span>
      {badge ? <span className="call-control-badge">{badge}</span> : null}
    </button>
  );
}

export default function CallControls({
  isMuted,
  isCameraOff,
  isScreenSharing,
  unreadCount,
  mobile,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onAudioOnly,
  onEnd,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mobile) {
      setVisible(true);
      return undefined;
    }

    let timeoutId;
    const activate = () => {
      setVisible(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setVisible(false), 3000);
    };

    activate();
    window.addEventListener("mousemove", activate);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("mousemove", activate);
    };
  }, [mobile]);

  return (
    <>
      {isScreenSharing && <div className="screen-share-banner">You are sharing your screen</div>}
      <div className={`call-controls ${visible ? "visible" : ""} ${mobile ? "mobile" : ""}`}>
        <ControlButton active={!isMuted} danger={isMuted} label={isMuted ? "Unmute" : "Mute"} onClick={onToggleMute}>
          {isMuted ? "Mic Off" : "Mic"}
        </ControlButton>
        <ControlButton active={!isCameraOff} danger={isCameraOff} label={isCameraOff ? "Turn on camera" : "Turn off camera"} onClick={onToggleCamera}>
          {isCameraOff ? "Cam Off" : "Cam"}
        </ControlButton>
        <ControlButton active={isScreenSharing} label={isScreenSharing ? "Stop sharing" : "Share screen"} onClick={onToggleScreenShare}>
          {isScreenSharing ? "Stop Share" : "Share"}
        </ControlButton>
        <ControlButton label="Open chat" badge={unreadCount || null} onClick={onToggleChat}>
          Chat
        </ControlButton>
        <ControlButton label="Audio only mode" onClick={onAudioOnly}>
          Audio
        </ControlButton>
        <ControlButton danger label="End call" onClick={onEnd}>
          End
        </ControlButton>
      </div>
    </>
  );
}
