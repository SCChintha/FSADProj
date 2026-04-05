import { useMemo, useRef, useState } from "react";

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({
  open,
  messages,
  typingUsers,
  onClose,
  onSend,
  onSendFile,
  onFocus,
  onTyping,
  onBlur,
  mobile,
}) {
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState("");

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const last = groups[groups.length - 1];
      if (last && last.senderId === message.senderId && message.type !== "system") {
        last.items.push(message);
      } else {
        groups.push({ senderId: message.senderId, senderName: message.senderName, isMine: message.isMine, items: [message] });
      }
      return groups;
    }, []);
  }, [messages]);

  const submit = () => {
    if (!draft.trim()) {
      return;
    }
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <aside className={`chat-panel ${open ? "open" : ""} ${mobile ? "mobile" : ""}`}>
      <div className="chat-panel-header">
        <strong>Consultation Chat</strong>
        <button className="icon-btn" onClick={onClose}>×</button>
      </div>

      <div className="chat-panel-messages">
        {groupedMessages.map((group) => (
          <div key={`${group.senderId}-${group.items[0].id}`} className={`chat-group ${group.isMine ? "mine" : ""}`}>
            <div className="chat-avatar">{group.senderName.slice(0, 2).toUpperCase()}</div>
            <div className="chat-group-bubbles">
              {group.items.map((message) => (
                <div key={message.id} className={`chat-bubble ${group.isMine ? "mine" : ""} ${message.type === "system" ? "system" : ""}`}>
                  {message.type === "file" ? (
                    <a href={message.content} target="_blank" rel="noreferrer">
                      {message.fileName || "Open attachment"}
                    </a>
                  ) : (
                    message.content
                  )}
                </div>
              ))}
              <span className="chat-time">
                {formatTime(group.items[group.items.length - 1].createdAt)} {group.isMine ? (group.items.some((item) => item.read) ? "✓✓" : "✓") : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-typing-indicator">
        {typingUsers.length > 0 ? `${typingUsers[0]} is typing...` : ""}
      </div>

      <div className="chat-panel-input">
        <button className="icon-btn" onClick={() => fileInputRef.current?.click()}>📎</button>
        <textarea
          className="input chat-input"
          rows={1}
          maxLength={800}
          value={draft}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            onTyping();
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Send a message"
        />
        <button className="btn" disabled={!draft.trim()} onClick={submit}>Send</button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSendFile(file);
            }
            event.target.value = "";
          }}
        />
      </div>
    </aside>
  );
}
