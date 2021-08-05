import {VideoReceiver} from "./lib/video_receiver/video_receiver";
import {ActionServer} from "./lib/drone_actions/server";
import {TelloWrapper} from "./lib/drone_interface/drone_wrapper";

const Tello = require("tello-drone");


const drone = new Tello();
const videoReceiver = new VideoReceiver();
const telloWrapper = new TelloWrapper(drone);
drone.on('state', (state: any) => {
    // return console.log(state.toString())

});


async function main() {
    console.info('Initializing Tello Wrapper')
    await telloWrapper.initialize();
    console.info('Resetting Tello Stream..')
    await telloWrapper.streamOff();
    await telloWrapper.streamOn();
    console.info('Starting Video Server..')
    videoReceiver.init();
    console.info('Starting Action Server..')
    const actionServer = new ActionServer(drone)
    console.info('Waiting for Drone T/O..');
}

console.info('Bootstrapping all instances..')
main().then(() => {
    console.info('All instances are running');
});