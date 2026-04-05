import { useEffect, useMemo, useRef, useState } from "react";

function PermissionBadge({ label, allowed }) {
  return (
    <span className={`permission-badge ${allowed ? "allowed" : "blocked"}`}>
      {label}: {allowed ? "Allowed ✓" : "Blocked ✗"}
    </span>
  );
}

export default function PreCallCheck({ appointment, onJoin }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState({ videoinput: [], audioinput: [], audiooutput: [] });
  const [permissions, setPermissions] = useState({ camera: false, microphone: false });
  const [error, setError] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    let analyser;
    let animationFrame;
    let audioContext;

    const loadPreview = async () => {
      try {
        const previewStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(previewStream);
        setPermissions({ camera: true, microphone: true });
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          videoinput: list.filter((item) => item.kind === "videoinput"),
          audioinput: list.filter((item) => item.kind === "audioinput"),
          audiooutput: list.filter((item) => item.kind === "audiooutput"),
        });

        if (videoRef.current) {
          videoRef.current.srcObject = previewStream;
        }

        audioContext = new window.AudioContext();
        const source = audioContext.createMediaStreamSource(previewStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / Math.max(dataArray.length, 1);
          setMicLevel(Math.min(100, Math.round((average / 255) * 100)));
          animationFrame = window.requestAnimationFrame(tick);
        };
        tick();
      } catch (mediaError) {
        console.error(mediaError);
        setPermissions({ camera: false, microphone: false });
        setError("Camera or microphone access is blocked. Enable both in your browser site settings to join the consultation.");
      }
    };

    loadPreview();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
      stream?.getTracks?.().forEach((track) => track.stop());
    };
  }, []);

  const participantName = useMemo(() => (
    appointment?.doctor?.name || appointment?.patient?.name || "Consultation"
  ), [appointment]);

  return (
    <div className="precall-shell">
      <div className="precall-preview-card">
        <div className="precall-preview-wrap">
          <video ref={videoRef} autoPlay muted playsInline className="precall-preview" />
          {!permissions.camera && <div className="precall-preview-fallback">Camera preview unavailable</div>}
        </div>

        <div className="mic-meter" aria-label="Microphone level">
          {[0, 1, 2, 3, 4].map((bar) => (
            <span
              key={bar}
              className={`mic-bar ${micLevel > bar * 20 ? "active" : ""}`}
              style={{ animationDelay: `${bar * 90}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="precall-side">
        <div className="panel consultation-panel">
          <h2>Ready to join?</h2>
          <p className="consultation-subtle">Check your devices before entering the consultation room.</p>
          <div className="permission-row">
            <PermissionBadge label="Camera" allowed={permissions.camera} />
            <PermissionBadge label="Microphone" allowed={permissions.microphone} />
          </div>
          {error && <div className="error-state">{error}</div>}

          <div className="device-grid">
            <label>
              Camera
              <select className="input">
                {devices.videoinput.map((item) => <option key={item.deviceId}>{item.label || "Camera device"}</option>)}
              </select>
            </label>
            <label>
              Microphone
              <select className="input">
                {devices.audioinput.map((item) => <option key={item.deviceId}>{item.label || "Microphone device"}</option>)}
              </select>
            </label>
            <label>
              Speaker
              <select className="input">
                {devices.audiooutput.map((item) => <option key={item.deviceId}>{item.label || "Speaker device"}</option>)}
              </select>
            </label>
          </div>

          <div className="appointment-mini-card">
            <div className="avatar-bubble">{participantName.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{participantName}</strong>
              <p>{appointment?.date} at {appointment?.time}</p>
            </div>
          </div>

          <div className="precall-actions">
            <button className="btn" disabled={!permissions.camera || !permissions.microphone} onClick={() => onJoin({ video: true, audio: true })}>
              Join Now
            </button>
            <button className="btn secondary-btn" onClick={() => onJoin({ video: false, audio: true })}>
              Join without video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
