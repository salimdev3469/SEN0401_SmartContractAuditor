import sca from '../assets/sca.png';

const Navbar = ({ onBlockchainClick, onSmartContractClick }) => {
    return (
        <nav id="navbar">
            <ul>
                <li className="nav-list">
                    <img id="logo" src={sca} alt="SCA logo" />
                </li>

                <li className="nav-list" onClick={onBlockchainClick} style={{ cursor: "pointer" }}>
                    What is Blockchain?
                </li>

                <li className="nav-list" onClick={onSmartContractClick} style={{ cursor: "pointer" }}>
                    What is Smart Contract?
                </li>

            </ul>
        </nav>
    );
};

export default Navbar;
