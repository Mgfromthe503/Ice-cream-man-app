import { useEffect, useRef, useState } from "react";

type NavItem = "Command Center" | "Code Studio" | "Research Vault" | "Settings";
type RuntimeState = "not connected" | "checking" | "ready";

type Activity = {
  title: string;
  detail: string;
  time: string;
  tone: "neutral" | "accent" | "warning";
};

const navItems: NavItem[] = ["Command Center", "Code Studio", "Research Vault", "Settings"];

const starterActivities: Activity[] = [
  {
    title: "Privacy boundary armed",
    detail: "Network tools are disabled until a request is approved.",
    time: "Now",
    tone: "accent",
  },
  {
    title: "Developer workspace idle",
    detail: "Select a project to begin a plan-first coding session.",
    time: "Ready",
    tone: "neutral",
  },
  {
    title: "Windows Hello gate",
    detail: "Optional privileged-action re-authentication is not configured.",
    time: "Setup",
    tone: "warning",
  },
];

function EyeMark() {
  return (
    <svg aria-hidden="true" className="eye-mark" viewBox="0 0 48 48" fill="none">
      <path d="M4 24C8.3 15.6 15 11.4 24 11.4S39.7 15.6 44 24c-4.3 8.4-11 12.6-20 12.6S8.3 32.4 4 24Z" stroke="currentColor" strokeWidth="2.3" />
      <circle cx="24" cy="24" r="7.2" stroke="currentColor" strokeWidth="2.3" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m12 2 1.72 6.28L20 10l-6.28 1.72L12 18l-1.72-6.28L4 10l6.28-1.72L12 2Zm6.1 13.6.82 3 3 .82-3 .82-.82 3-.82-3-3-.82 3-.82.82-3Z" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Command Center");
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("not connected");
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState(
    "Your command center is ready. Connect a local runtime when you are ready to begin private, on-device work.",
  );
  const [activities, setActivities] = useState<Activity[]>(starterActivities);
  const commandInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const focusCommand = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === " ") {
        event.preventDefault();
        commandInput.current?.focus();
      }
    };
    window.addEventListener("keydown", focusCommand);
    return () => window.removeEventListener("keydown", focusCommand);
  }, []);

  const addActivity = (activity: Activity) => {
    setActivities((current) => [activity, ...current].slice(0, 5));
  };

  const runCommand = () => {
    const request = command.trim();
    if (!request) {
      commandInput.current?.focus();
      return;
    }

    setResponse(
      runtimeState === "ready"
        ? `A local model request has been staged: “${request}”. Review the proposed plan before any files or commands are changed.`
        : `I captured your request: “${request}”. Connect a local model runtime before I can reason over it. I will not silently switch to a cloud service.`,
    );
    addActivity({
      title: "Command captured locally",
      detail: runtimeState === "ready" ? "Plan-only mode is active." : "No model endpoint was contacted.",
      time: "Now",
      tone: "accent",
    });
    setCommand("");
  };

  const checkRuntime = () => {
    setRuntimeState("checking");
    setResponse("Checking the local-only runtime endpoint. No data will leave this device.");
    window.setTimeout(() => {
      setRuntimeState("not connected");
      setResponse("No compatible local runtime was detected. Install Ollama or add a compatible local endpoint in Settings.");
      addActivity({
        title: "Runtime check complete",
        detail: "No local model endpoint was detected. Nothing was uploaded.",
        time: "Now",
        tone: "warning",
      });
    }, 700);
  };

  const setView = (view: NavItem) => {
    setActiveNav(view);
    if (view !== "Command Center") {
      setResponse(`${view} is prepared as a local-first workspace. This foundation keeps sensitive actions in plan-and-approval mode.`);
    }
  };

  const runtimeLabel = runtimeState === "checking" ? "Checking localhost" : runtimeState === "ready" ? "Local runtime ready" : "Runtime not connected";

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark"><EyeMark /></div>
          <div>
            <p className="brand-name">RED REAPER</p>
            <p className="brand-subtitle">LOCAL INTELLIGENCE</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              key={item}
              onClick={() => setView(item)}
              type="button"
            >
              <span className="nav-node" aria-hidden="true" />
              {item}
            </button>
          ))}
        </nav>

        <section className="sidebar-status" aria-label="Security status">
          <p className="eyebrow">Trust posture</p>
          <p className="status-title">Approval required</p>
          <p className="status-copy">Edits, commands, installs, and network access remain under your control.</p>
        </section>

        <div className="sidebar-footer">
          <span className="privacy-dot" aria-hidden="true" />
          <span>Local-first session</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-path"><span className="eyebrow">Workspace</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <button className="quiet-button" type="button" onClick={() => setView("Settings")}>Preferences</button>
            <button className="operator-chip" type="button" aria-label="Open operator profile">
              <span className="operator-avatar">OP</span>
              <span>Operator</span>
            </button>
          </div>
        </header>

        <div className="content-grid">
          <section className="hero-panel">
            <div className="hero-backdrop" aria-hidden="true" />
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">PRIVATE COMMAND CENTER</p>
              <h1>Good evening,<br /><span>Operator.</span></h1>
              <p className="hero-description">A local-first assistant for research, deliberate coding, and auditable computer work.</p>
            </div>
            <div className="hero-orb" aria-hidden="true"><EyeMark /></div>

            <div className="command-box">
              <label htmlFor="assistant-command">What would you like to work on?</label>
              <div className="command-row">
                <textarea
                  ref={commandInput}
                  id="assistant-command"
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      runCommand();
                    }
                  }}
                  placeholder="Ask a question, plan a feature, or inspect a selected project…"
                  rows={1}
                />
                <button className="send-button" type="button" onClick={runCommand} aria-label="Submit command"><ArrowIcon /></button>
              </div>
              <div className="command-hints">
                <span><kbd>Ctrl</kbd> <kbd>Space</kbd> to focus</span>
                <span><kbd>Enter</kbd> to stage</span>
              </div>
            </div>
          </section>

          <section className="briefing-panel" aria-live="polite">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ASSISTANT BRIEFING</p>
                <h2>Deliberate by design</h2>
              </div>
              <SparkIcon />
            </div>
            <p className="briefing-copy">{response}</p>
            <button className="inline-action" type="button" onClick={() => setView("Settings")}>Review local setup <ArrowIcon /></button>
          </section>

          <section className="capability-grid" aria-label="Assistant workspaces">
            <article className="capability-card runtime-card">
              <div className="card-head"><p className="eyebrow">MODEL RUNTIME</p><span className={`state-pill ${runtimeState}`}>{runtimeLabel}</span></div>
              <h2>Run intelligence on your machine.</h2>
              <p>Connect an approved loopback-only model runtime. No cloud fallback is enabled.</p>
              <button className="primary-action" type="button" onClick={checkRuntime} disabled={runtimeState === "checking"}>
                {runtimeState === "checking" ? "Checking runtime…" : "Check local runtime"} <ArrowIcon />
              </button>
            </article>

            <article className="capability-card">
              <div className="card-head"><p className="eyebrow">CODE STUDIO</p><span className="card-index">01</span></div>
              <h2>Plan, inspect, review, then apply.</h2>
              <p>Map a chosen project, draft a change plan, and approve every diff or command individually.</p>
              <button className="secondary-action" type="button" onClick={() => setView("Code Studio")}>Open code workspace <ArrowIcon /></button>
            </article>

            <article className="capability-card">
              <div className="card-head"><p className="eyebrow">RESEARCH VAULT</p><span className="card-index">02</span></div>
              <h2>Keep sources, claims, and context together.</h2>
              <p>Capture research with visible links and notes. Network retrieval stays off until you approve it.</p>
              <button className="secondary-action" type="button" onClick={() => setView("Research Vault")}>Open research vault <ArrowIcon /></button>
            </article>
          </section>

          <section className="activity-panel">
            <div className="panel-heading activity-heading">
              <div><p className="eyebrow">ACTIVITY TIMELINE</p><h2>Transparent actions</h2></div>
              <span className="activity-badge">{activities.length} events</span>
            </div>
            <ol className="activity-list">
              {activities.map((activity, index) => (
                <li key={`${activity.title}-${index}`}>
                  <span className={`activity-marker ${activity.tone}`} aria-hidden="true" />
                  <div><strong>{activity.title}</strong><p>{activity.detail}</p></div>
                  <time>{activity.time}</time>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
