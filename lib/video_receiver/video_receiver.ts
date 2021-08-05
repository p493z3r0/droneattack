import * as fs from "fs";
import {StreamServer} from "./stream_server";

export class VideoReceiver {
    private udp = require('dgram');

    private writeStream: fs.WriteStream;

    private udpServer = this.udp.createSocket('udp4');

    constructor() {
        new StreamServer()
        this.writeStream = fs.createWriteStream('./video.h264', {
            encoding: "utf8",
        })

        let that = this;
        this.udpServer.on('error', function (error: string) {
            console.log('Error: ' + error);
            that.udpServer.close();
        });

        this.udpServer.on('message', function (msg: any, info: any) {
            console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);

            that.writeStream.write(msg.toString());

            const ffmpeg = require("fluent-ffmpeg");
            const inFilename = "video.h264";
            const outFilename = "video.mp4";

            ffmpeg(inFilename)
                .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
                .save(outFilename);

        });

        this.udpServer.on('listening', function () {
                const address = that.udpServer.address();
                const port = address.port;
                const family = address.family;
                const ipaddr = address.address;
                console.log('Server is listening at port' + port);
                console.log('Server ip :' + ipaddr);
                console.log('Server is IP4/IP6 : ' + family);
            }
        );
        this.udpServer.on('close', function () {
            console.log('Socket is closed !');
        });
    }

    public init() {
        // this.udpServer.bind(11111)
    }

    public getCurrentFrame(): any {
        return null;
    }
}
