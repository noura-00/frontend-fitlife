import "./styles.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import sendRequest from "../../utilities/sendRequest";
import getToken from "../../utilities/getToken";

const getId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const formatTimestamp = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return "";
  }
};

const createMessage = (role, content) => ({
  id: getId(),
  role,
  content,
  timestamp: new Date().toISOString(),
});

const initialMessages = [
  createMessage(
    "ai",
    "هلا! أنا FitLife AI Coach. أرسل لي أي شيء تحس فيه أو تحتاجه، وأنا بجهز لك نصائح وتمارين وأكل يناسب يومك."
  ),
];

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function handleSendMessage(evt) {
    evt.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError("");
    setLoading(true);

    try {
      const response = await sendRequest("api/openai/", "POST", { message: trimmed });
      const content =
        typeof response === "string"
          ? response
          : response?.message || "أواجه مشكلة في قراءة الرد. جرب ترسلها مرة ثانية.";
      const meta =
        response && typeof response === "object"
          ? Object.fromEntries(
              Object.entries(response).filter(
                ([key]) => key !== "message" && key !== "success"
              )
            )
          : null;

      const aiMessage = {
        ...createMessage("ai", content),
        meta: meta && Object.keys(meta).length ? meta : null,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderMeta(meta) {
    if (!meta) return null;

    const flagLabels = {
      accessibility_mode: "الوضع البصري",
      deaf_mode: "وضع الصم",
      pregnancy_mode: "وضع الحمل",
      postpartum_mode: "بعد الولادة",
      diastasis_mode: "انفصال عضلات البطن",
    };

    const chips = Object.entries(flagLabels)
      .filter(([key]) => meta[key])
      .map(([key, label]) => {
        const extraValue =
          key === "accessibility_mode" && meta.visual_impairment
            ? ` · ${meta.visual_impairment}`
            : key === "deaf_mode" && meta.hearing_impairment
            ? ` · ${meta.hearing_impairment}`
            : key === "pregnancy_mode" && meta.trimester
            ? ` · Trimester ${meta.trimester}`
            : key === "postpartum_mode" && meta.phase
            ? ` · Phase ${meta.phase}`
            : key === "diastasis_mode" && meta.stage
            ? ` · Stage ${meta.stage}`
            : "";
        return (
          <span key={key} className="ai-chat-meta-chip">
            {label}
            {extraValue}
          </span>
        );
      });

    if (!chips.length) return null;

    return <div className="ai-chat-meta">{chips}</div>;
  }

  return (
    <div className="ai-chat-page">
      <header className="ai-chat-header">
        <div className="ai-chat-header-content">
          <h1>FitLife AI Coach</h1>
          <p className="ai-chat-subtitle">
            Saudi casual dialect · Adaptive workouts · Personalized nutrition
          </p>
        </div>
      </header>

      {error && <div className="ai-chat-error">{error}</div>}

      <section className="ai-chat-container">
        <div className="ai-chat-messages">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`ai-chat-message ${
                message.role === "user" ? "user-message" : "ai-message"
              }`}
            >
              <div className="ai-chat-message-content">
                {message.content}
                {renderMeta(message.meta)}
              </div>
              <span className="ai-chat-message-time">
                {formatTimestamp(message.timestamp)}
              </span>
            </article>
          ))}

          {loading && (
            <article className="ai-chat-message ai-message">
              <div className="ai-chat-message-content">
                <div className="ai-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <span className="ai-chat-message-time">...</span>
            </article>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      <form className="ai-chat-input-form" onSubmit={handleSendMessage}>
        <input
          className="ai-chat-input"
          placeholder="اكتب سؤالك بالعربي أو الإنجليزي..."
          value={inputValue}
          onChange={(evt) => setInputValue(evt.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ai-chat-send-btn"
          disabled={loading || !inputValue.trim()}
        >
          {loading ? (
            <span className="spinner-small" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12L20 4L13 13M4 12L20 20L13 13M4 12H11"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

