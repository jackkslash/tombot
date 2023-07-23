import WebSocket from "ws";

export function newPairSocket() {
  // Create WebSocket connection.
  const socket = new WebSocket("wss://news.treeofalpha.com/ws");
  // Connection opened
  socket.addEventListener("open", (event) => {
    socket.send("ping");
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
  });
}
