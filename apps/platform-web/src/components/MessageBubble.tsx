interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isAssistant = role === "assistant";
  const isLog = content.startsWith("🚀") || content.startsWith("📦") || content.startsWith("✅") ||
    content.startsWith("❌") || content.startsWith("⛔") || content.startsWith("🎉") ||
    content.startsWith("🔐") || content.startsWith("⏳") || content.startsWith("⚙");

  return (
    <div className="msg-bubble" style={{ justifyContent: isAssistant ? "flex-start" : "flex-end" }}>
      {isAssistant && (
        <div className="msg-avatar assistant">🤖</div>
      )}
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: 12,
          borderBottomLeftRadius: isAssistant ? 4 : 12,
          borderBottomRightRadius: isAssistant ? 12 : 4,
          background: isAssistant
            ? isLog
              ? "rgba(99,102,241,0.1)"
              : "var(--bg-card)"
            : "linear-gradient(135deg, var(--purple-500), var(--indigo-500))",
          border: isAssistant ? "1px solid var(--border)" : "none",
          color: "var(--text-primary)",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: isLog ? "'JetBrains Mono', 'Fira Code', monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
      {!isAssistant && (
        <div className="msg-avatar user">👤</div>
      )}
    </div>
  );
}
