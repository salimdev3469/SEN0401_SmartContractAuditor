const QACard = ({ question, answer }) => {
    return (
        <div className="qa-card">
            <h3 className="qa-question">{question}</h3>
            <p className="qa-answer">{answer}</p>
        </div>
    );
};

export default QACard;