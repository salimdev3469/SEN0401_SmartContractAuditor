

import Navbar from './components/Navbar.jsx';
import Banner from './components/Banner.jsx';
import { useRef } from "react";
import Benefit from './components/Benefit.jsx';
import { Shield, Zap, Code } from "lucide-react";
import FlowSection from './components/FlowSection.jsx';
import QACard from './components/QACard.jsx';
import Footer from './components/Footer.jsx';

const LandingPage = () => {

    const blockchainRef = useRef(null);
    const smartContractRef = useRef(null);

    const qaList = [
        {
            question: "What is Blockchain?",
            answer: "A blockchain is a distributed ledger with growing lists of records (blocks) that are securely linked together via cryptographic hashes. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data (generally represented as a Merkle tree, where data nodes are represented by leaves). Since each block contains information about the previous block, they effectively form a chain (compare linked list data structure), with each additional block linking to the ones before it."
        },
        {
            question: "What is a Smart Contract?",
            answer: "A smart contract is a computer program or a transaction protocol that is intended to automatically execute, control or document events and actions according to the terms of a contract or an agreement. The objectives of smart contracts are the reduction of need for trusted intermediators, arbitration costs, and fraud losses, as well as the reduction of malicious and accidental exceptions."
        }
    ];
    return (
        <>
            <Navbar
                onBlockchainClick={() =>
                    blockchainRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                onSmartContractClick={() =>
                    smartContractRef.current?.scrollIntoView({ behavior: "smooth" })
                }
            />
            <Banner />
            <h2 style={{ textAlign: "center" }}>What do we offer?</h2>
            <div className='benefits-grid'>
                <Benefit
                    icon="🛡️"
                    title="AI Security"
                    description="Your smart contracts are scanned for vulnerabilities."
                />
                <Benefit
                    icon="⚡"
                    title="High Performance"
                    description="Lightning-fast Gemini Flash API processing."
                />
                <Benefit
                    icon="🔧"
                    title="Auto Fix"
                    description="Detected issues are automatically fixed by AI."
                />
            </div>
            <FlowSection />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    padding: '40px'
                }}
            >
                {/* QACard 1 - Blockchain */}
                <div ref={blockchainRef}>
                    <QACard
                        question={qaList[0].question}
                        answer={qaList[0].answer}
                    />
                </div>

                {/* QACard 2 - Smart Contract */}
                <div ref={smartContractRef}>
                    <QACard
                        question={qaList[1].question}
                        answer={qaList[1].answer}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
}

export default LandingPage;