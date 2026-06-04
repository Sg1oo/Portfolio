import BackgroundScene from "./BackgroundScene.jsx";
import VantaFogBackground from "./VantaFogBackground";

export default function Layout({ children, hideBackgroundScene }) {
  return (
    <div className="layout">
      <VantaFogBackground />
      {!hideBackgroundScene && <BackgroundScene />}

      <header className="layout-header">
        <span className="logo">VIBE</span>
      </header>

      <main className="layout-main">
        {children}
      </main>

      <footer className="layout-footer">
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
