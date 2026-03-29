// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from "react";
import { messagesApi } from "../api/client";
import { useApp } from "../context/AppContext";

export function useMessages(projectId) {
  const { showToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load messages when project is selected
  useEffect(() => {
    if (!projectId) { setMessages([]); return; }
    setLoading(true);
    messagesApi.getAll(projectId)
      .then(setMessages)
      .catch((err) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [projectId]); // eslint-disable-line

  const send = useCallback(async () => {
    if (!input.trim() || !projectId) return;
    try {
      const msg = await messagesApi.send(projectId, input.trim());
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [input, projectId, showToast]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") send();
  };

  return { messages, input, setInput, send, handleKeyDown, loading };
}
