import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  AreaChart, Area
} from 'recharts';

const RESPONSES = {
  toys: {
    text: "Based on 25 years of data, here are the top toys for Q4 2025. LEGO leads with 68% popularity, up 12% from last quarter!",
    chart: {
      type: 'bar',
      title: 'Top Toys Q4 2025 — Popularity %',
      dataKey: 'value',
      data: [
        { name: 'LEGO', value: 68 },
        { name: 'Hot Wheels', value: 62 },
        { name: 'Squishmallows', value: 59 },
        { name: 'Barbie', value: 54 },
        { name: 'Nerf', value: 48 },
      ]
    }
  },
  snacks: {
    text: "Healthy snacks are trending strongly with +15% YoY growth. Here's the popularity trend over the last 4 quarters:",
    chart: {
      type: 'line',
      title: 'Healthy Snack Popularity (% of respondents)',
      dataKey: 'value',
      data: [
        { name: 'Q1 2025', value: 41 },
        { name: 'Q2 2025', value: 45 },
        { name: 'Q3 2025', value: 49 },
        { name: 'Q4 2025', value: 56 },
      ]
    }
  },
  gender: {
    text: "The gender gap for LEGO has been narrowing significantly. Girls' interest has grown from 42% to 65% over three years, while boys' remained relatively stable.",
    chart: {
      type: 'grouped-bar',
      title: 'LEGO Popularity by Gender',
      bars: [
        { key: 'boys', color: '#60a5fa' },
        { key: 'girls', color: '#f472b6' },
      ],
      data: [
        { name: 'Q4 2022', boys: 78, girls: 42 },
        { name: 'Q4 2023', boys: 75, girls: 51 },
        { name: 'Q4 2024', boys: 72, girls: 59 },
        { name: 'Q4 2025', boys: 70, girls: 65 },
      ]
    }
  },
  quarter: {
    text: "Comparing Q3 vs Q4 2025 across top products — LEGO had the biggest jump (+12%), while Barbie and Nerf both dipped slightly.",
    chart: {
      type: 'grouped-bar',
      title: 'Q3 vs Q4 2025 Popularity %',
      bars: [
        { key: 'Q3 2025', color: '#94a3b8' },
        { key: 'Q4 2025', color: '#00D4BB' },
      ],
      data: [
        { name: 'LEGO', 'Q3 2025': 56, 'Q4 2025': 68 },
        { name: 'Hot Wheels', 'Q3 2025': 60, 'Q4 2025': 62 },
        { name: 'Squishmallows', 'Q3 2025': 55, 'Q4 2025': 59 },
        { name: 'Barbie', 'Q3 2025': 57, 'Q4 2025': 54 },
        { name: 'Nerf', 'Q3 2025': 52, 'Q4 2025': 48 },
      ]
    }
  },
  default: {
    text: "Based on 25 years of data, the top toys for Q4 2025 are LEGO (68% popularity), Hot Wheels (62%), and Squishmallows (59%). LEGO increased 12% from last quarter!",
  }
};

function getResponse(input) {
  const q = input.toLowerCase();
  if (q.includes('toy') || q.includes('popular')) return RESPONSES.toys;
  if (q.includes('snack') || q.includes('food') || q.includes('healthy')) return RESPONSES.snacks;
  if (q.includes('gender') || q.includes('boy') || q.includes('girl')) return RESPONSES.gender;
  if (q.includes('quarter') || q.includes('changed') || q.includes('last')) return RESPONSES.quarter;
  return RESPONSES.default;
}

