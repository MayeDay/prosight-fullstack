// src/hooks/useMessages.js
import { useState, useEffect, useRef, useCallback } from "react";
import { messagesApi } from "../api/client";
import { useApp } from "../context/AppContext";

export function useMessages(projectId) {
  const { showToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const latestIdRef = useRef(null);

  const fetchMessages = useCallback(async (showLoader = false) => {
    if (!projectId) return;
    if (showLoader) setLoading(true);
    try {
      const data = await messagesApi.getAll(projectId);
      setMessages(data);
      if (data.length) latestIdRef.current = data[data.length - 1].id;
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [projectId]); // eslint-disable-line

  // Initial load
  useEffect(() => {
    if (!projectId) { setMessages([]); return; }
    fetchMessages(true);
  }, [projectId]); // eslint-disable-line

  // Poll every 3 seconds for new messages
  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(interval);
  }, [projectId, fetchMessages]);

  const send = useCallback(async () => {
    if (!input.trim() || !projectId) return;
    try {
      const msg = await messagesApi.send(projectId, input.trim());
      setMessages((prev) => [...prev, msg]);
      latestIdRef.current = msg.id;
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
