import {TelloDrone} from "tello-drone/lib/types/drone.types";

const Tello = require("tello-drone");

export class TelloWrapper {
    private drone: any;

    private rotating = false;
    private shifting = false;


    constructor(drone: any) {
        this.drone = drone;
    }


    public initialize() {
        this.drone.send('command').then();
    }

    public flyDown(cm: number) {
        if (this.shifting) return;
        this.shifting = true;

        this.drone.send('down', {value: cm}).then(() => {
            this.shifting = false;
        });
    }

    public takeoff() {
        this.drone.send('takeoff').then();
    }

    public land() {
        this.drone.send('land').then();
    }

    public stop() {
        this.drone.send('stop').then();
    }

    public flyUp(cm: number) {
        if (this.shifting) return;

        this.shifting = true;
        this.drone.send('up', {value: cm}).then(() => {
            this.shifting = false;
        });
    }

    public rotateClockWise(degrees: number) {
        if (this.rotating) return;
        this.rotating = true;
        this.drone.send('cw', {value: degrees}).then(() => {
            this.rotating = false;
        });
    }

    public rotateCounterClockWise(degrees: number) {
        if (this.rotating) return;
        this.rotating = true;
        this.drone.send('ccw', {value: degrees}).then(() => {
            this.rotating = false;
        });
    }

    public streamOn() {
        this.drone.send('streamon').then();

    }

    public streamOff() {
        this.drone.send('streamoff').then();

    }
}