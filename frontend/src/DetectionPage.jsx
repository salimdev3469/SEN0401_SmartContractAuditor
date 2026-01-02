import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Upload, Play, CheckCircle, AlertTriangle, XCircle, Copy, Code2, Activity, FileText } from 'lucide-react';
import { toast } from "react-toastify";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const LoadingOverlay = () => {
    const [scanText, setScanText] = useState("Initializing Scanner...");

    useEffect(() => {
        const texts = [
            "Parsing Abstract Syntax Tree...",
            "Checking Reentrancy Guards...",
            "Analyzing Control Flow...",
            "Verifying Overflow Protections...",
            "Scanning for Logic Bombs...",
            "Finalizing Security Score..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setScanText(texts[i % texts.length]);
            i++;
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="scanner-container">
                <div className="scanner-line"></div>
                <Code2 size={48} className="scanner-icon" />
            </div>
            <h3 className="scanner-text">{scanText}</h3>
            <div className="progress-bar">
                <motion.div
                    className="progress-fill"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                />
            </div>
        </motion.div>
    );
};

const DetectionPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [improvedCode, setImprovedCode] = useState(null);
    const [improving, setImproving] = useState(false);
    const fileInputRef = useRef(null);

    // --- HANDLERS ---
    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setCode(e.target.result);
        reader.readAsText(file);
    };

    const analyzeCode = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setResult(null);
        setImprovedCode(null);

        // Simulate a clearer loading experience with min time
        const minTime = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const [response] = await Promise.all([
                fetch(`${API_URL}/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, user_id: "default_user" }),
                }),
                minTime
            ]);

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            toast.error("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    const improveCode = async () => {
        if (!result) return;
        setImproving(true);
        try {
            const response = await fetch(`${API_URL}/improve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    original_code: code,
                    issues: JSON.stringify(result.issues),
                    user_id: "default_user"
                }),
            });
            const data = await response.json();
            setImprovedCode(data.improved_code);
        } catch (error) {
            toast.error("Improvement failed.");
        } finally {
            setImproving(false);
        }
    };

    // Helper to safe parse score
    const safeScore = result ? Number(result.risk_score) : 0;

    // Chart Data
    const getRiskCount = (riskType) => {
        if (!result || !result.issues) return 0;
        return result.issues.filter(i => i.risk.toLowerCase() === riskType.toLowerCase()).length;
    };

    const highRiskCount = getRiskCount('High');
    const medRiskCount = getRiskCount('Medium');
    const lowRiskCount = getRiskCount('Low');

    // Strict Chart Logic: If score is Safe (<30), force chart to be 100% Green.
    // Otherwise show the breakdown of risks.
    const isActuallySafe = safeScore < 30;

    const chartData = result ? {
        labels: ['High Risk', 'Medium Risk', 'Low Risk', 'Safe'],
        datasets: [{
            data: isActuallySafe
                ? [0, 0, 0, 1] // Force full green
                : [highRiskCount, medRiskCount, lowRiskCount, 0], // Show risks
            backgroundColor: ['#ff1744', '#ffea00', '#2979ff', '#00e676'],
            borderColor: '#0a0a0a',
            borderWidth: 2,
        }]
    } : null;

    const [isExpanded, setIsExpanded] = useState(false);
    const patchedCodeRef = useRef(null);

    useEffect(() => {
        if (improvedCode && patchedCodeRef.current) {
            // Wait a tick for the animation to start
            setTimeout(() => {
                patchedCodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toast.success("Fix applied! Review the code below.");
            }, 100);
        }
    }, [improvedCode]);

    return (
        <div className="detection-page">
            <nav id="navbar" style={{ position: 'absolute' }}>
                <div id="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <ArrowLeft size={18} /> BACK TO HOME
                </div>
            </nav>

            <div className="detection-layout">

                {/* LEFT: EDITOR WINDOW */}
                <div className="editor-window">
                    <div className="window-header">
                        <span>SOURCE CODE</span>
                        <span>SOL - {code.length} chars</span>
                    </div>
                    <div className="editor-content" style={{ position: 'relative' }}>
                        <textarea
                            className="code-textarea"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="// Paste your Solidity contract here..."
                            spellCheck="false"
                        />
                        <AnimatePresence>
                            {loading && <LoadingOverlay />}
                        </AnimatePresence>
                    </div>
                    <div className="action-bar">
                        <span className="upload-link" onClick={() => fileInputRef.current.click()}>
                            <Upload size={14} style={{ marginRight: 5 }} /> Upload File
                        </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        <button className="analyze-btn" onClick={analyzeCode} disabled={loading}>
                            {loading ? "SCANNING..." : "RUN AUDIT"} <Play size={14} style={{ marginLeft: 5 }} />
                        </button>
                    </div>
                </div>

                {/* RIGHT: RISK HUD */}
                <div className="risk-panel">

                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="results-container"
                        >
                            <div className="score-header">
                                <div className="chart-wrapper">
                                    <div className="chart-inner-text">
                                        <span className="score-val">{result.risk_score}</span>
                                        <span className="score-label">SCORE</span>
                                    </div>
                                    <Doughnut
                                        data={chartData}
                                        options={{
                                            cutout: '75%',
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                                <div className="score-details">
                                    <p className={
                                        result.risk_score < 30 ? "status-safe" :
                                            result.risk_score < 70 ? "status-warning" : "status-risk"
                                    }>
                                        {result.risk_score < 30 ? "PASSED" : result.risk_score < 70 ? "WARNING" : "CRITICAL"}
                                    </p>
                                </div>
                            </div>

                            <div className="issue-feed">
                                <div className="issue-header">VULNERABILITY REPORT</div>
                                {result.issues.length === 0 ? (
                                    <div className="empty-state">
                                        <CheckCircle size={40} color="#00e676" />
                                        <p>No vulnerabilities detected.</p>
                                    </div>
                                ) : (
                                    result.issues.map((issue, idx) => (
                                        <div className="issue-card" key={idx}>
                                            <div className="issue-card-header">
                                                <span className={`risk-badge ${issue.risk.toLowerCase()}`}>{issue.risk}</span>
                                                <h4>{issue.issue}</h4>
                                            </div>
                                            <p className="issue-solution">Fix: {issue.solution}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {safeScore >= 20 && (
                                <button
                                    className="btn-primary"
                                    onClick={improveCode}
                                    disabled={improving}
                                    style={{ marginTop: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {improving ? <Activity className="spin-icon" /> : <Code2 />}
                                    {improving ? " PATCHING..." : " AUTO-FIX CODE"}
                                </button>
                            )}

                        </motion.div>
                    ) : (
                        <div className="placeholder-panel">
                            <ShieldCheck size={64} style={{ opacity: 0.2 }} />
                            <p>Ready to audit.</p>
                        </div>
                    )}

                    {/* PATCHED CODE MODAL / PANEL */}
                    <AnimatePresence>
                        {improvedCode && (
                            <motion.div
                                className="patched-code-panel"
                                ref={patchedCodeRef}
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <div className="window-header" style={{ borderColor: '#00e676', background: 'rgba(0, 230, 118, 0.1)', boxShadow: '0 0 15px rgba(0,230,118,0.1)' }}>
                                    <span style={{ color: '#00e676', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 'bold' }}>
                                        <CheckCircle size={16} /> PATCH COMPLETE
                                    </span>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={() => setIsExpanded(!isExpanded)}>
                                            {isExpanded ? "COLLAPSE" : "EXPAND"}
                                        </button>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(improvedCode);
                                            toast.success("Patched code copied!");
                                        }}>
                                            <Copy size={14} /> COPY
                                        </button>
                                    </div>
                                </div>
                                <div className={`code-preview ${isExpanded ? 'expanded' : ''}`}>
                                    <pre>{improvedCode}</pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

            </div>
        </div>
    );
};

export default DetectionPage;
