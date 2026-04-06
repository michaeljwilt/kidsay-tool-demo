import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  AreaChart, Area
} from 'recharts';
import { RESPONSES, DEFAULT_RESPONSE, getResponseById } from './responses';
import matchResponse from './matchResponse';
import OnboardingModal from './OnboardingModal';
import {
  getPersonalizedActivities,
  getPersonalizedAlerts,
  getPersonalizedSuggestions,
} from './agentPersonalization';

const DEMO_PASSWORD = 'kidsay2026';

function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('kidsay_auth') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem('kidsay_auth', 'true');
      setAuthed(true);
    } else {
      setError(true);
      setPassword('');
    }
  }, [password]);

  if (authed) return children;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#1e2433', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
        <h2 style={{ color: '#fff', margin: '0 0 6px', fontSize: '20px', fontWeight: 700 }}>KidSay Analytics</h2>
        <p style={{ color: '#8892a4', margin: '0 0 24px', fontSize: '14px' }}>Enter the demo password to continue</p>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
            border: `1.5px solid ${error ? '#ff6b6b' : '#2a3040'}`,
            background: '#151a26', color: '#fff', outline: 'none', boxSizing: 'border-box',
            marginBottom: '12px',
          }}
        />
        {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: '0 0 12px' }}>Incorrect password</p>}
        <button type="submit" style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '10px',
          background: 'linear-gradient(135deg, #00D4BB, #00E5CC)', color: '#fff',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>
          Enter
        </button>
      </form>
    </div>
  );
}

