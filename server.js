const { createServer } = require("http")
const { Server } = require("socket.io")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = dev ? "localhost" : "0.0.0.0"
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // WebSocket connection handling
  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`)

    // Join game room
    socket.join("game-room")

    // Handle game state updates
    socket.on("game-state-update", (data) => {
      console.log("[WebSocket] Broadcasting game state update")
      io.to("game-room").emit("game-state-changed", data)
    })

    // Handle team claim
    socket.on("team-claimed", (data) => {
      console.log(`[WebSocket] Team ${data.teamId} claimed`)
      io.to("game-room").emit("team-status-changed", data)
    })

    // Handle scenario push
    socket.on("push-scenario", (data) => {
      console.log(`[WebSocket] Pushing scenario ${data.scenarioIndex}`)
      io.to("game-room").emit("scenario-update", data)
    })

    // Handle answer submission
    socket.on("answer-submitted", (data) => {
      console.log(`[WebSocket] Answer submitted for team ${data.teamId}`)
      io.to("game-room").emit("answer-status-changed", data)
    })

    // Handle game phase changes
    socket.on("phase-changed", (data) => {
      console.log(`[WebSocket] Game phase changed to ${data.phase}`)
      io.to("game-room").emit("game-phase-update", data)
    })

    // Handle winner reveal
    socket.on("reveal-winner", (data) => {
      console.log("[WebSocket] Revealing winner")
      io.to("game-room").emit("winner-revealed", data)
    })

    // Handle game reset
    socket.on("reset-game", () => {
      console.log("[WebSocket] Game reset")
      io.to("game-room").emit("game-reset")
    })

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`)
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server running on same port`)
  })
})
