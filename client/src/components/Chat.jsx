import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:3001");

const publicRooms = [
  "Gaming",
  "Entertainment",
  "IPL",
  "Horror Stories",
  "Coding",
  "AI Talk",
  "Study",
  "Music",
];

function Chat({ userData }) {
  const [currentRoom, setCurrentRoom] =
    useState(userData.room);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState(
    []
  );

  const [onlineUsers, setOnlineUsers] =
    useState(0);

  const [typingUser, setTypingUser] =
    useState("");

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [usersList, setUsersList] =
    useState([]);

  const notificationSound = new Audio(
    "/message.mp3"
  );

  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.emit("join_chat", {
      ...userData,
      room: currentRoom,
    });

    socket.on("wrong_password", () => {
      alert("Wrong room password");
      window.location.reload();
    });

    socket.on("update_users", (data) => {
      setUsersList(data.users);
    });

    socket.on("receive_message", (data) => {
      notificationSound.play();

      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          message: data.message,
        },
      ]);
    });

    socket.on("user_left", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          message: data.message,
        },
      ]);
    });

    socket.on("online_users", (count) => {
      setOnlineUsers(count);
    });

    socket.on("show_typing", (data) => {
      setTypingUser(data.name);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    return () => {
      socket.off("wrong_password");
      socket.off("update_users");
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("online_users");
      socket.off("show_typing");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingUser]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      name: userData.name,
      gender: userData.gender,
      room: currentRoom,
      message: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", msgData);

    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", {
      name: userData.name,
      room: currentRoom,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(
      (prev) => prev + emojiData.emoji
    );
  };

  const switchRoom = (newRoom) => {
    if (newRoom === currentRoom) return;

    socket.emit("switch_room", {
      newRoom,
    });

    setCurrentRoom(newRoom);

    setMessages([]);
  };

  return (
    <div className="main-layout">
      <div className="sidebar">
        <h2>Rooms</h2>

        {publicRooms.map((room) => (
          <div
            key={room}
            onClick={() => switchRoom(room)}
            className={
              room === currentRoom
                ? "room-item active-sidebar-room"
                : "room-item"
            }
          >
            {room}
          </div>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div>
            <h2>
              Room: {currentRoom}
            </h2>

            <small>
              {onlineUsers} users online
            </small>
          </div>
        </div>

        <div className="chat-body">
          {messages.map((msg, index) => {
            if (msg.system) {
              return (
                <div
                  className="system-message"
                  key={index}
                >
                  {msg.message}
                </div>
              );
            }

            const isOwnMessage =
              msg.name === userData.name;

            return (
              <div
                key={index}
                className={
                  isOwnMessage
                    ? "message-row own fade-in"
                    : "message-row fade-in"
                }
              >
                <div
                  className={
                    isOwnMessage
                      ? "message own-message"
                      : "message"
                  }
                >
                  <div className="message-top">
                    <div className="avatar">
                      {msg.name.charAt(0)}
                    </div>

                    <div>
                      <small>
                        {msg.name}
                      </small>

                      <span className="time">
                        {msg.time}
                      </span>
                    </div>
                  </div>

                  <p>{msg.message}</p>
                </div>
              </div>
            );
          })}

          {typingUser && (
            <div className="typing-indicator">
              {typingUser} is typing...
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <div className="chat-footer">
          <button
            className="emoji-btn"
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
          >
            😀
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
          />

          <button onClick={sendMessage}>
            Send
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}
        </div>
      </div>

      <div className="users-panel">
        <h2>Online Users</h2>

        {usersList.map((user, index) => (
          <div
            className="user-item"
            key={index}
          >
            <div className="online-dot"></div>

            {user}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;