import { useEffect, useState } from "react";
import "./App.css";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import kp from "./keypair.json";

const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey("CpAmzB86fsRWzeAWX4zL7gzi4QvTah5U3FBUN62rt9tE");
const network = clusterApiUrl("devnet");

const opts = {
  preflightCommitment: "processed",
};

function App() {
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
      getTweetList();
    }
  }, [walletAddress]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getProgram = async () => {
    const idl = await Program.fetchIdl(programID, getProvider());
    return new Program(idl, programID, getProvider());
  };

  const createTweetAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();

      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getTweetList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const getTweetList = async () => {
    try {
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log("the account", account);
      setTweetList(account.tweetList);
    } catch (error) {
      console.error("Could not get tweets");
      setTweetList(null);
    }
  };

  const getTweetIdFromUrl = (url) => {
    console.log(url, "url");
    if (url?.includes("?")) {
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

  const renderConnectedContainer = () => {
    if (tweetList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createTweetAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    } else {
      return (
        <div className="connected-container">
          <form onSubmit={sendTweet}>
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
            {tweetList?.map((tweet) => (
              <div key={tweet.tweetLink}>
                <TwitterTweetEmbed
                  onLoad={function noRefCheck() {}}
                  tweetId={getTweetIdFromUrl(tweet.tweetLink)}
                />
                {/* <span style={{ color: "white" }}>submitted by </span> */}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const { value } = e.target;
    setInputValue(value);
  };

  const sendTweet = async (e) => {
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

    try {
      const provider = getProvider();
      const program = await getProgram();
      setInputValue("");
      await program.rpc.addTweet(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      toast("Linked Tweet successfully", {
        position: "bottom-right",
      });

      getTweetList();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🏛 Memorable Solana Tweets</p>
          <p className="sub-text">
            A devnet monument to preserve memorable tweets of Solana community
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
