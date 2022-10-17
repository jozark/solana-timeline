import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const DUMMY = [
    "https://i.imgur.com/fBhFHy8.jpeg",
    "https://i.imgur.com/JcOmINj.png",
  ];
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [jpegList, setJpegList] = useState([]);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      // TODO fetch jpegs
      setJpegList(DUMMY);
    }
  }, [walletAddress]);

  const checkIfWalletIsConnected = async () => {
    if (window?.solana?.isPhantom) {
      const response = await window.solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻");
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form onSubmit={sendImage}>
        <input
          type="text"
          placeholder="Enter a picture link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
      </form>
      <div className="gif-grid">
        {jpegList.map((jpg) => (
          <div className="gif-item" key={jpg}>
            <img src={jpg} alt={jpg} />
          </div>
        ))}
      </div>
    </div>
  );

  const onInputChange = (e) => {
    e.preventDefault();
    const { value } = e.target;
    setInputValue(value);
  };

  const sendImage = (e) => {
    e.preventDefault();
    if (inputValue.length > 0) {
      console.log("Img address:", inputValue);
      setJpegList([...jpegList, inputValue]);
      setInputValue("");
    } else {
      console.log("Img empty please enter valid address");
    }
  };

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🏛 Solana Historic Events</p>
          <p className="sub-text">
            A monument to preserve historical events in the Solana community.
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
}

export default App;
