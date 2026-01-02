import { useNavigate } from 'react-router-dom';

const Banner = () => {
    const navigate = useNavigate(); // hook'u component içinde çağırıyoruz

    return (
        <section id="banner">
            <div>
                <h1>
                    Make sure your Smart Contract is correct in 5 minutes
                </h1>
                <p>
                    Thanks to our advanced control system, errors and security vulnerabilities
                    in your Smart Contract are detected and then a more accurate and secure version
                    of the code is provided to you.
                </p>
                <button
                    onClick={() => navigate('/detect')}
                    className="try-now-btn"
                >
                    Try Now!
                </button>
            </div>
            <span>
                <img src="https://cdn-icons-png.flaticon.com/512/5966/5966528.png" alt="" />
            </span>
        </section>
    );
}

export default Banner;
