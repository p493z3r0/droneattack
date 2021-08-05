import {TelloWrapper} from "../drone_interface/drone_wrapper";

const Tello = require("tello-drone");

const bodyParser = require('body-parser')

export class ActionServer {
    private express = require('express')
    private app = this.express()
    private port = 3000;
    private drone: typeof Tello;

    private droneWrapper: TelloWrapper;

    constructor(drone: typeof Tello) {
        this.drone = drone;
        this.droneWrapper = new TelloWrapper(drone);
        const cors = require('cors')
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.listen(this.port, () => {
            console.log(`Command and Control Server listening @ http://localhost:${this.port}`)
        })

        this.app.use(this.express.static('frontend'));
        this.app.post('/actions', async (req: any, res: any) => {
            const actions = req.body as { rotateDegrees: number, heightCorrection: number, other: string }
            actions.rotateDegrees = Math.floor(actions.rotateDegrees);
            console.log(actions);

            if (actions.other === 'LND') {
                this.droneWrapper.land();
                this.drone = null;
            }
            if (actions.other === 'TO') {
                this.droneWrapper.takeoff();
                this.drone = null;
            }
            if (actions.heightCorrection > 0) {
                this.droneWrapper.flyUp(Math.abs(actions.heightCorrection));
            }
            if (actions.heightCorrection < 0) {
                this.droneWrapper.flyDown(Math.abs(actions.heightCorrection));
            }
            if (actions.rotateDegrees > 0) {
                this.droneWrapper.rotateClockWise(Math.abs(actions.rotateDegrees));
            }
            if (actions.rotateDegrees < 0) {
                this.droneWrapper.rotateCounterClockWise(Math.abs(actions.rotateDegrees));
            }
            res.sendStatus(200)
        })
    }

}


