
const Benefit = ({ icon, title, description }) => {
    return (
        <div className="benefit-card">
            <div className="benefit-icon">{icon}</div>
            <h3 className="benefit-title">{title}</h3>
            <p className="benefit-desc">{description}</p>
        </div>
    );
};

export default Benefit;
