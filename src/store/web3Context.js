import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import Web3Modal from "web3modal";
// import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";

// import config from "../config.js";

import NftContractArtifact from "../contracts/NftContract.json";
import NftContractAddress from "../contracts/NftContract_address.json";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import { type } from "os";

const Web3Context = React.createContext({
    web3: null,
    signer: null,
    account: null,
    loading: false,
    loadingBuy: false,
    loadingPrice: false,
    loadingCount: false,
    openSeaLink: null,

    initWeb3Modal: () => { },
    getPixelPrice: () => { },
    countLifePixel: () => { },
    buyLands: () => { },
});

export const Web3ContextProvider = (props) => {
    const [web3, setWeb3] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [openSeaLink, setOpenSeaLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [loadingCount, setLoadingCount] = useState(false);
    const [loadingBuy, setLoadingBuy] = useState(false);
    const [nftContract, setNftContract] = useState(null);
    const [nftPrice, setNftPrice] = useState(0);
    const [nftCount, setNftCount] = useState(0);

    // useEffect(() => {
    //     const initUrlWeb3 = async () => {
    //         setLoading(true)
    //         try {
    //             const provider = new ethers.providers.JsonRpcProvider(config.PROD.RPC);

    //             setWeb3(provider);
    //             console.log("No web3 instance injected, using Local web3.");
    //             initContracts(provider);
    //         } catch (e) {
    //             console.log(e);
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     !web3 && initUrlWeb3()
    // }, [web3]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', accounts => window.location.reload())
            window.ethereum.on('chainChanged', () => window.location.reload())
            //window.ethereum.on('connect', (connectInfo) => { console.log({connectInfo}); })
        }
    }, [])

    const initContracts = (provider) => {
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(
            NftContractAddress.Contract,
            NftContractArtifact,
            signer);
        setNftContract(nftContract);
        setOpenSeaLink('https://testnets.opensea.io/assets/' + NftContractAddress.Contract + '/');
    }

    const initWeb3Modal = async () => {
        try {
            setLoading(true)
            const providerOptions = {
                // walletlink: {
                //     package: CoinbaseWalletSDK,
                //     options: {
                //         appName: "PPfinance",
                //         infuraId: 'ebc3a388e39840dc8313350226433c1e'
                //     }
                // },
                walletconnect: {
                    package: WalletConnect,
                    options: {
                        infuraId: '8043bb2cf99347b1bfadfb233c5325c0',
                        // bridge: "https://bridge.myhostedserver.com"
                    },
                    // rpc: {
                    //     137: "https://polygon-mainnet.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0"
                    // }
                }
            };

            const web3Modal = new Web3Modal({
                network: "rinkeby",
                cacheProvider: false,// optional
                providerOptions // required
            });

            const connected = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connected);
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
            setWeb3(provider);
            setSigner(signer);
            setAccount(newAcc);
            initContracts(provider);
            // await switchNetwork(connected)
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false)
        }
    }

    const switchNetwork = async (inst) => {
        try {
            
            await inst.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: utils.hexlify(137) }],
            });
        } catch (switchError) {
            console.log(switchError)
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await inst.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: utils.hexlify(137),
                                chainName: "Polygon",
                                rpcUrls: ["https://matic-mainnet.chainstacklabs.com/"],
                                blockExplorerUrls: ["https://polygonscan.com/"],
                                nativeCurrency: {
                                    name: "MATIC",
                                    Symbol: "MATIC",
                                    decimals: 18
                                }
                            },
                        ],
                    });
                } catch (addError) {
                    throw addError;
                }
            }
        }
    };

    const countLifePixel = async (tokenId) => {
        try {
            setLoadingCount(true);
            const pixelCount = await nftContract.purchaseOfTokenIdCounter(tokenId);
            setNftCount(pixelCount ? pixelCount.toNumber() : 0);
            setLoadingCount(false);
        } catch (e) {
            console.log(e);
            setLoadingCount(false);
        }
    }

    const getPixelPrice = async (tokenId) => {
        try {
            setLoadingPrice(true);
            const pixelPrice = await nftContract.calculatePixelPrice(tokenId);
            setNftPrice(utils.formatEther(pixelPrice));
            setLoadingPrice(false);
        } catch (e) {
            setLoadingPrice(false);
        }
    }

    const buyLands = async (x1, y1, x2, y2, callback) => {
        try {
            const totalSupply = (await nftContract.totalSupply()).toNumber()
            const nftPriceinWei = await nftContract.calculatePixelPrice(totalSupply, x1, y1, x2, y2)
            const tx = await nftContract.mint(totalSupply, x1, y1, x2, y2, { value: nftPriceinWei });
            tx.wait().then(() => {
                setLoadingBuy(false);
                if (callback) callback(true);
            });
        } catch (e) {
            if (callback) callback(false);
            setLoadingBuy(false);
        }
    }

    return (
        <Web3Context.Provider
            value={{
                web3,
                signer,
                loading,
                loadingBuy,
                loadingPrice,
                loadingCount,
                initWeb3Modal,
                buyLands,
                getPixelPrice,
                countLifePixel,
                nftPrice,
                nftCount,
                account,
                openSeaLink,
            }}>
            {props.children}
        </Web3Context.Provider>
    )
}

export default Web3Context;