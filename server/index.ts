import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import db from "./config/db"
const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
})

const PORT = 3001

io.on("connection", (socket) => {
    socket.on("client-ready", () => {
        db.query("SELECT * FROM live ", (err, result) => {
            if (err) {
                io.emit("query-error", err)
            } else {
                console.log(result)

                io.emit("electricity_data", result)
            }
        })
    })
})

httpServer.listen(PORT, () => {
    console.log(`Server is running at PORT = ${PORT}`)
})
