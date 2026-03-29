// src/context/AppContext.js
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi, projectsApi, usersApi, reviewsApi } from "../api/client";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // checking stored token

  // ── Navigation ────────────────────────────────────────────────────────
  const [screen, setScreen] = useState("landing"); // landing | login | register | app
  const [activeTab, setActiveTab] = useState("browse");

  // ── Data ──────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [pros, setPros] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── UI ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  // ── Toast helper ──────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── On mount: restore session from stored token ───────────────────────
  useEffect(() => {
    const token = localStorage.getItem("prosight_token");
    if (!token) { setAuthLoading(false); return; }

    authApi.me()
      .then((user) => {
        setCurrentUser(user);
        setActiveTab(user.role === "homeowner" ? "my-projects" : "browse");
        setScreen("app");
      })
      .catch(() => localStorage.removeItem("prosight_token"))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("prosight_token", data.token);
    setCurrentUser(data);
    setActiveTab(data.role === "homeowner" ? "my-projects" : "browse");
    setScreen("app");
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    localStorage.setItem("prosight_token", data.token);
    setCurrentUser(data);
    setActiveTab(data.role === "homeowner" ? "my-projects" : "browse");
    setScreen("app");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("prosight_token");
    setCurrentUser(null);
    setProjects([]);
    setSelectedProject(null);
    setScreen("landing");
  }, []);

  // ── Data loaders ──────────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const role = currentUser?.role;
      if (activeTab === "my-projects" || activeTab === "my-jobs") {
        const data = await projectsApi.getMine();
        setProjects(data);
      } else if (activeTab === "browse") {
        const data = role === "pro"
          ? await projectsApi.getAll("open")
          : await projectsApi.getAll();
        setProjects(data);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser?.role, showToast]);

  const loadPros = useCallback(async () => {
    try {
      const data = await usersApi.getPros();
      setPros(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [showToast]);

  // Reload whenever tab changes
  useEffect(() => {
    if (screen !== "app") return;
    loadProjects();
    if (activeTab === "browse" && currentUser?.role === "homeowner") loadPros();
  }, [screen, activeTab]); // eslint-disable-line

  // ── Project actions ───────────────────────────────────────────────────
  const postProject = useCallback(async (formData) => {
    const project = await projectsApi.create(formData);
    setProjects((prev) => [project, ...prev]);
    showToast("Project posted!");
    return project;
  }, [showToast]);

  const applyToProject = useCallback(async (projectId) => {
    await projectsApi.apply(projectId);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, currentUserApplied: true } : p
      )
    );
    showToast("Application sent!");
  }, [showToast]);

  const acceptApplicant = useCallback(async (projectId, proId) => {
    await projectsApi.accept(projectId, proId);
    await loadProjects();
    showToast("Pro accepted! Project is now in progress.");
  }, [loadProjects, showToast]);

  const submitReview = useCallback(async (projectId, rating, comment) => {
    await reviewsApi.create({ projectId, rating, comment });
    await loadProjects();
    showToast("Review submitted!");
  }, [loadProjects, showToast]);

  const approveCompletion = useCallback(async (projectId) => {
    const res = await projectsApi.complete(projectId);
    await loadProjects();
    showToast(res.message);
  }, [loadProjects, showToast]);

  const updateProfile = useCallback(async (formData) => {
    const data = await usersApi.updateMe(formData);
    // Update stored token if email changed
    if (data.token) localStorage.setItem("prosight_token", data.token);
    setCurrentUser(data);
    showToast("Profile updated!");
    return data;
  }, [showToast]);

  // ── Derived lists ─────────────────────────────────────────────────────
  const myProjects          = projects.filter((p) => p.owner?.id === currentUser?.id);
  const openProjects        = projects.filter((p) => p.status === "open");
  const myAcceptedProjects  = projects.filter((p) => p.pro?.id === currentUser?.id);

  const value = {
    // Auth
    currentUser, authLoading,
    login, register, logout,
    // Navigation
    screen, setScreen,
    activeTab, setActiveTab,
    // Data
    projects, pros, loading,
    selectedProject, setSelectedProject,
    // Actions
    postProject, applyToProject, acceptApplicant, approveCompletion, submitReview, updateProfile,
    loadProjects,
    // UI
    toast, showToast,
    // Derived
    myProjects, openProjects, myAcceptedProjects,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
