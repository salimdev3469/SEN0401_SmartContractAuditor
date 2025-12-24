const steps = [
    {
        id: 1,
        title: "Upload Solidity Code",
        description: "Paste your contract or upload a file for instant scanning.",
        icon: "📤"
    },
    {
        id: 2,
        title: "AI Security Analysis",
        description: "Our AI engine analyzes the code for vulnerabilities.",
        icon: "🧠"
    },
    {
        id: 3,
        title: "Risk Detection",
        description: "Critical, medium, and low severity risks are highlighted.",
        icon: "🚨"
    },
    {
        id: 4,
        title: "Smart Contract Improvement",
        description: "Click 'Make Better' and AI generates a secure improved version.",
        icon: "✨"
    },
    {
        id: 5,
        title: "Download Secure Contract",
        description: "Download the fixed and optimized Solidity file.",
        icon: "📥"
    }
];

const FlowSection = () => {
    return (
        <section className="flow-section">
            <h2>How It Works</h2>
            <p className="subtitle">AI-powered smart contract auditing pipeline</p>

            <div className="flow-container">
                {steps.map((step, index) => (
                    <div className="flow-card" key={step.id}>
                        <div className="flow-icon">{step.icon}</div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>

                        <div className="step-number">{index + 1}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FlowSection;
