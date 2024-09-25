import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

interface MessageTypes {
  message: string;
  user_id: string;
}

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000"), []);

  const [userId, setUserId] = useState("");

  // Store messages in state instead of ref
  const [messages, setMessages] = useState<MessageTypes[]>([]);
  const [message, setMessage] = useState("");

  const handleMessageSend = () => {
    socket.emit("message", message);
    setMessage(""); // Clear input after sending
  };

  useEffect(() => {
    // Connect and set up listeners once on mount
    socket.on("connect", () => {
      console.log("User connected.", socket.id);
    });

    // Listen for incoming messages and update state
    socket.on("messageReceiver", (msg: string, id: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: msg, user_id: id },
      ]);
    });

    socket.on("greet", (s: string) => {
      console.log(`Greeted: ${s}`);
    });

    socket.on("user", (msg: string) => {
      console.log(msg);
    });

    userId &&
      socket.on("receive-message", (userId: string, message: string) => {
        console.log(userId, message);
      });

    // Cleanup: Remove listeners when the component unmounts
    return () => {
      socket.off("messageReceiver");
      socket.off("connect");
      socket.off("greet");
      socket.off("user");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [socket]); // Include socket in dependency array

  return (
    <main className="min-h-screen w-screen text-lg md:text-2xl bg-slate-950 text-gray-100 relative pb-40">
      <input
        type="text"
        className="input input-bordered absolute left-1/2 text-black input-info max-w-lg mt-2 mx-auto"
        placeholder="user id for specific messages.."
        value={userId}
        onChange={(e: any) => setUserId(e.target.value)}
      />
      {messages.length > 0 && (
        <div className="md:w-[80vw] mx-auto w-[90vw] rounded p-8 bg-indigo-600 text-slate-200 mb:4 pt-8">
          {messages.map((msg, index) => (
            <div className="mt-4" key={index}>
              <p>User Id : {msg.user_id}</p>
              <p>Message : {msg.message}</p>
            </div>
          ))}
        </div>
      )}
      <div className="absolute bottom-8 w-full flex justify-center mx-auto gap-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type here"
          className="input w-1/2 input-bordered text-black input-info max-w-xs"
        />
        <button
          onClick={handleMessageSend}
          disabled={message.length < 5}
          className="btn btn-accent w-fit"
        >
          Send
        </button>
      </div>
    </main>
  );
};

export default App;
