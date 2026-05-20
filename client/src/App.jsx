import { useState } from "react";
import Join from "./components/Join";
import Chat from "./components/Chat";

function App() {
  const [chatStarted, setChatStarted] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    gender: "",
  });

  return (
    <>
      {!chatStarted ? (
        <Join
          setChatStarted={setChatStarted}
          setUserData={setUserData}
        />
      ) : (
        <Chat userData={userData} />
      )}
    </>
  );
}

export default App;