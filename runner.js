import dotenv from 'dotenv';
import {
    runConfigInBackground
} from "./src/controllers/runner.js";
import {
    initUtils
} from './src/util.js';

dotenv.config();
initUtils();

process.on('message', (msg) => {
    console.log(`Executing`, msg);
    // @ts-ignore
    const {
        body,
        domain,
        sandbox,
        callback
    } = msg;
    try {
        runConfigInBackground(body, domain, sandbox, callback).catch(err => {
            console.error(err);
        });
        resetIdleTimer();
    } catch (error) {
        console.error(error);
    }
});

console.log(`Starting runner node ${process.pid}`);

const cleanUpServer = (code) => {
    console.log(`Exiting runner node ${process.pid} with code ${code}`);
};
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, cleanUpServer.bind(null, eventType));
})

var timer;
function resetIdleTimer() {
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(function () {
        process.exit();
    }, 60 * 60 * 1000);
}