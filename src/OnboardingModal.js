import React, { useState } from 'react';

const STEPS = [
  { id: 'about',    title: 'About You',         icon: '👤' },
  { id: 'focus',    title: 'What to Track',      icon: '🎯' },
  { id: 'audience', title: 'Who to Watch',       icon: '👥' },
  { id: 'alerts',   title: 'Alert Preferences',  icon: '🔔' },
];

const ROLES = ['Buyer', 'Brand Manager', 'Market Researcher', 'Product Development', 'Executive', 'Other'];

const INTERESTS = {
  Toys:   ['Action Figures', 'Building Sets', 'Outdoor Play', 'Arts & Crafts', 'Games & Puzzles', 'Collectibles'],
  Snacks: ['Healthy Snacks', 'Indulgent Snacks', 'Beverages', 'Lunchbox Items'],
};

const AGE_GROUPS = ['Toddlers (0–3)', 'Young Kids (4–7)', 'Tweens (8–12)', 'Teens (13+)'];
const REGIONS    = ['National', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'];
const ALERT_TYPES = [
  { id: 'anomalies',  label: 'Anomaly Detection',        desc: 'Unusual spikes or drops in popularity' },
  { id: 'trends',     label: 'Emerging Trends',           desc: 'Products gaining momentum fast' },
  { id: 'seasonal',   label: 'Seasonal Patterns',         desc: 'Holiday and back-to-school shifts' },
  { id: 'qoq',        label: 'Quarter-over-Quarter',      desc: 'How metrics changed from last period' },
];

function Pill({ label, selected, onClick, t }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '20px',
        border: `1.5px solid ${selected ? '#00D4BB' : t.inputBorder}`,
        background: selected ? 'rgba(0,212,187,0.12)' : t.suggestBg,
        color: selected ? '#00D4BB' : t.suggestText,
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: selected ? '600' : '400',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function OnboardingModal({ onComplete, onClose, existing, darkMode, t }) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(existing || {
    name: '', company: '', role: '',
    categories: [], interests: [],
    ageGroups: [], regions: [], gender: 'all',
    alerts: [],
  });

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  const toggle = (key, val) => setConfig(prev => ({
    ...prev,
    [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
  }));

  // Available interests based on selected categories
  const availableInterests = config.categories.flatMap(c => INTERESTS[c] || []);

  const canProceed = () => {
    if (step === 0) return config.name.trim() && config.company.trim() && config.role;
    if (step === 1) return config.categories.length > 0;
    if (step === 2) return config.ageGroups.length > 0 && config.regions.length > 0;
    return true;
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${t.inputBorder}`,
    borderRadius: '10px', fontSize: '14px',
    background: t.inputBg, color: t.inputText,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '600',
    color: t.textSub, marginBottom: '8px', display: 'block',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  const steps = [
    // Step 0 — About You
    <div key="about" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Your Name</label>
        <input
          style={inputStyle}
          placeholder="e.g. Sarah Chen"
          value={config.name}
          onChange={e => update('name', e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Company</label>
        <input
          style={inputStyle}
          placeholder="e.g. Mattel, Inc."
          value={config.company}
          onChange={e => update('company', e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Your Role</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ROLES.map(r => (
            <Pill key={r} label={r} selected={config.role === r} onClick={() => update('role', r)} t={t} />
          ))}
        </div>
      </div>
    </div>,

    // Step 1 — What to Track
    <div key="focus" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={labelStyle}>Product Category</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Toys', 'Snacks', 'Both'].map(c => {
            const selected = c === 'Both'
              ? config.categories.includes('Toys') && config.categories.includes('Snacks')
              : config.categories.includes(c) && config.categories.length === 1;
            return (
              <Pill
                key={c} label={c} selected={selected} t={t}
                onClick={() => update('categories', c === 'Both' ? ['Toys', 'Snacks'] : [c])}
              />
            );
          })}
        </div>
      </div>
      {availableInterests.length > 0 && (
        <div>
          <label style={labelStyle}>Specific Interests <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableInterests.map(i => (
              <Pill key={i} label={i} selected={config.interests.includes(i)} onClick={() => toggle('interests', i)} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>,

    // Step 2 — Who to Watch
    <div key="audience" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={labelStyle}>Age Groups</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {AGE_GROUPS.map(a => (
            <Pill key={a} label={a} selected={config.ageGroups.includes(a)} onClick={() => toggle('ageGroups', a)} t={t} />
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Regions</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {REGIONS.map(r => (
            <Pill key={r} label={r} selected={config.regions.includes(r)} onClick={() => toggle('regions', r)} t={t} />
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Gender Focus</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['all', 'All'], ['boys', 'Boys skewed'], ['girls', 'Girls skewed']].map(([val, label]) => (
            <Pill key={val} label={label} selected={config.gender === val} onClick={() => update('gender', val)} t={t} />
          ))}
        </div>
      </div>
    </div>,

    // Step 3 — Alerts
    <div key="alerts" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={labelStyle}>What should your agent watch for?</label>
      {ALERT_TYPES.map(a => {
        const selected = config.alerts.includes(a.id);
        return (
          <div
            key={a.id}
            onClick={() => toggle('alerts', a.id)}
            style={{
              padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
              border: `1.5px solid ${selected ? '#00D4BB' : t.inputBorder}`,
              background: selected ? 'rgba(0,212,187,0.08)' : t.suggestBg,
              display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${selected ? '#00D4BB' : t.inputBorder}`,
              background: selected ? '#00D4BB' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#fff',
            }}>
              {selected ? '✓' : ''}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: t.text }}>{a.label}</div>
              <div style={{ fontSize: '12px', color: t.textSub, marginTop: '2px' }}>{a.desc}</div>
            </div>
          </div>
        );
      })}
    </div>,
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: t.card, borderRadius: '24px',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: '3px', background: t.inputBorder }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #00D4BB, #00E5CC)',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: i <= step ? 1 : 0.35, flex: i < STEPS.length - 1 ? 1 : 0,
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: i < step ? '#00D4BB' : i === step ? 'linear-gradient(135deg,#00D4BB,#00E5CC)' : t.inputBorder,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < step ? '14px' : '13px',
                  color: i < step ? '#fff' : i === step ? '#fff' : t.textSub,
                }}>
                  {i < step ? '✓' : s.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: i < step ? '#00D4BB' : t.inputBorder }} />
                )}
              </div>
            ))}
          </div>

          {/* Step title */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 4px' }}>
              {STEPS[step].title}
            </h2>
            <p style={{ fontSize: '13px', color: t.textSub, margin: 0 }}>
              {step === 0 && "Tell us a bit about yourself to personalize your agent."}
              {step === 1 && "Choose the product categories your agent should focus on."}
              {step === 2 && "Define the audience segments most relevant to your work."}
              {step === 3 && "Select the types of signals your agent should surface automatically."}
            </p>
          </div>

          {/* Step content */}
          <div style={{ minHeight: '220px' }}>
            {steps[step]}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <button
              onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              style={{
                padding: '10px 20px', border: `1.5px solid ${t.inputBorder}`,
                borderRadius: '10px', background: 'transparent',
                color: t.textSub, fontSize: '14px', cursor: 'pointer',
              }}
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            <button
              onClick={step === STEPS.length - 1 ? () => onComplete(config) : () => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{
                padding: '10px 24px', border: 'none', borderRadius: '10px',
                background: canProceed() ? 'linear-gradient(135deg,#00D4BB,#00E5CC)' : t.inputBorder,
                color: canProceed() ? '#fff' : t.textSub,
                fontSize: '14px', fontWeight: '700',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {step === STEPS.length - 1 ? '✓ Launch My Agent' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
