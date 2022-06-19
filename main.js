import Client from "./client.js";
import { CronJob } from "cron";
import dotenv from 'dotenv';

dotenv.config();

const cl = new Client(process.env.TOKEN);

const users = [];

const findMoreUsers = async () => {
    try {
        const feed = await cl.fetchGlobal();
        if(typeof feed !== 'object') return console.log(
            'Failed to fetch feed!'
        );

        feed.Page.activities.map(el => {
            users.push(el.user.id);
        });
    } catch(_) {
        return;
    }
};

const followLastUser = async () => {
    try {
        const found = await cl.fetchUser({
            id: users[0]
        });
    
        if(typeof found !== 'object') return console.log("Failed to follow user");
    
        if(!found.User.isFollowing && !found.User.isFollower) {
            const toggledF = await cl.toggleFollow({
                id: found.User.id
            });
    
            if(typeof toggledF !== 'object') {
                console.log(`Can't follow ${found.User.name} [${found.User.id}], prob. because of ratelimit`);
            } else {
                console.log(`Sucefully followed ${found.User.name} [${found.User.id}]!`);
            }
        } else {
            console.log(`Already following ${found.User.name} [${found.User.id}]!`);
        }
    
        users.shift();
    } catch(_) {
        return;
    }
};

/**
 * This function will run every 10 seconds
 * 
 * @returns {void}
 */
const tick = () => {
    if(users.length == 0) {
        findMoreUsers();
    } else {
        followLastUser();
    }
};

cl.login()
.then(async() => {
    const job = new CronJob(
        "*/5 * * * * *",
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