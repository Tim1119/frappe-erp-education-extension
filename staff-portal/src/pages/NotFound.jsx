import { useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";
import { LogoMark } from "../components/ui/Primitives";
import Sparkle from "../components/ui/Sparkle";

const DARK = {
  bg: "#07090f",
  ink: "#eef0f8",
  ink2: "rgba(238,240,248,.65)",
  ink3: "rgba(238,240,248,.38)",
  border: "rgba(255,255,255,.07)",
  pill: "rgba(255,255,255,.06)",
  pillBorder: "rgba(255,255,255,.1)",
};
const LIGHT = {
  bg: "#ffffff",
  ink: "#0b0d1a",
  ink2: "rgba(11,13,26,.62)",
  ink3: "rgba(11,13,26,.42)",
  border: "rgba(99,102,241,.14)",
  pill: "rgba(99,102,241,.08)",
  pillBorder: "rgba(99,102,241,.22)",
};

function btnPrimary(isDark) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 42,
    padding: "0 22px",
    borderRadius: 6,
    background: isDark ? "#3b82f6" : "#2563eb",
    color: "#fff",
    border: "1px solid transparent",
    boxShadow: isDark
      ? "0 1px 2px rgba(59,130,246,.4), inset 0 1px 0 rgba(255,255,255,.14)"
      : "0 1px 2px rgba(37,99,235,.4), inset 0 1px 0 rgba(255,255,255,.14)",
    fontSize: 14.5,
    fontWeight: 600,
    letterSpacing: "-.01em",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "background .15s ease, box-shadow .15s ease",
  };
}
function btnPrimaryHover(isDark) {
  return {
    background: isDark ? "#60a5fa" : "#1d4ed8",
    boxShadow: isDark
      ? "0 4px 12px rgba(59,130,246,.45), inset 0 1px 0 rgba(255,255,255,.18)"
      : "0 4px 12px rgba(37,99,235,.45), inset 0 1px 0 rgba(255,255,255,.18)",
  };
}

export default function NotFound() {
  const [mode] = useState(
    () => localStorage.getItem("staffportal_theme") || "light",
  );
  const isDark = mode === "dark";
  const t = isDark ? DARK : LIGHT;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.ink,
        fontFamily: "'Geist','Inter',system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Background glow */}
      {isDark ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 900,
              height: 700,
              borderRadius: "50%",
              top: "-28%",
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(ellipse,rgba(99,102,241,.22) 0%,transparent 65%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 560,
              height: 460,
              top: "10%",
              right: "-8%",
              background:
                "radial-gradient(ellipse,rgba(59,130,246,.16) 0%,transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% -5%,rgba(99,102,241,.07) 0%,transparent 70%)",
          }}
        />
      )}

      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)"
            : "linear-gradient(rgba(11,13,26,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,13,26,.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 40%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 40%, black 35%, transparent 100%)",
        }}
      />

      {/* Sparkles */}
      <Sparkle
        size={26}
        color="#6366f1"
        style={{ top: "12%", left: "10%" }}
        spinDuration="9s"
        floatDuration="5s"
      />
      <Sparkle
        size={16}
        color="#34d399"
        style={{ top: "18%", right: "14%" }}
        spinDuration="6s"
        floatDuration="4s"
        floatDelay=".8s"
      />
      <Sparkle
        size={20}
        color="#3b82f6"
        style={{ bottom: "16%", left: "16%" }}
        spinDuration="10s"
        floatDuration="6s"
        floatDelay="1.4s"
      />
      <Sparkle
        size={14}
        color="#a78bfa"
        style={{ bottom: "20%", right: "12%" }}
        spinDuration="7s"
        floatDuration="4.5s"
        floatDelay=".4s"
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 520,
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: t.ink,
            marginBottom: 40,
          }}
        >
          <LogoMark size={26} />
          <span
            style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-.03em" }}
          >
            School Staff Portal
          </span>
        </Link>

        <div
          style={{
            fontSize: "clamp(72px,14vw,140px)",
            fontWeight: 800,
            letterSpacing: "-.05em",
            lineHeight: 1,
            margin: "0 0 8px",
            ...(isDark
              ? {
                  background:
                    "linear-gradient(160deg,#fff 25%,rgba(255,255,255,.44))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }
              : { color: t.ink }),
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "clamp(22px,3.5vw,32px)",
            fontWeight: 700,
            letterSpacing: "-.03em",
            margin: "0 0 14px",
            color: t.ink,
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: 15,
            color: t.ink3,
            lineHeight: 1.7,
            margin: "0 0 36px",
          }}
        >
          The page you're looking for doesn't exist, may have been moved, or the
          link might be incorrect.
        </p>

        <div
          style={{
            display: "flex",
            gap: 11,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/dashboard"
            style={btnPrimary(isDark)}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, btnPrimaryHover(isDark));
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = btnPrimary(isDark).background;
              e.currentTarget.style.boxShadow = btnPrimary(isDark).boxShadow;
              e.currentTarget.style.transform = "";
            }}
          >
            <HomeIcon size={15} /> Back to dashboard
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes sparkleFloat{0%,100%{transform:translateY(0);opacity:.55;}50%{transform:translateY(-14px);opacity:1;}}
        @keyframes sparkleSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>
    </div>
  );
}
