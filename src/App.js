import { useContext } from "react";
import Web3Context from "./store/web3Context";
import Lands from "./Lands";
import "./app.css";

function App() {
  const { initWeb3Modal, account } = useContext(Web3Context);

  return (
    <>
      <div className="header">
        <div className="headerContainer">
          <h2>Logo</h2>
          <div className="rightHeader">
            {account && (
              <p className="accountBox">
                {account.network.name} - {account.network.chainId}
              </p>
            )}
            {account && (
              <p className="accountBox">
                {account.address.slice(0, 5) +
                  "..." +
                  account.address.slice(
                    account.address.length - 5,
                    account.address.length
                  )}
              </p>
            )}
            {!account && (
              <button
                type="primary"
                style={{ margin: "10px auto", maxWidth: "180px" }}
                onClick={initWeb3Modal}
              >
                Connect your Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="content">
        <Lands/>
      </div>
    </>
  );
}

export default App;