function Sparkline({ data, color = '#00D4BB', forecast, width = 60, height = 24 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const splitIdx = forecast ? Math.floor(data.length * 0.5) : data.length;
  const solidPoints = data.slice(0, splitIdx + 1).map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const dashedPoints = data.slice(splitIdx).map((v, i) => `${((i + splitIdx) / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <polyline points={solidPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {forecast && <polyline points={dashedPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,3" />}
    </svg>
  );
}

let chartIdCounter = 0;

function ChartBlock({ chart, darkMode }) {
  const [gradientId] = useState(() => `areaGradient-${++chartIdCounter}`);
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    background: darkMode ? '#1e293b' : '#fff',
    border: `1px solid ${gridColor}`,
    borderRadius: '8px',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    fontSize: '12px'
  };
  const axisProps = { tick: { fill: textColor, fontSize: 11 } };
  const margin = { top: 4, right: 4, left: -20, bottom: 4 };

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{
        fontSize: '11px', fontWeight: '600', color: textColor,
        marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        {chart.title}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        {chart.type === 'bar' ? (
          <BarChart data={chart.data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={chart.dataKey} fill="#00D4BB" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : chart.type === 'line' ? (
          <LineChart data={chart.data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={chart.dataKey} stroke="#00D4BB" strokeWidth={2} dot={{ fill: '#00D4BB', r: 4 }} />
          </LineChart>
        ) : chart.type === 'area' ? (
          <AreaChart data={chart.data} margin={margin}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4BB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4BB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={chart.dataKey} stroke="#00D4BB" strokeWidth={2} fill={`url(#${gradientId})`} dot={{ fill: '#00D4BB', r: 4 }} />
          </AreaChart>
        ) : chart.type === 'stacked-bar' ? (
          <BarChart data={chart.data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
            {chart.bars.map(b => (
              <Bar key={b.key} dataKey={b.key} fill={b.color} stackId="stack" radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <BarChart data={chart.data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
            {chart.bars.map(b => (
              <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const NICKELODEON_CONFIG = {
  name: 'Nickelodeon Team',
  company: 'Nickelodeon',
  role: 'Brand Manager',
  categories: ['Toys', 'Snacks'],
  interests: ['Action Figures', 'Collectibles', 'Healthy Snacks', 'Beverages'],
  ageGroups: ['Young Kids (4–7)', 'Tweens (8–12)'],
  regions: ['National', 'West Coast'],
  gender: 'all',
  alerts: ['anomalies', 'trends', 'seasonal', 'qoq'],
  additionalInfo: 'Focus on Nickelodeon-licensed products including PAW Patrol, SpongeBob, and Teenage Mutant Ninja Turtles.',
};

function KidSayDemo() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI analytics assistant. Ask me about toy and snack trends!", displayText: "Hi! I'm your AI analytics assistant. Ask me about toy and snack trends!", streaming: false }
  ]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [streamingIndex, setStreamingIndex] = useState(null);
  const [streamingPos, setStreamingPos] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [agentConfig, setAgentConfig] = useState(null);
  const [activities, setActivities] = useState([]);
  const [agentActive, setAgentActive] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Personalized content memos
  const personalizedSuggestions = useMemo(() =>
    agentConfig ? getPersonalizedSuggestions(agentConfig).slice(0, 5) : null,
    [agentConfig]
  );

  const allPersonalizedAlerts = useMemo(() =>
    agentConfig ? getPersonalizedAlerts(agentConfig) : null,
    [agentConfig]
  );
  const personalizedAlerts = allPersonalizedAlerts ? allPersonalizedAlerts.slice(0, 3) : null;
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertDetail, setAlertDetail] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);


  // Activity feed — load static weekly log when agent activates
  useEffect(() => {
    if (!agentActive || !agentConfig) return;
    const items = getPersonalizedActivities(agentConfig);
    setActivities(items.map((item, i) => ({
      id: i,
      text: item.text,
      type: item.type,
      day: item.day,
    })));
  }, [agentActive, agentConfig]);

  // Streaming effect — advances one character at a time
  useEffect(() => {
    if (streamingIndex === null) return;
    const msg = messages[streamingIndex];
    if (!msg || !msg.streaming) return;

    if (streamingPos >= msg.text.length) {
      setMessages(prev => prev.map((m, i) =>
        i === streamingIndex ? { ...m, displayText: m.text, streaming: false } : m
      ));
      setStreamingIndex(null);
      return;
    }

    const timer = setTimeout(() => {
      setMessages(prev => prev.map((m, i) =>
        i === streamingIndex ? { ...m, displayText: msg.text.slice(0, streamingPos + 1) } : m
      ));
      setStreamingPos(p => p + 1);
    }, 18);

    return () => clearTimeout(timer);
  }, [streamingIndex, streamingPos, messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const msgText = text || input;
    if (!msgText.trim() || streamingIndex !== null) return;
    const response = matchResponse(msgText, RESPONSES) || DEFAULT_RESPONSE;
    const userMsg = { role: 'user', text: msgText, displayText: msgText, streaming: false };
    const assistantMsg = { role: 'assistant', text: response.text, chart: response.chart, followUps: response.followUps, displayText: '', streaming: true };
    setMessages(prev => {
      const updated = [...prev, userMsg, assistantMsg];
      setStreamingIndex(updated.length - 1);
      setStreamingPos(0);
      return updated;
    });
    setInput('');
  };

  const handleFollowUp = (response) => {
    if (streamingIndex !== null) return;
    const userMsg = { role: 'user', text: response.label, displayText: response.label, streaming: false };
    const assistantMsg = { role: 'assistant', text: response.text, chart: response.chart, followUps: response.followUps, displayText: '', streaming: true };
    setMessages(prev => {
      const updated = [...prev, userMsg, assistantMsg];
      setStreamingIndex(updated.length - 1);
      setStreamingPos(0);
      return updated;
    });
  };

  const handleOnboardingComplete = (config) => {
    setAgentConfig(config);
    setAgentActive(true);
    setOnboardingOpen(false);
    const cats = config.categories.join(' & ').toLowerCase();
    const ages = config.ageGroups.length > 0 ? config.ageGroups.map(a => a.split(' ')[0]).join(', ') : 'all ages';
    const regions = config.regions.includes('National') ? 'nationally' : config.regions.join(', ');
    const greeting = `Hi ${config.name}! Your agent is configured. I'll focus on ${cats} trends for ${ages} ${regions}. I'll proactively flag ${config.alerts.length > 0 ? config.alerts.join(', ').replace(/_/g, ' ') : 'key insights'} as they emerge. What would you like to explore first?`;
    setMessages([{ role: 'assistant', text: greeting, displayText: greeting, streaming: false }]);
  };

  // Theme tokens
  const t = darkMode ? {
    outerBg: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
    card: '#1e293b',
    shadow: '0 20px 60px rgba(0,0,0,0.4)',
    text: '#f1f5f9',
    textSub: '#94a3b8',
    inputBg: '#0f172a',
    inputBorder: '#334155',
    inputText: '#f1f5f9',
    msgBg: '#0f172a',
    msgText: '#f1f5f9',
    suggestBg: '#0f172a',
    suggestBorder: '#334155',
    suggestText: '#94a3b8',
    toggleBg: '#334155',
    toggleText: '#f1f5f9',
    warn: { bg: '#451a03', border: '#d97706', title: '#fbbf24', text: '#fcd34d' },
    up:   { bg: '#052e16', border: '#10b981', title: '#34d399', text: '#6ee7b7' },
    new:  { bg: '#052e16', border: '#00E5CC', title: '#34d399', text: '#6ee7b7' },
  } : {
    outerBg: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)',
    card: '#ffffff',
    shadow: '0 20px 60px rgba(0,0,0,0.1)',
    text: '#1e293b',
    textSub: '#64748b',
    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    inputText: '#1e293b',
    msgBg: '#f8fafc',
    msgText: '#1e293b',
    suggestBg: '#f8fafc',
    suggestBorder: '#e2e8f0',
    suggestText: '#475569',
    toggleBg: '#e2e8f0',
    toggleText: '#1e293b',
    warn: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', text: '#78350f' },
    up:   { bg: '#d1fae5', border: '#10b981', title: '#065f46', text: '#064e3b' },
    new:  { bg: '#d1fae5', border: '#00E5CC', title: '#065f46', text: '#064e3b' },
  };

  const tr = 'background 0.3s, color 0.3s, border-color 0.3s';

  return (
    <div className={`outer-padding${isMobile ? ' mobile-layout' : ''}`} style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: t.outerBg, transition: tr }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div className="header-card" style={{ background: t.card, borderRadius: '20px', marginBottom: '24px', boxShadow: t.shadow, transition: tr }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', background: 'linear-gradient(135deg, #00D4BB, #00E5CC)', borderRadius: isMobile ? '10px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '18px' : '24px' }}>🎯</div>
              <div>
                <h1 style={{ fontSize: isMobile ? '18px' : '26px', fontWeight: '700', background: 'linear-gradient(135deg, #00D4BB, #00E5CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>KidSay Analytics AI</h1>
                {!isMobile && <p style={{ fontSize: '13px', color: t.textSub, margin: '2px 0 0', transition: tr }}>25 years of survey data • Powered by GPT-5 Nano</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setDarkMode(d => !d)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ padding: '10px 16px', background: t.toggleBg, color: t.toggleText, border: 'none', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', transition: tr, lineHeight: 1 }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dashboard (main content) */}
        {isMobile && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Agent Info */}
            {agentConfig ? (
              <div style={{ background: t.card, borderRadius: '12px', padding: '16px', transition: tr, border: '1.5px solid rgba(0,212,187,0.2)', boxShadow: t.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4BB,#00E5CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: t.text }}>{agentConfig.name}</div>
                    <div style={{ fontSize: '11px', color: t.textSub }}>{agentConfig.role} · {agentConfig.company}</div>
                  </div>
                  <button onClick={() => setOnboardingOpen(true)} style={{ fontSize: '11px', color: '#00D4BB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                </div>
                <div style={{ fontSize: '11px', color: t.textSub, display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                  <span><b style={{ color: t.text }}>Tracking:</b> {agentConfig.categories.join(' & ')}</span>
                  <span><b style={{ color: t.text }}>Ages:</b> {agentConfig.ageGroups.map(a => a.split(' ')[0]).join(', ')}</span>
                  <span><b style={{ color: t.text }}>Regions:</b> {agentConfig.regions.join(', ')}</span>
                </div>
                {agentConfig.alerts.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {agentConfig.alerts.map(a => (
                      <span key={a} style={{ padding: '2px 6px', borderRadius: '8px', background: 'rgba(0,212,187,0.12)', color: '#00D4BB', fontSize: '9px', fontWeight: '600' }}>
                        {a === 'qoq' ? 'QoQ' : a.charAt(0).toUpperCase() + a.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: t.card, borderRadius: '12px', padding: '16px', transition: tr, border: `1.5px dashed ${t.inputBorder}`, textAlign: 'center', boxShadow: t.shadow }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>🤖</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '8px' }}>No agent configured</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleOnboardingComplete(NICKELODEON_CONFIG)}
                    style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #FF6F00, #FF9100)', color: '#fff', cursor: 'pointer' }}
                  >🟢 Nickelodeon Demo</button>
                  <button
                    onClick={() => setOnboardingOpen(true)}
                    style={{ padding: '8px 12px', border: `1.5px solid ${t.inputBorder}`, borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: 'transparent', color: t.textSub, cursor: 'pointer' }}
                  >✨ Custom Agent</button>
                </div>
              </div>
            )}

            {/* Activity Feed */}
            {agentActive && activities.length > 0 && (
              <div style={{ background: t.card, borderRadius: '12px', padding: '16px', transition: tr, boxShadow: t.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: t.textSub }}>AGENT ACTIVITY</div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: t.textSub, marginLeft: 'auto', opacity: 0.6 }}>THIS WEEK</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '140px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activities.map((a) => (
                      <div key={a.id} style={{
                        fontSize: '11px', lineHeight: '1.4',
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: t.textSub, opacity: 0.5, minWidth: '24px', flexShrink: 0, paddingTop: '1px' }}>{a.day}</span>
                        <span style={{
                          flex: 1, paddingLeft: '8px',
                          borderLeft: `2px solid ${a.type === 'anomaly' ? (t.warn?.border || '#d97706') : a.type === 'trend' ? '#10b981' : t.inputBorder}`,
                          color: a.type === 'anomaly' ? (t.warn?.title || '#fbbf24') : a.type === 'trend' ? '#10b981' : t.textSub,
                          fontWeight: a.type === 'scan' ? '400' : '600',
                        }}>
                          {a.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  {activities.length > 5 && (
                    <>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(transparent, ${t.card})`, pointerEvents: 'none' }} />
                      <button onClick={() => setActivityModalOpen(true)} style={{ display: 'block', width: '100%', marginTop: '8px', padding: '6px', background: 'none', border: 'none', fontSize: '11px', color: '#00D4BB', cursor: 'pointer', fontWeight: '600', textAlign: 'center' }}>
                        View all activity ({activities.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Alerts */}
            <div style={{ background: t.card, borderRadius: '12px', padding: '16px', transition: tr, boxShadow: t.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: t.textSub }}>
                  {agentConfig ? 'FORECASTS' : 'TREND FORECASTS'}
                </div>
                {allPersonalizedAlerts && allPersonalizedAlerts.length > 3 && (
                  <button onClick={() => setAlertsModalOpen(true)} style={{ fontSize: '11px', color: '#00D4BB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    View all ({allPersonalizedAlerts.length})
                  </button>
                )}
              </div>
              {(personalizedAlerts || [
                { severity: 'warn', icon: '⚠️', title: 'Anomaly Detected', body: 'LEGO saw unexpected 35% drop in West Coast', time: 'Just now' },
                { severity: 'up',   icon: '📈', title: 'Trending Up',       body: 'Healthy snacks +15% YoY', time: '5m ago' },
                { severity: 'new',  icon: '🔔', title: 'New Pattern',       body: 'Gender gap narrowing for LEGO', time: '12m ago' },
              ]).map((alert, i, arr) => {
                const { severity, icon, title, body, spark } = alert;
                const s = t[severity === 'warn' ? 'warn' : severity === 'up' ? 'up' : 'new'];
                return (
                  <div key={`${title}-${i}`} className="alert-card" onClick={() => { if (alert.chartData) { setAlertDetail(alert); setModelDetailsOpen(false); } }} style={{ padding: '12px', background: s.bg, borderRadius: '10px', borderLeft: `3px solid ${s.border}`, marginBottom: i < arr.length - 1 ? '10px' : 0, transition: tr, cursor: alert.chartData ? 'pointer' : 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: s.title }}>{icon} {title}</div>
                        <div style={{ fontSize: '11px', color: s.text }}>{body}</div>
                      </div>
                      {spark && <Sparkline data={spark} color={severity === 'warn' ? s.border : '#10b981'} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom spacer for FAB */}
            <div style={{ height: '70px', flexShrink: 0 }} />
          </div>
        )}

        {/* Dashboard Strip — Agent Profile + Activity Feed + Alerts (desktop only) */}
        {!isMobile && (
          <div className="top-strip" style={{ marginBottom: '24px' }}>
            {/* Agent Profile Card */}
            {agentConfig ? (
              <div style={{ background: t.card, borderRadius: '16px', padding: '16px', boxShadow: t.shadow, transition: tr, border: '1.5px solid rgba(0,212,187,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>YOUR AGENT</div>
                  <button onClick={() => setOnboardingOpen(true)} style={{ fontSize: '11px', color: '#00D4BB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4BB,#00E5CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🤖</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{agentConfig.name}</div>
                    <div style={{ fontSize: '11px', color: t.textSub }}>{agentConfig.role} · {agentConfig.company}</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: t.textSub, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><span style={{ color: t.text, fontWeight: '600' }}>Tracking: </span>{agentConfig.categories.join(' & ')}</div>
                  <div><span style={{ color: t.text, fontWeight: '600' }}>Ages: </span>{agentConfig.ageGroups.map(a => a.split(' ')[0]).join(', ')}</div>
                  <div><span style={{ color: t.text, fontWeight: '600' }}>Regions: </span>{agentConfig.regions.join(', ')}</div>
                  {agentConfig.alerts.length > 0 && (
                    <div style={{ marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {agentConfig.alerts.map(a => (
                        <span key={a} style={{ padding: '2px 6px', borderRadius: '8px', background: 'rgba(0,212,187,0.12)', color: '#00D4BB', fontSize: '9px', fontWeight: '600' }}>
                          {a === 'qoq' ? 'QoQ' : a.charAt(0).toUpperCase() + a.slice(1)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: t.card, borderRadius: '16px', padding: '16px', boxShadow: t.shadow, transition: tr, border: `1.5px dashed ${t.inputBorder}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🤖</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>No agent configured</div>
                <div style={{ fontSize: '11px', color: t.textSub, marginBottom: '12px' }}>Set up your agent to get tailored insights.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => handleOnboardingComplete(NICKELODEON_CONFIG)}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                      background: 'linear-gradient(135deg, #FF6F00, #FF9100)', color: '#fff', cursor: 'pointer', transition: tr,
                    }}
                  >
                    Try Nickelodeon Demo
                  </button>
                  <button
                    onClick={() => setOnboardingOpen(true)}
                    style={{
                      padding: '8px 12px', border: `1.5px solid ${t.inputBorder}`, borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                      background: 'transparent', color: '#00D4BB', cursor: 'pointer', transition: tr,
                    }}
                  >
                    Custom Agent +
                  </button>
                </div>
              </div>
            )}

            {/* Agent Activity Feed */}
            <div style={{ background: t.card, borderRadius: '16px', padding: '16px', boxShadow: t.shadow, transition: tr }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AGENT ACTIVITY</div>
                {agentActive && <div style={{ fontSize: '10px', fontWeight: '600', color: t.textSub, opacity: 0.6 }}>THIS WEEK</div>}
              </div>
              {activities.length > 0 ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ maxHeight: '160px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activities.map((a) => (
                      <div key={a.id} className="activity-entry" style={{
                        fontSize: '11px', lineHeight: '1.4',
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: t.textSub, opacity: 0.5, minWidth: '24px', flexShrink: 0, paddingTop: '1px' }}>{a.day}</span>
                        <span style={{
                          flex: 1, paddingLeft: '8px',
                          borderLeft: `2px solid ${
                            a.type === 'anomaly' ? (t.warn?.border || '#d97706') :
                            a.type === 'trend' ? '#10b981' :
                            a.type === 'complete' ? '#00D4BB' :
                            t.inputBorder
                          }`,
                          color: a.type === 'anomaly' ? (t.warn?.title || '#fbbf24') :
                                 a.type === 'trend' ? '#10b981' :
                                 a.type === 'complete' ? '#00D4BB' :
                                 t.textSub,
                          fontWeight: a.type === 'scan' ? '400' : '600',
                          opacity: a.type === 'scan' ? 0.7 : 1,
                        }}>
                          {a.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  {activities.length > 5 && (
                    <>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(transparent, ${t.card})`, pointerEvents: 'none' }} />
                      <button onClick={() => setActivityModalOpen(true)} style={{ display: 'block', width: '100%', marginTop: '8px', padding: '6px', background: 'none', border: 'none', fontSize: '11px', color: '#00D4BB', cursor: 'pointer', fontWeight: '600', textAlign: 'center' }}>
                        View all activity ({activities.length})
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: t.textSub, opacity: 0.5, textAlign: 'center', padding: '16px 0' }}>
                  Set up an agent to see live activity
                </div>
              )}
            </div>

            {/* Agent Alerts */}
            <div style={{ background: t.card, borderRadius: '16px', padding: '16px', boxShadow: t.shadow, transition: tr }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {agentConfig ? 'FORECASTS' : 'TREND FORECASTS'}
                </div>
                {allPersonalizedAlerts && allPersonalizedAlerts.length > 3 && (
                  <button onClick={() => setAlertsModalOpen(true)} style={{ fontSize: '11px', color: '#00D4BB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    View all ({allPersonalizedAlerts.length})
                  </button>
                )}
              </div>
              {(personalizedAlerts || [
                { severity: 'warn', icon: '⚠️', title: 'Anomaly Detected', body: 'LEGO saw unexpected 35% drop in West Coast', time: 'Just now' },
                { severity: 'up',   icon: '📈', title: 'Trending Up',       body: 'Healthy snacks +15% YoY', time: '5m ago' },
                { severity: 'new',  icon: '🔔', title: 'New Pattern',       body: 'Gender gap narrowing for LEGO', time: '12m ago' },
              ]).map((alert, i, arr) => {
                const { severity, icon, title, body, spark } = alert;
                const s = t[severity === 'warn' ? 'warn' : severity === 'up' ? 'up' : 'new'];
                return (
                  <div key={`${title}-${i}`} onClick={() => { if (alert.chartData) { setAlertDetail(alert); setModelDetailsOpen(false); } }} style={{ padding: '10px', background: s.bg, borderRadius: '10px', borderLeft: `3px solid ${s.border}`, marginBottom: i < arr.length - 1 ? '8px' : 0, transition: tr, cursor: alert.chartData ? 'pointer' : 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: s.title }}>{icon} {title}</div>
                        <div style={{ fontSize: '11px', color: s.text }}>{body}</div>
                      </div>
                      {spark && <Sparkline data={spark} color={severity === 'warn' ? s.border : '#10b981'} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat (desktop: inline, mobile: hidden — shown in overlay) */}
        {!isMobile && <div className="chat-panel" style={{ background: t.card, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: t.shadow, transition: tr }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: '16px', maxWidth: '80%',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #00D4BB, #00E5CC)' : t.msgBg,
                    color: msg.role === 'user' ? '#fff' : t.msgText,
                    fontSize: '14px', lineHeight: '1.6', transition: tr
                  }}>
                    {msg.displayText}
                    {msg.streaming && (
                      <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#00D4BB', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 0.7s step-end infinite' }} />
                    )}
                    {!msg.streaming && msg.chart && (
                      <ChartBlock chart={msg.chart} darkMode={darkMode} />
                    )}
                    {!msg.streaming && msg.followUps && msg.followUps.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {msg.followUps.map(id => {
                          const followUp = getResponseById(id);
                          if (!followUp) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => handleFollowUp(followUp)}
                              style={{
                                padding: '6px 12px',
                                background: darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)',
                                border: `1px solid ${darkMode ? 'rgba(0,212,187,0.3)' : 'rgba(0,212,187,0.2)'}`,
                                borderRadius: '8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: '#00D4BB',
                                transition: tr
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.2)' : 'rgba(0,212,187,0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)'}
                            >
                              {followUp.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: t.textSub, marginBottom: '8px', fontWeight: '600', transition: tr }}>Try asking:</div>
                <div className="suggested-grid">
                  {(personalizedSuggestions || [
                    'What are the top toys this quarter?',
                    'How have toy trends changed over 25 years?',
                    "Tell me about LEGO's history",
                    'How do regions compare?',
                    'What spikes during the holidays?'
                  ]).map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(question)}
                      style={{ padding: '10px 14px', background: t.suggestBg, border: `1px solid ${t.suggestBorder}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', color: t.suggestText, transition: tr }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#00E5CC'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = t.suggestBorder}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about trends, preferences, or patterns..."
                style={{ flex: 1, padding: '14px', border: `2px solid ${t.inputBorder}`, borderRadius: '12px', fontSize: '14px', outline: 'none', background: t.inputBg, color: t.inputText, transition: tr }}
              />
              <button
                onClick={() => handleSend()}
                disabled={streamingIndex !== null}
                style={{
                  padding: '14px 24px',
                  background: streamingIndex !== null ? (darkMode ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #00D4BB, #00E5CC)',
                  color: streamingIndex !== null ? t.textSub : '#fff',
                  border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                  cursor: streamingIndex !== null ? 'not-allowed' : 'pointer', transition: tr
                }}
              >Send</button>
            </div>
          </div>}


        {/* Floating Chat Button (mobile only) */}
        {isMobile && !statsOpen && (
          <button
            onClick={() => setStatsOpen(true)}
            style={{
              position: 'fixed', bottom: '20px', right: '20px', zIndex: 50,
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4BB, #00E5CC)',
              border: 'none', boxShadow: '0 4px 20px rgba(0,212,187,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', cursor: 'pointer',
            }}
          >💬</button>
        )}

        {/* Chat Overlay (mobile only) */}
        {isMobile && statsOpen && (
          <>
            <div className="stats-overlay-backdrop" onClick={() => setStatsOpen(false)} />
            <div className="stats-overlay" style={{ background: t.card, boxShadow: '0 -4px 30px rgba(0,0,0,0.3)', transition: tr, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div className="stats-overlay-close">
                <span style={{ fontSize: '16px', fontWeight: '700', color: t.text }}>Chat</span>
                <button onClick={() => setStatsOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: t.textSub, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
              </div>

              {/* Chat messages */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '14px' }}>
                    <div style={{
                      maxWidth: '85%', padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #00D4BB, #00E5CC)' : t.msgBg,
                      color: msg.role === 'user' ? '#fff' : t.text, fontSize: '13px', lineHeight: '1.5', transition: tr
                    }}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.streaming ? msg.text.substring(0, msg.visibleChars) + (msg.visibleChars < msg.text.length ? '▌' : '') : msg.text}
                      </div>
                      {msg.chart && !msg.streaming && (
                        <div style={{ marginTop: '12px' }}><ChartBlock chart={msg.chart} darkMode={darkMode} /></div>
                      )}
                      {!msg.streaming && msg.followUps && msg.followUps.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {msg.followUps.map(id => {
                            const followUp = getResponseById(id);
                            if (!followUp) return null;
                            return (
                              <button key={id} onClick={() => handleFollowUp(followUp)}
                                style={{ padding: '6px 12px', background: darkMode ? 'rgba(0,212,187,0.1)' : 'rgba(0,212,187,0.08)', border: `1px solid ${darkMode ? 'rgba(0,212,187,0.3)' : 'rgba(0,212,187,0.2)'}`, borderRadius: '8px', fontSize: '11px', cursor: 'pointer', color: '#00D4BB' }}
                              >{followUp.label}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions (if first message only) */}
              {messages.length === 1 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: t.textSub, marginBottom: '8px', fontWeight: '600' }}>Try asking:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(personalizedSuggestions || [
                      'What are the top toys this quarter?',
                      'How have toy trends changed over 25 years?',
                      "Tell me about LEGO's history",
                    ]).slice(0, 3).map((question, i) => (
                      <button key={i} onClick={() => handleSend(question)}
                        style={{ padding: '10px 14px', background: t.suggestBg, border: `1px solid ${t.suggestBorder}`, borderRadius: '10px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', color: t.suggestText }}
                      >{question}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about trends..."
                  style={{ flex: 1, padding: '12px', border: `2px solid ${t.inputBorder}`, borderRadius: '12px', fontSize: '14px', outline: 'none', background: t.inputBg, color: t.inputText }}
                />
                <button onClick={() => handleSend()} disabled={streamingIndex !== null}
                  style={{ padding: '12px 18px', background: streamingIndex !== null ? (darkMode ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #00D4BB, #00E5CC)', color: streamingIndex !== null ? t.textSub : '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: streamingIndex !== null ? 'not-allowed' : 'pointer' }}
                >Send</button>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Alert Detail Modal */}
      {alertDetail && (() => {
        const { icon, title, body, severity, chartData, ml } = alertDetail;
        const color = severity === 'warn' ? '#f59e0b' : '#10b981';
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div onClick={() => setAlertDetail(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', zIndex: 1, background: t.card, borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '85vh', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>{icon} {title}</div>
                    <div style={{ fontSize: '13px', color: t.textSub }}>{body}</div>
                  </div>
                  <button onClick={() => setAlertDetail(null)} style={{ background: 'none', border: 'none', fontSize: '20px', color: t.textSub, cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}>✕</button>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                {/* Chart */}
                {chartData && (
                  <div style={{ background: t.msgBg, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TREND & FORECAST</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: t.textSub }}>
                          <span style={{ width: '12px', height: '2px', background: color, display: 'inline-block', borderRadius: '1px' }} /> Actual
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: t.textSub }}>
                          <span style={{ width: '12px', height: '2px', background: color, display: 'inline-block', borderRadius: '1px', opacity: 0.4 }} /> Projected
                        </span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="alertGradActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="alertGradProjected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.inputBorder} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: t.textSub }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: t.textSub }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.inputBorder}`, borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="actual" stroke={color} strokeWidth={2.5} fill="url(#alertGradActual)" dot={{ r: 3, fill: color }} connectNulls={false} />
                        <Area type="monotone" dataKey="projected" stroke={color} strokeWidth={2} strokeDasharray="6 4" fill="url(#alertGradProjected)" dot={{ r: 3, fill: color, strokeDasharray: '' }} connectNulls={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ML Model Info */}
                {ml && (
                  <>
                    {/* Supporting Factors */}
                    <div style={{ background: t.msgBg, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>KEY FACTORS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ml.factors.map((factor, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '5px' }} />
                            <div style={{ fontSize: '12px', color: t.text, lineHeight: '1.5' }}>{factor}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Model Details (collapsible) */}
                    <div style={{ background: t.msgBg, borderRadius: '12px', overflow: 'hidden' }}>
                      <button onClick={() => setModelDetailsOpen(o => !o)} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MODEL DETAILS</span>
                        <span style={{ fontSize: '12px', color: t.textSub, transition: 'transform 0.2s', transform: modelDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                      </button>
                      {modelDetailsOpen && (
                        <div style={{ padding: '0 16px 16px' }}>
                          {/* Metrics row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            {[
                              { label: 'Confidence', value: `${ml.confidence}%`, color: ml.confidence >= 85 ? '#10b981' : ml.confidence >= 75 ? '#f59e0b' : '#ef4444' },
                              { label: 'R² Score', value: ml.r2.toFixed(2), color: '#00D4BB' },
                              { label: 'MAE', value: `±${ml.mae}`, color: t.textSub },
                              { label: 'Training Data', value: ml.trainSize, color: t.textSub },
                            ].map(({ label, value, color: metricColor }) => (
                              <div key={label} style={{ background: t.card, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: metricColor }}>{value}</div>
                                <div style={{ fontSize: '9px', fontWeight: '600', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{label}</div>
                              </div>
                            ))}
                          </div>
                          {/* Algorithm info */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: t.textSub }}>Algorithm</span>
                              <span style={{ color: t.text, fontWeight: '600' }}>{ml.model}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: t.textSub }}>Training Period</span>
                              <span style={{ color: t.text, fontWeight: '600' }}>{ml.trainRange}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: t.textSub }}>Data Points</span>
                              <span style={{ color: t.text, fontWeight: '600' }}>{ml.trainSize} ({(parseInt(ml.trainSize) * 27).toLocaleString()}+ responses)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Alerts Modal */}
      {activityModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={() => setActivityModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 1, background: t.card, borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: t.text, margin: 0 }}>Agent Activity — This Week</h2>
                <button onClick={() => setActivityModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: t.textSub, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.map((a) => (
                  <div key={a.id} style={{
                    fontSize: '13px', lineHeight: '1.5',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: t.textSub, opacity: 0.5, minWidth: '28px', flexShrink: 0, paddingTop: '3px' }}>{a.day}</span>
                    <span style={{
                      flex: 1, paddingLeft: '10px', padding: '8px 12px 8px 10px',
                      borderLeft: `2px solid ${
                        a.type === 'anomaly' ? (t.warn?.border || '#d97706') :
                        a.type === 'trend' ? '#10b981' :
                        a.type === 'complete' ? '#00D4BB' :
                        t.inputBorder
                      }`,
                      color: a.type === 'anomaly' ? (t.warn?.title || '#fbbf24') :
                             a.type === 'trend' ? '#10b981' :
                             a.type === 'complete' ? '#00D4BB' :
                             t.textSub,
                      fontWeight: a.type === 'scan' ? '400' : '600',
                      opacity: a.type === 'scan' ? 0.7 : 1,
                      background: t.suggestBg, borderRadius: '0 8px 8px 0',
                    }}>
                      {a.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {alertsModalOpen && (() => {
        const allAlerts = allPersonalizedAlerts || [
          { severity: 'warn', icon: '⚠️', title: 'Anomaly Detected', body: 'LEGO saw unexpected 35% drop in West Coast', time: 'Just now' },
          { severity: 'up',   icon: '📈', title: 'Trending Up',       body: 'Healthy snacks +15% YoY', time: '5m ago' },
          { severity: 'new',  icon: '🔔', title: 'New Pattern',       body: 'Gender gap narrowing for LEGO', time: '12m ago' },
        ];
        const regularAlerts = allAlerts.filter(a => !a.forecast);
        const forecastAlerts = allAlerts.filter(a => a.forecast);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div onClick={() => setAlertsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', zIndex: 1, background: t.card, borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: t.text, margin: 0 }}>
                    {agentConfig ? 'All Forecasts' : 'All Trend Forecasts'}
                  </h2>
                  <button onClick={() => setAlertsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: t.textSub, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                {/* Regular Alerts */}
                <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>ALERTS</div>
                {regularAlerts.map((alert, i) => {
                  const { severity, icon, title, body, time, spark } = alert;
                  const s = t[severity === 'warn' ? 'warn' : severity === 'up' ? 'up' : 'new'];
                  return (
                    <div key={`alert-${i}`} onClick={() => { if (alert.chartData) { setAlertsModalOpen(false); setAlertDetail(alert); setModelDetailsOpen(false); } }} style={{ padding: '12px', background: s.bg, borderRadius: '10px', borderLeft: `3px solid ${s.border}`, marginBottom: '8px', transition: tr, cursor: alert.chartData ? 'pointer' : 'default' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: s.title }}>{icon} {title}</div>
                          <div style={{ fontSize: '11px', color: s.text }}>{body}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {spark && <Sparkline data={spark} color={severity === 'warn' ? s.border : '#10b981'} />}
                          {time && <div style={{ fontSize: '10px', color: s.text, opacity: 0.7 }}>{time}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Forecasts */}
                {forecastAlerts.length > 0 && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '16px', marginBottom: '10px' }}>🔮 FORECASTS</div>
                    {forecastAlerts.map((alert, i) => {
                      const { icon, title, body, spark } = alert;
                      const s = t.up;
                      return (
                        <div key={`forecast-${i}`} onClick={() => { if (alert.chartData) { setAlertsModalOpen(false); setAlertDetail(alert); setModelDetailsOpen(false); } }} style={{ padding: '12px', background: s.bg, borderRadius: '10px', borderLeft: `3px solid ${s.border}`, marginBottom: '8px', transition: tr, cursor: alert.chartData ? 'pointer' : 'default' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: s.title }}>{icon} {title}</div>
                              <div style={{ fontSize: '11px', color: s.text }}>{body}</div>
                            </div>
                            {spark && <Sparkline data={spark} color="#10b981" forecast width={80} height={28} />}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {onboardingOpen && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={() => setOnboardingOpen(false)}
          existing={agentConfig}
          darkMode={darkMode}
          t={t}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <KidSayDemo />
    </PasswordGate>
  );
}
