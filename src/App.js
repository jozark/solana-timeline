import { useEffect, useState } from "react";
import "./App.css";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const DUMMY = [
    "https://twitter.com/art_zilla/status/1476289078912077826",
    "https://twitter.com/FlippersBC/status/1484806351910055937",
    "https://twitter.com/YakuCorp/status/1577017662005456897",
  ];
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [tweetList, setTweetList] = useState([]);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setTweetList(DUMMY);
    }
  }, [walletAddress]);

  const getTweetIdFromUrl = (url) => {
    if (url.includes("?")) {
      url = url.split("?")[0];
    }
    const id = url.match(/(.*)status\/(.*)/)[2];
    return id;
  };

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
          placeholder="Insert a tweet link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
        <p className="info-text">
          e.g. https://twitter.com/elonmusk/status/1580304724082843648
        </p>
      </form>
      <div className="tweet-grid">
        {tweetList.map((tweet) => (
          <div key={tweet}>
            <TwitterTweetEmbed
              onLoad={function noRefCheck() {}}
              tweetId={getTweetIdFromUrl(tweet)}
            />
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

    if (
      !/.*twitter.*\/status\/.*/.test(inputValue) ||
      inputValue.length === 0
    ) {
      toast.error("Please provide a valid Tweet Link!", {
        position: "bottom-right",
        theme: "colored",
      });
      return;
    }

    setTweetList([...tweetList, inputValue]);
    setInputValue("");
  };

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🏛 Solana Historic Tweets</p>
          <p className="sub-text">
            A monument to preserve historic tweets in the Solana community.
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
