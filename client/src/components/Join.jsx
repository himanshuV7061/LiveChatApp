import { useState } from "react";

function Join({ setChatStarted, setUserData }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [room, setRoom] = useState("");

  const [isPrivate, setIsPrivate] =
    useState(false);

  const [password, setPassword] =
    useState("");
  const publicRooms = [
  "🎮 Gaming",
  "🎬 Entertainment",
  "🏏 IPL",
  "👻 Horror Stories",
  "💻 Coding",
  "🤖 AI Talk",
  "📚 Study",
  "🎵 Music",
  ];

  const handleJoin = () => {
    if (!name || !gender || !room) {
      alert("Please fill all fields");
      return;
    }

    if (isPrivate && !password) {
      alert("Enter room password");
      return;
    }

    setUserData({
      name,
      gender,
      room,
      password,
      isPrivate,
    });

    setChatStarted(true);
  };

  return (
    <div className="join-container">
      <div className="join-box">
        <h1>Live Chat</h1>

        <input
          type="text"
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />

        <select
          onChange={(e) =>
            setGender(e.target.value)
          }
        >
          <option value="">
            Select Gender
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>

          <option value="Other">
            Other
          </option>
        </select>

        <div className="room-type-toggle">
          <button
            className={
              !isPrivate
                ? "toggle-btn active-toggle"
                : "toggle-btn"
            }
            onClick={() =>
              setIsPrivate(false)
            }
          >
            Public
          </button>

          <button
            className={
              isPrivate
                ? "toggle-btn active-toggle"
                : "toggle-btn"
            }
            onClick={() =>
              setIsPrivate(true)
            }
          >
            Private
          </button>
        </div>

        {!isPrivate ? (
          <>
            <h3>Select Room</h3>

            <div className="room-grid">
              {publicRooms.map(
                (roomName) => (
                  <button
                    key={roomName}
                    className={`room-btn ${
                     room === roomName
                     ? "active-room"
                     : ""
                     }`}
                    onClick={() =>
                      setRoom(roomName)
                    }
                  >
                    {roomName}
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Private Room Name"
              onChange={(e) =>
                setRoom(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Room Password"
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />
          </>
        )}

        <button
          className="join-btn"
          onClick={handleJoin}
        >
          Join Chat
        </button>
      </div>
    </div>
  );
}

export default Join;