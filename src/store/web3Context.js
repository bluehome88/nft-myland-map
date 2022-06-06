import { createContext, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/web3-provider";
import NftContractArtifact from "../NftContract.json";
import Config from "../config";

const Web3Context = createContext({
  account: null,
  loading: false,
  loadingBuy: false,
  nftContract: null,
  initWeb3Modal: () => {},
  buyLands: () => {},
});

export const Web3ContextProvider = (props) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [nftContract, setNftContract] = useState(null);

  const initWeb3Modal = async () => {
    try {
      setLoading(true);

      const providerOptions = {
        walletconnect: {
          package: WalletConnect,
          options: {
            infuraId: "e7cb82aa6e294d3a861cabaf61204f84",
          },
        },
      };
      const web3Modal = new Web3Modal({
        network: "rinkeby",
        cacheProvider: false, // optional
        providerOptions, // required
      });

      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const network = await provider.getNetwork();
      const signer = provider.getSigner();
      const balance = await signer.getBalance();
      const address = await signer.getAddress();
      const txCount = await signer.getTransactionCount();

      const newAcc = {
        balance: ethers.utils.formatEther(balance._hex),
        address,
        txCount,
        network,
      };
      listenEvents(instance);
      setAccount(newAcc);
      initContracts(signer);
      // await switchNetwork(instance)
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const initContracts = async (signer) => {
    const nftContract = new ethers.Contract(
      Config.ContractAddress,
      NftContractArtifact,
      signer
    );
    setNftContract(nftContract);
  };

  const listenEvents = (instance) => {
    instance.on("accountsChanged", () => {
        window.reload();
    });
    instance.on("chainChanged", () => {
        window.reload();
    });
    instance.on("disconnect", (f) => {
        window.reload();
    });
  };

//   const switchNetwork = async (inst) => {
//     try {
//       await inst.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: utils.hexlify(137) }],
//       });
//     } catch (switchError) {
//       console.log(switchError);
//       // This error code indicates that the chain has not been added to MetaMask.
//       if (switchError.code === 4902) {
//         try {
//           await inst.request({
//             method: "wallet_addEthereumChain",
//             params: [
//               {
//                 chainId: utils.hexlify(137),
//                 chainName: "Polygon",
//                 rpcUrls: ["https://matic-mainnet.chainstacklabs.com/"],
//                 blockExplorerUrls: ["https://polygonscan.com/"],
//                 nativeCurrency: {
//                   name: "MATIC",
//                   Symbol: "MATIC",
//                   decimals: 18,
//                 },
//               },
//             ],
//           });
//         } catch (addError) {
//           throw addError;
//         }
//       }
//     }
//   };


  const buyLands = async (x1, y1, x2, y2, callback) => {
    try {
      const totalSupply = (await nftContract.totalSupply()).toNumber();
      const nftPriceinWei = await nftContract.calculatePixelPrice(
        totalSupply,
        x1,
        y1,
        x2,
        y2
      );
      const tx = await nftContract.mint(totalSupply, x1, y1, x2, y2, {
        value: nftPriceinWei,
      });
      tx.wait().then((res) => {
        setLoadingBuy(false);
        if (callback) callback(totalSupply);
      });
    } catch (e) {
      if (callback) callback(-1);
      setLoadingBuy(false);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        loading,
        loadingBuy,
        account,
        nftContract,
        initWeb3Modal,
        buyLands,
      }}
    >
      {props.children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
