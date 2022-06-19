import Client from "./client.js";
import { CronJob } from "cron";
import dotenv from 'dotenv';

dotenv.config();

const cl = new Client(process.env.TOKEN);

const users = new Map();

const findMoreUsers = () => {

};

const followLastUser = () => {
    
};

/**
 * This function will run every 10 seconds
 * 
 * @returns {void}
 */
const tick = () => {
    if(users.size == 0) {
        findMoreUsers();
    } else {
        followLastUser();
    }
};

cl.login()
.then(async() => {
    const job = new CronJob(
        "*/10 * * * * *",
        tick,
        null,
        true,
        'Europe/Prague'
    );

    job.start();

    process.stdout.write(`Bot started!\n`);
})
.catch(err => {
    process.stderr.write(`Error happened while starting the bot: ${err}\n`)
})