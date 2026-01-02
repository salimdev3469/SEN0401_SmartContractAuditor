import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import blockchainLogo from './assets/blockchain.svg';
import Footer from './components/Footer';
import sca from './assets/sca.png';
import { toast } from "react-toastify";

ChartJS.register(ArcElement, Tooltip, Legend);

// --- ÖNEMLİ DEĞİŞİKLİK: BACKEND URL TANIMLAMASI ---
// Eğer Vite kullanıyorsan .env dosyasından çeker, yoksa direkt linki kullanır.
const API_URL = import.meta.env.VITE_API_URL;

const DetectionPage = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [improvedCode, setImprovedCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [improving, setImproving] = useState(false);
    const fileInputRef = useRef(null);
    const improvedRef = useRef(null);
    const [msgIndex, setMsgIndex] = useState(0);
    const navigate = useNavigate();

    const messages = [
        "Thanks for your patience…",
        "Checking for vulnerabilities…",
        "Analyzing contract logic…",
        "Almost there…",
        "Optimizing security checks…",
        "Validating security rules…",
        "Scanning for exploits…",
        "Reviewing function logic…",
        "Cross-checking dependencies…",
        "Finalizing report…"
    ];

    // Rotating messages
    useEffect(() => {
        if (loading || improving) {
            const interval = setInterval(() => {
                setMsgIndex(prev => (prev + 1) % messages.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [loading, improving]);

    useEffect(() => {
        if (improvedCode && improvedRef.current) {
            improvedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [improvedCode]);

    /** -------- HANDLE FILE -------- **/
    const handleFile = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            setCode(fileContent);  // direkt textarea içine yazıyoruz
        };
        reader.readAsText(file);
    };

    /** -------- Upload Input -------- **/
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        handleFile(file);
        e.target.value = null; // aynı dosyayı tekrar yüklemek için
    };

    /** -------- Drag & Drop -------- **/
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    /** -------- ANALYZE CODE -------- **/
    const analyzeCode = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setResult(null);
        setImprovedCode(null);

        try {
            // DEĞİŞİKLİK BURADA: Localhost yerine API_URL kullanıldı
            const response = await fetch(`${API_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, user_id: "default_user" }),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Analyze Error:", error);
            setResult({ status: 'Error', issues: [], risk_score: 0 });
            toast.error("Connection failed! Check backend URL.");
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setCode('');
        setResult(null);
        setImprovedCode(null);
    };

    /** -------- IMPROVE CODE -------- **/
    const makeBetter = async () => {
        if (!result) return;
        setImproving(true);
        setImprovedCode(null);

        try {
            // DEĞİŞİKLİK BURADA: Localhost yerine API_URL kullanıldı
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
            console.error("Improve Error:", error);
            setImprovedCode("// Error improving code.");
            toast.error("Improvement failed!");
        } finally {
            setImproving(false);
        }
    };

    const getColor = (risk) => {
        if (risk === 'Low') return '#00ff00';
        if (risk === 'Medium') return '#ffcc00';
        if (risk === 'High') return '#ff3300';
        return '#fff';
    };

    const doughnutData = result ? {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
            data: [
                result.issues.filter(i => i.risk.toLowerCase() === 'low').length,
                result.issues.filter(i => i.risk.toLowerCase() === 'medium').length,
                result.issues.filter(i => i.risk.toLowerCase() === 'high').length,
            ],
            backgroundColor: ['#00ff00', '#ffcc00', '#ff3300'],
            hoverOffset: 20,
        }]
    } : null;

    return (
        <>
            <div className="detection-page">

                <img
                    src={sca}
                    className="top-left-logo"
                    alt="Logo"
                    onClick={() => navigate('/')}
                />
                <img src={blockchainLogo} className="blockchain-logo" alt="Blockchain" />

                <div className="detection-container">

                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Check Your Smart Contract
                    </motion.h1>

                    {/* CODE INPUT + FILE UPLOAD */}
                    <div className="code-input-container">

                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your Solidity code here..."
                        />

                        <div
                            className="file-drop-area"
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            Drag & Drop file here or click to upload
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* BUTTONS */}
                        <div className="buttons">
                            <button onClick={analyzeCode} disabled={loading || improving}>
                                Analyze Code
                            </button>

                            {result && (
                                <button onClick={() => {
                                    clearResults();
                                    toast.warning("All clear!", {
                                        icon: "📋",
                                    });
                                }} className="clear-btn">
                                    Clear
                                </button>

                            )}
                        </div>

                        {/* SPINNER */}
                        <AnimatePresence>
                            {(loading || improving) && (
                                <motion.div
                                    className="spinner-container"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="spinner"></div>
                                    <p>{messages[msgIndex]}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RESULTS */}
                    {result && (
                        <div className="results-wrapper">
                            <div className="results-grid">

                                {/* LEFT — RISK LIST */}
                                <div className="risk-list">
                                    <h3>Detected Risks</h3>

                                    {result.issues.length > 0 ? (
                                        <ul>
                                            {result.issues.map((issue, idx) => (
                                                <li
                                                    key={idx}
                                                    style={{
                                                        borderLeft: `5px solid ${getColor(issue.risk)}`
                                                    }}
                                                >
                                                    <strong>{issue.issue}</strong> | Risk: {issue.risk}
                                                    <br />
                                                    <span>Solution: {issue.solution}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No issues detected.</p>
                                    )}
                                </div>

                                {/* RIGHT — CHART + IMPROVE */}
                                <div className="chart-improve">

                                    {doughnutData && (
                                        <div className="chart-box">
                                            <Doughnut data={doughnutData} />
                                            <p>Risk Score: {result.risk_score}</p>
                                        </div>
                                    )}

                                    {/* RISK SCORE 0 İSE BU BUTON GÖZÜKMEYECEK */}
                                    {result.risk_score > 0 && result.issues.length > 0 && (
                                        <button
                                            className="improve-btn"
                                            onClick={makeBetter}
                                            disabled={improving}
                                        >
                                            {improving ? "Improving..." : "Improve Code"}
                                        </button>
                                    )}

                                </div>
                            </div>

                            {/* IMPROVED CODE BOX */}
                            {improvedCode && (
                                <div ref={improvedRef} className="improved-box" style={{ position: 'relative' }}>
                                    <h3>Improved Code</h3>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(improvedCode);
                                            toast.success("Copied to clipboard!", {
                                                icon: "📋",
                                            });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '5px 10px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: '#00bfff',
                                            color: '#fff'
                                        }}
                                    >
                                        Copy
                                    </button>
                                    <pre>{improvedCode}</pre>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </>
    );
};

export default DetectionPage;
