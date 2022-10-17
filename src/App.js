import "./App.css"
import { useEffect } from "react"

function App() {
  const checkIfWalletIsConnected = async () => {
    // We're using optional chaining (question mark) to check if the object is null
    if (window?.solana?.isPhantom) {
      const response = await window.solana.connect({ onlyIfTrusted: true })
      console.log("Connected with Public Key:", response.publicKey.toString())
    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻")
    }
  }

  const connectWallet = async () => {

  }

const renderNotConnectedContainer = () => (
  <button onClick={connectWallet} className="cta-button connect-wallet-button">
    Connect to Wallet
  </button>
)

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad)
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🏛 Solana Historic Events</p>
          <p className="sub-text">
            A monument to save historic events happend in the solana.
          </p>
          {renderNotConnectedContainer()}
        </div>
      </div>
    </div>
  )
}

export default App