function ChartBlock({ chart, darkMode }) {
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
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4BB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4BB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={chart.dataKey} stroke="#00D4BB" strokeWidth={2} fill="url(#areaGradient)" dot={{ fill: '#00D4BB', r: 4 }} />
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

export default function KidSayDemo() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI analytics assistant. Ask me about toy and snack trends!", displayText: "Hi! I'm your AI analytics assistant. Ask me about toy and snack trends!", streaming: false }
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [streamingIndex, setStreamingIndex] = useState(null);
  const [streamingPos, setStreamingPos] = useState(0);
  const messagesEndRef = useRef(null);

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

  const handleSend = () => {
    if (!input.trim() || streamingIndex !== null) return;
    const response = getResponse(input);
    const userMsg = { role: 'user', text: input, displayText: input, streaming: false };
    const assistantMsg = { role: 'assistant', text: response.text, chart: response.chart, displayText: '', streaming: true };
    setMessages(prev => {
      const updated = [...prev, userMsg, assistantMsg];
      setStreamingIndex(updated.length - 1);
      setStreamingPos(0);
      return updated;
    });
    setInput('');
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
    featureBg: '#0f172a',
    featureBorder: '#334155',
    toggleBg: '#334155',
    toggleText: '#f1f5f9',
    warn: { bg: '#451a03', border: '#d97706', title: '#fbbf24', text: '#fcd34d' },
    up:   { bg: '#052e16', border: '#10b981', title: '#34d399', text: '#6ee7b7' },
    new:  { bg: '#052e16', border: '#00E5CC', title: '#34d399', text: '#6ee7b7' },
    phaseBg: '#451a03', phaseTitle: '#fbbf24', phaseText: '#fcd34d',
    costExtra: { bg: '#450a0a', color: '#fca5a5' },
    costFree:  { bg: '#052e16', color: '#86efac' },
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
    featureBg: '#f8fafc',
    featureBorder: '#e2e8f0',
    toggleBg: '#e2e8f0',
    toggleText: '#1e293b',
    warn: { bg: '#fef3c7', border: '#f59e0b', title: '#92400e', text: '#78350f' },
    up:   { bg: '#d1fae5', border: '#10b981', title: '#065f46', text: '#064e3b' },
    new:  { bg: '#d1fae5', border: '#00E5CC', title: '#065f46', text: '#064e3b' },
    phaseBg: '#fffbeb', phaseTitle: '#92400e', phaseText: '#78350f',
    costExtra: { bg: '#fee2e2', color: '#991b1b' },
    costFree:  { bg: '#f0fdf4', color: '#166534' },
  };

  const tr = 'background 0.3s, color 0.3s, border-color 0.3s';

  return (
    <div className="outer-padding" style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: t.outerBg, transition: tr }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div className="header-card" style={{ background: t.card, borderRadius: '20px', marginBottom: '24px', boxShadow: t.shadow, transition: tr }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #00D4BB, #00E5CC)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎯</div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', background: 'linear-gradient(135deg, #00D4BB, #00E5CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>KidSay Analytics AI</h1>
                <p style={{ fontSize: '13px', color: t.textSub, margin: '2px 0 0', transition: tr }}>25 years of survey data • Powered by GPT-5 Nano</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ padding: '10px 16px', background: t.toggleBg, color: t.toggleText, border: 'none', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', transition: tr, lineHeight: 1 }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-grid">

          {/* Chat */}
          <div className="chat-panel" style={{ background: t.card, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: t.shadow, transition: tr }}>
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
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: t.textSub, marginBottom: '8px', fontWeight: '600', transition: tr }}>Try asking:</div>
                <div className="suggested-grid">
                  {[
                    'What are the top toys this quarter?',
                    'Show me healthy snack trends',
                    'Compare boys vs girls toy preferences',
                    'What changed from last quarter?'
                  ].map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(question)}
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
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about trends, preferences, or patterns..."
                style={{ flex: 1, padding: '14px', border: `2px solid ${t.inputBorder}`, borderRadius: '12px', fontSize: '14px', outline: 'none', background: t.inputBg, color: t.inputText, transition: tr }}
              />
              <button
                onClick={handleSend}
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
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: t.card, borderRadius: '16px', padding: '20px', boxShadow: t.shadow, transition: tr }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: t.textSub, marginBottom: '14px', transition: tr }}>QUICK STATS</div>
              <div style={{ fontSize: '13px', color: t.textSub, transition: tr }}>
                {[['Data Range', 'Q1 2000 - Q4 2025'], ['Total Quarters', '104'], ['Products Tracked', '2,847'], ['Total Responses', '1.2M+']].map(([label, value], i, arr) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < arr.length - 1 ? '10px' : 0 }}>
                    <span>{label}</span>
                    <strong style={{ color: t.text, transition: tr }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: t.card, borderRadius: '16px', padding: '20px', boxShadow: t.shadow, transition: tr }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: t.textSub, marginBottom: '14px', transition: tr }}>RECENT INSIGHTS</div>
              {[
                { s: t.warn, icon: '⚠️', title: 'Anomaly Detected', body: 'LEGO saw unexpected 35% drop in West Coast' },
                { s: t.up,   icon: '📈', title: 'Trending Up',       body: 'Healthy snacks +15% YoY' },
                { s: t.new,  icon: '🔔', title: 'New Pattern',       body: 'Gender gap narrowing for LEGO' },
              ].map(({ s, icon, title, body }, i, arr) => (
                <div key={title} style={{ padding: '12px', background: s.bg, borderRadius: '10px', borderLeft: `3px solid ${s.border}`, marginBottom: i < arr.length - 1 ? '10px' : 0, transition: tr }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: s.title, transition: tr }}>{icon} {title}</div>
                  <div style={{ fontSize: '11px', color: s.text, transition: tr }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Work */}
        <div style={{ background: t.card, borderRadius: '20px', marginTop: '24px', boxShadow: t.shadow, overflow: 'hidden', transition: tr }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="future-work-toggle"
            style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🚀</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: t.text, transition: tr }}>Future Work</div>
                <div style={{ fontSize: '13px', color: t.textSub, transition: tr }}>Advanced features planned for Phase 5+</div>
              </div>
            </div>
            <div style={{ fontSize: '24px', color: t.textSub, transition: tr }}>{expanded ? '▲' : '▼'}</div>
          </button>

          {expanded && (
            <div className="future-work-body">
              <div style={{ padding: '16px 20px', background: t.phaseBg, borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #f59e0b', transition: tr }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: t.phaseTitle, marginBottom: '4px', transition: tr }}>📋 Based on Phase 4 Validation</div>
                <div style={{ fontSize: '12px', color: t.phaseText, lineHeight: '1.6', transition: tr }}>These features will be evaluated and prioritized based on customer feedback and usage data from the initial rollout.</div>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { icon: '🔔', title: 'Automated Anomaly Detection', desc: 'Daily monitoring + quarterly analysis', cost: '+$110-170/month' },
                  { icon: '📈', title: 'Predictive Forecasting', desc: 'ML models for trend prediction', cost: 'Included' },
                  { icon: '🎯', title: 'Segment Comparison Tool', desc: 'Statistical analysis with AI explanations', cost: 'Included' },
                  { icon: '📊', title: 'Natural Language Charts', desc: 'Custom visualizations on demand', cost: 'Included' },
                  { icon: '💬', title: 'Slack & Teams Notifications', desc: 'Real-time alerts and reports delivered to Slack channels or Microsoft Teams', cost: 'Included' },
                  { icon: '📧', title: 'Automated Reports & Alerts', desc: 'Weekly/monthly email digests with trend summaries', cost: 'Included' }
                ].map((feature, i) => {
                  const cs = feature.cost.includes('+') ? t.costExtra : t.costFree;
                  return (
                    <div key={i} style={{ padding: '20px', background: t.featureBg, borderRadius: '14px', border: `1px solid ${t.featureBorder}`, display: 'flex', alignItems: 'flex-start', gap: '14px', transition: tr }}>
                      <div style={{ fontSize: '28px' }}>{feature.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, margin: 0, transition: tr }}>{feature.title}</h3>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: cs.bg, color: cs.color, transition: tr }}>{feature.cost}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: t.textSub, margin: 0, lineHeight: '1.6', transition: tr }}>{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
