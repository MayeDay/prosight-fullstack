// src/App.js
import { useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import HomeownerDashboard from "./pages/HomeownerDashboard";
import ProDashboard from "./pages/ProDashboard";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import Toast from "./components/Toast";

function AppShell() {
  const { activeTab, currentUser } = useApp();
  const role = currentUser?.role;

  const renderContent = () => {
    if (activeTab === "messages") return <MessagesPage />;
    if (activeTab === "profile")  return <ProfilePage />;
    if (role === "homeowner")     return <HomeownerDashboard />;
    if (role === "pro")           return <ProDashboard />;
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#f0ede8" }}>
      <Header />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  const { screen, authLoading } = useApp();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffb43c",
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
        }}
      >
        ProSight DIY
      </div>
    );
  }

  return (
    <>
      <Toast />
      {screen === "landing" && <LandingPage />}
      {screen === "login"   && <LoginPage />}
      {screen === "app"     && <AppShell />}
    </>
  );
}
