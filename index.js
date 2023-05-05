import { Server, Socket } from "socket.io";
import express from 'express'
import path from "path";
import { createServer } from "http";
import Connection from "./database/db.js";
import {getDocument,updateDocument} from './controller/documentController.js'

const PORT = process.env.PORT || 9000;
Connection();

const app = express()
app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./client/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

const httpServer = createServer(app)
httpServer.listen(PORT)

const io =new Server(httpServer)

io.on('connection',socket => {
    console.log("connected");

    socket.on('get-document',async (documentId) =>{
        const document = await getDocument(documentId)
        socket.join(documentId);
        socket.emit('load-document',document.data)

        socket.on('send-changes', delta => {
            // console.log(delta);
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        socket.on('save-document', async data =>{
            await updateDocument(documentId,data)
        })
    })
});
