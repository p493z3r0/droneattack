import * as http from "http";
import {spawn} from "child_process";

const STREAM_PORT = 3001;
const WebSocket = require('ws');

export class StreamServer {
    private readonly streamServer: any;
    private webSocketServer: typeof WebSocket.Server;

    constructor() {

        let that = this;


        const streamServer = http.createServer(function (request, response) {
            console.log(
                'Stream Connection on ' + STREAM_PORT + ' from: ' +
                request.socket.remoteAddress + ':' +
                request.socket.remotePort
            );
            request.on('data', function (data) {
                that.webSocketServer.broadcast(data);
            });

        }).listen(STREAM_PORT);

         this.webSocketServer = new WebSocket.Server({
            server: streamServer
        });
        that.webSocketServer.broadcast = function(data: any) {
            that.webSocketServer.clients.forEach(function each(client: any) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        };


        setTimeout(function () {
            let args = [
                "-i", "udp://0.0.0.0:11111",
                "-r", "30",
                "-s", "960x720",
                "-codec:v", "mpeg1video",
                "-b", "800k",
                "-f", "mpegts",
                "http://127.0.0.1:3001/stream"
            ];

            const streamer = spawn('ffmpeg', args);
            streamer.on("exit", function (code) {
                console.log("Failure", code);
            });
        }, 3000);

    }


}
