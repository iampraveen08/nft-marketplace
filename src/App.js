import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const App = () => {
const [account, setAccount] = useState(null);
const [nftImage, setNftImage] = useState(null);
const [nfts, setNfts] = useState([]);

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const rpcUrl = process.env.REACT_APP_RPC_URL;

// Smart contract ABI
const nftMarketplaceABI = [
"function mintNFT(string memory tokenURI) public returns (uint256)",
"function getNFTs() public view returns (address[] memory, string[] memory)",
"function buyNFT(uint256 tokenId) public payable",
];

let provider, signer, nftMarketplace;

// Connect to Ethereum wallet (MetaMask)
const connectWallet = async () => {
if (window.ethereum) {
provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
signer = await provider.getSigner();
nftMarketplace = new ethers.Contract(contractAddress, nftMarketplaceABI, signer);
const userAccount = await signer.getAddress();
setAccount(userAccount);
loadNFTs();
} else {
alert("Please install MetaMask to connect.");
}
};

// Load NFTs
const loadNFTs = async () => {
try {
const [owners, tokenURIs] = await nftMarketplace.getNFTs();
setNfts(tokenURIs.map((uri, index) => ({ owner: owners[index], uri })));
} catch (err) {
console.error("Error loading NFTs:", err);
}
};

// Mint NFT
const mintNFT = async () => {
if (!nftImage) {
alert("Please upload an image for the NFT.");
return;
}

const reader = new FileReader();
reader.onloadend = async () => {
const tokenURI = reader.result;
try {
const transaction = await nftMarketplace.mintNFT(tokenURI);
await transaction.wait();
alert("NFT minted successfully!");
loadNFTs();
} catch (err) {
console.error("Error minting NFT:", err);
}
};
reader.readAsDataURL(nftImage);
};

// Buy NFT
const buyNFT = async (tokenId) => {
const price = ethers.parseEther("0.1"); // Use ethers.parseEther directly from ethers
try {
const transaction = await nftMarketplace.buyNFT(tokenId, { value: price });
await transaction.wait();
alert("NFT purchased successfully!");
loadNFTs();
} catch (err) {
console.error("Error buying NFT:", err);
}
};

return (
<div className="App">
<h1>NFT Marketplace</h1>
{!account ? (
<button onClick={connectWallet}>Connect Wallet</button>
) : (
<div>
<h3>Connected: {account}</h3>
<div>
<input
type="file"
accept="image/*"
onChange={(e) => setNftImage(e.target.files[0])}
/>
<button onClick={mintNFT}>Mint NFT</button>
</div>
<div>
{nfts.map((nft, index) => (
<div key={index} className="nft-card">
<img src={nft.uri} alt={`NFT ${index}`} />
<button onClick={() => buyNFT(index)}>Buy NFT</button>
</div>
))}
</div>
</div>
)}
</div>
);
};

export default App;