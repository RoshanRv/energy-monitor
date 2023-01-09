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
        db.query(
            "SELECT * FROM live ORDER BY id DESC LIMIT 100",
            (err, result) => {
                if (err) {
                    console.log(err)

                    io.emit("query-error", err)
                } else {
                    io.emit("electricity_data", result)
                }
            }
        )

        //

        // setInterval(() => {
        //     db.query(
        //         "SELECT * FROM live ORDER BY id DESC LIMIT 100",
        //         (err, result) => {
        //             if (err) {
        //                 console.log(err)

        //                 io.emit("query-error", err)
        //             } else {
        //                 io.emit("electricity_data", result)
        //             }
        //         }
        //     )
        // }, 60000)
    })
})

httpServer.listen(PORT, () => {
    console.log(`Server is running at PORT = ${PORT}`)
})
