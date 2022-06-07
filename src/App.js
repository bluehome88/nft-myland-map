import { useContext, useEffect } from "react";
import Web3Context from "./store/web3Context";
import Lands from "./Lands";

function App() {
  const { initWeb3Modal, account } = useContext(Web3Context);

  useEffect(() => {
    const connectBtns = document.getElementsByClassName("btn-connect");
    if (account) {
      Array.from(connectBtns).forEach((e) => {
        e.innerHTML =
          account.address.slice(0, 5) +
          "..." +
          account.address.slice(
            account.address.length - 5,
            account.address.length
          );
        e.removeEventListener("click", initWeb3Modal);
    })} else {
      Array.from(connectBtns).forEach((e) => {
        e.addEventListener("click", initWeb3Modal);
      });
    }

    return () => {
      Array.from(connectBtns).forEach((e) => {
        e.removeEventListener("click", initWeb3Modal);
      });
    };
  }, [account, initWeb3Modal]);

  return <Lands />;
}

export default App;
