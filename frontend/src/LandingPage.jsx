
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, Zap, Terminal, Code2, Lock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <nav id="navbar">
                <div id="logo">
                    <ShieldCheck size={24} color="#fff" />
                    SMART AUDITOR <span>v2.0</span>
                </div>
                {/* Links removed as requested */}
                <div style={{ flex: 1 }}></div>
                <button className="nav-cta" onClick={() => navigate('/detect')}>
                    Launch App
                </button>
            </nav>

            <header className="hero-section">
                <div className="hero-bg-shapes">
                    <div className="shape-1"></div>
                    <div className="shape-2"></div>
                    <div className="shape-3"></div>
                </div>
                <div className="hero-tagline">AI-Powered Security Engine</div>
                <h1 className="hero-title">
                    Secure Your Smart Contracts<br />
                    At The Speed Of Code.
                </h1>
                <p className="hero-desc">
                    Find vulnerabilities instantly. Optimize gas logic automagically.
                    The most advanced auditing suite for Web3 developers.
                </p>
                <div className="hero-buttons">
                    <button className="btn-primary" onClick={() => navigate('/detect')}>
                        Start Auditing
                    </button>
                </div>
            </header>

            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-val">$24B+</div>
                    <div className="stat-label">Assets Secured</div>
                </div>
                <div className="stat-item">
                    <div className="stat-val">10M+</div>
                    <div className="stat-label">Lines Analyzed</div>
                </div>
                <div className="stat-item">
                    <div className="stat-val">0s</div>
                    <div className="stat-label">Deploy Latency</div>
                </div>
            </div>

            <section className="features-section">
                <div className="section-header">
                    <h2>Engineered for Scale</h2>
                    <p>Our detection engine runs on Gemini Flash 1.5 architecture.</p>
                </div>

                <div className="bento-grid">
                    <div className="bento-card large">
                        <div className="card-icon"><Zap size={32} /></div>
                        <div className="card-content">
                            <h3>Real-Time Analysis</h3>
                            <p>Get instant feedback as you type. Our AI pipeline analyzes your Solidity code in milliseconds, identifying critical reentrancy attacks and overflow vulnerabilities before deployment.</p>
                        </div>
                    </div>
                    <div className="bento-card">
                        <div className="card-icon"><Lock size={32} /></div>
                        <div className="card-content">
                            <h3>Bank-Grade Security</h3>
                            <p>Military grade encryption for your intellectual property.</p>
                        </div>
                    </div>
                    <div className="bento-card">
                        <div className="card-icon"><Terminal size={32} /></div>
                        <div className="card-content">
                            <h3>CLI Integration</h3>
                            <p>coming soon: Run audits directly from your terminal.</p>
                        </div>
                    </div>
                    <div className="bento-card large">
                        <div className="card-icon"><Code2 size={32} /></div>
                        <div className="card-content">
                            <h3>Auto-Remediation</h3>
                            <p>Don't just find bugs, fix them. Our engine proposes optimized code snippets that you can apply with a single click, maintaining 100% logic integrity.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer>
                <p>&copy; 2025 Smart Contract Auditor Inc. All systems normal.</p>
            </footer>
        </div>
    );
};

export default LandingPage;