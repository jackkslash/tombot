import WebSocket from "ws";

export function newPairSocket() {
  // Create WebSocket connection.
  const socket = new WebSocket("");
  // Connection opened
  socket.addEventListener("open", (event) => {
    socket.send("ping");
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
  });
}
