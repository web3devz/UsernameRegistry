import { useState } from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import ClaimUsername from './components/ClaimUsername'
import MyUsername from './components/MyUsername'
import LookupUsername from './components/LookupUsername'
import Chat from './components/Chat'
import './App.css'

type Tab = 'my-username' | 'claim' | 'lookup' | 'chat'

export default function App() {
  const account = useCurrentAccount()
  const [tab, setTab] = useState<Tab>('my-username')

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">🏷️</span>
          <div>
            <div className="brand-name">UsernameRegistry</div>
            <div className="brand-sub">Decentralized Identity on OneChain</div>
          </div>
        </div>
        <ConnectButton />
      </header>

      {!account ? (
        <>
          <section className="hero">
            <div className="hero-badge">Built on OneChain Testnet</div>
            <h1>Own Your Username,<br />On-Chain Forever</h1>
            <p className="hero-sub">
              Claim a unique, wallet-owned username. No platform controls it.
              No one can take it away. Just you and the blockchain.
            </p>
            <div className="hero-features">
              <div className="feature"><span className="feature-icon">🔒</span><span>Censorship-Resistant</span></div>
              <div className="feature"><span className="feature-icon">✅</span><span>Globally Unique</span></div>
              <div className="feature"><span className="feature-icon">🌐</span><span>Cross-Platform</span></div>
              <div className="feature"><span className="feature-icon">👤</span><span>Self-Sovereign</span></div>
              <div className="feature"><span className="feature-icon">⚡</span><span>Instant Finality</span></div>
              <div className="feature"><span className="feature-icon">🆓</span><span>Permissionless</span></div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Connect your wallet above to get started →</p>
          </section>

          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">1</div>
              <div className="stat-label">Username per Claim</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">∞</div>
              <div className="stat-label">Usernames Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Central Authorities</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Wallet-Owned</div>
            </div>
          </div>

          <section className="how-section">
            <div className="section-title">How It Works</div>
            <p className="section-sub">Four steps to own your on-chain identity</p>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">Step 01</div>
                <div className="step-icon">🔗</div>
                <h3>Connect Wallet</h3>
                <p>Use any OneChain-compatible wallet. Your address is your identity — no passwords needed.</p>
              </div>
              <div className="step-card">
                <div className="step-num">Step 02</div>
                <div className="step-icon">🔍</div>
                <h3>Check Availability</h3>
                <p>Type your desired username and instantly see if it's available on-chain in real time.</p>
              </div>
              <div className="step-card">
                <div className="step-num">Step 03</div>
                <div className="step-icon">⚡</div>
                <h3>Claim It</h3>
                <p>One transaction mints your username as an owned object directly into your wallet.</p>
              </div>
              <div className="step-card">
                <div className="step-num">Step 04</div>
                <div className="step-icon">🌍</div>
                <h3>Use Everywhere</h3>
                <p>Your username is verifiable by anyone. Use it across any dApp that reads the registry.</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="dashboard">
          <div className="dashboard-inner">
            <nav className="tabs">
              {(['my-username', 'claim', 'lookup', 'chat'] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={tab === t ? 'active' : ''}
                  onClick={() => setTab(t)}
                >
                  {t === 'my-username' && '🏷️ My Username'}
                  {t === 'claim' && '⚡ Claim Username'}
                  {t === 'lookup' && '🔍 Lookup by Address'}
                  {t === 'chat' && '💬 Chat'}
                </button>
              ))}
            </nav>
            <main>
              {tab === 'my-username' && <MyUsername onClaim={() => setTab('claim')} />}
              {tab === 'claim' && <ClaimUsername onSuccess={() => setTab('my-username')} />}
              {tab === 'lookup' && <LookupUsername />}
              {tab === 'chat' && <Chat />}
            </main>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>UsernameRegistry · OneChain Testnet</span>
        <a href="https://onescan.cc/testnet" target="_blank" rel="noreferrer">Explorer ↗</a>
      </footer>
    </div>
  )
}
