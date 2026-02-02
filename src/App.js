import React, { useState } from 'react';

export default function KidSayDemo() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI analytics assistant. Ask me about toy and snack trends!" }
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, 
      { role: 'user', text: input },
      { role: 'assistant', text: "Based on 25 years of data, the top toys for Q4 2025 are LEGO (68% popularity), Hot Wheels (62%), and Squishmallows (59%). LEGO increased 12% from last quarter!" }
    ]);
    setInput('');
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #00D4BB, #00E5CC)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>🎯</div>
            <div>
              <h1 style={{ 
                fontSize: '26px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00D4BB, #00E5CC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>KidSay Analytics AI</h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                25 years of survey data • Powered by GPT-5 Nano
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          
          {/* Chat */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    maxWidth: '80%',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #00D4BB, #00E5CC)'
                      : '#f8fafc',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                  Try asking:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    'What are the top toys this quarter?',
                    'Show me healthy snack trends',
                    'Compare boys vs girls toy preferences',
                    'What changed from last quarter?'
                  ].map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(question)}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#475569',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.borderColor = '#00E5CC'}
                      onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about trends, preferences, or patterns..."
                style={{
                  flex: 1,
                  padding: '14px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #00D4BB, #00E5CC)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >Send</button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Stats */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '14px' }}>
                QUICK STATS
              </div>
              <div style={{ fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Data Range</span>
                  <strong>Q1 2000 - Q4 2025</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Total Quarters</span>
                  <strong>104</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Products Tracked</span>
                  <strong>2,847</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Responses</span>
                  <strong>1.2M+</strong>
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '14px' }}>
                RECENT INSIGHTS
              </div>
              <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '10px', borderLeft: '3px solid #f59e0b', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>⚠️ Anomaly Detected</div>
                <div style={{ fontSize: '11px', color: '#78350f' }}>LEGO saw unexpected 35% drop in West Coast</div>
              </div>
              <div style={{ padding: '12px', background: '#d1fae5', borderRadius: '10px', borderLeft: '3px solid #10b981', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>📈 Trending Up</div>
                <div style={{ fontSize: '11px', color: '#064e3b' }}>Healthy snacks +15% YoY</div>
              </div>
              <div style={{ padding: '12px', background: '#d1fae5', borderRadius: '10px', borderLeft: '3px solid #00E5CC' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>🔔 New Pattern</div>
                <div style={{ fontSize: '11px', color: '#064e3b' }}>Gender gap narrowing for LEGO</div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Work */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          marginTop: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%',
              padding: '24px 32px',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>🚀</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Future Work</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Advanced features planned for Phase 5+</div>
              </div>
            </div>
            <div style={{ fontSize: '24px', color: '#64748b' }}>{expanded ? '▲' : '▼'}</div>
          </button>

          {expanded && (
            <div style={{ padding: '0 32px 32px' }}>
              <div style={{ padding: '16px 20px', background: '#fffbeb', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                  📋 Based on Phase 4 Validation
                </div>
                <div style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.6' }}>
                  These features will be evaluated and prioritized based on customer feedback and usage data from the initial rollout.
                </div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { icon: '🔔', title: 'Automated Anomaly Detection', desc: 'Daily monitoring + quarterly analysis', cost: '+$110-170/month' },
                  { icon: '📈', title: 'Predictive Forecasting', desc: 'ML models for trend prediction', cost: 'Included' },
                  { icon: '🎯', title: 'Segment Comparison Tool', desc: 'Statistical analysis with AI explanations', cost: 'Included' },
                  { icon: '📊', title: 'Natural Language Charts', desc: 'Custom visualizations on demand', cost: 'Included' },
                  { icon: '💬', title: 'Slack & Teams Notifications', desc: 'Real-time alerts and reports delivered to Slack channels or Microsoft Teams', cost: 'Included' },
                  { icon: '📧', title: 'Automated Reports & Alerts', desc: 'Weekly/monthly email digests with trend summaries', cost: 'Included' }
                ].map((feature, i) => (
                  <div key={i} style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}>
                    <div style={{ fontSize: '28px' }}>{feature.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                          {feature.title}
                        </h3>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: feature.cost.includes('+') ? '#fee2e2' : '#f0fdf4',
                          color: feature.cost.includes('+') ? '#991b1b' : '#166534'
                        }}>
                          {feature.cost}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
