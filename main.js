import Client from "./client.js";
import data from './data.json' assert {type: "json"};
import { CronJob } from "cron";
import dotenv from 'dotenv';

dotenv.config();

const cl = new Client(process.env.TOKEN);

const users = [];
let followedBefore = null;
let rateLimitedTo = Date.now();

const addUser = (userId) => {
    console.log(`Added ${userId} to the pending users!`);
    users.push(userId);
}

const findUserFollowers = async (userId) => {
    if((Date.now() - rateLimitedTo) < 0) {
        return console.log(`Our client is ratelimited for ${Date.now() - rateLimitedTo} miliseconds!`);
    }

    console.log(`Fetching followers for ${userId}!`);
    const following = await cl.fetchUserFollowing({
        id: userId,
        page: 1
    });

    if(following instanceof Error) {
        return console.log(`Unable to fetch following for ${userId}!`);
    }
    console.log(`Fetched all following for ${userId}!`);

    console.log(`Fetching followers for ${userId}!`);
    const followers = await cl.fetchUserFollowers({
        id: userId,
        page: 1
    });

    if(followers instanceof Error) {
        return console.log(`Unable to fetch followers for ${userId}!`);
    }
    console.log(`Fetched all followers for ${userId}!`);

    // Get a user from following and check if he followed back
    following.Page.following.forEach(el => {
        const isFollower = followers.Page.followers.filter(flEl => {
            return el.id == flEl.id;
        });

        if(isFollower.length !== 0) {
            return addUser(el.id)
        };
    });
};

/**
 * Fetch global feed for users, than fetch all followers from the users 
 * that followed back
 * 
 * @returns {Promise<void>}
 */
const findMoreUsers = async () => {
    if((Date.now() - rateLimitedTo) < 0) {
        return console.log(`Our client is ratelimited for ${Date.now() - rateLimitedTo} miliseconds!`);
    }

    try {
        console.log("Successfully fetched global feed!")
        const feed = await cl.fetchGlobal({
            page: 1,
            perPage: 20
        });

        if(feed instanceof Error) return console.log(
            'Failed to fetch feed!'
        );

        feed.Page.activities.map(el => {
            addUser(el.user.id);
            findUserFollowers(el.user.id);
        });
    } catch(_) {
        console.log(_)
        return;
    }
};

const followLastUser = async () => {
    if((Date.now() - rateLimitedTo) < 0) {
        return console.log(`Our client is ratelimited for ${Date.now() - rateLimitedTo} miliseconds!`);
    }

    try {
        const found = await cl.fetchUser({
            id: users[0]
        });
    
        if(found instanceof Error) {
            users.shift();
            return console.log(`Failed to fetch user [${users[0]}] ${found.retryAfter}`);
        }

        if(followedBefore == users[0]) {
            users.shift();
            return console.log(`Skipping duplicate ${followedBefore}`);
        }
    
        if(!found.User.isFollowing && !found.User.isFollower) {
            const toggledF = await cl.toggleFollow({
                id: found.User.id
            });
    
            if(typeof toggledF !== 'object') {
                console.log(`Can't follow ${found.User.name} [${found.User.id}], prob. because of ratelimit | ${found.retryAfter}`);
            } else {
                followedBefore = users[0];
                console.log(`Sucefully followed ${found.User.name} [${found.User.id}]!`);
            }
        } else {
            console.log(`Already following ${found.User.name} [${found.User.id}]!`);
        }
    
        users.shift();
    } catch(_) {
        console.log(`Something happened while trying to follow [${users[0]}]`);
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

const likeTick = async () => {
    const activities = await cl.fetchAnimeActivities({
        id: data.animeIds[Math.floor(Math.random() * data.animeIds.length)]
    });

    activities.Page.activities.forEach(async el => {
        const toggled = await cl.toggleLike({
            id: el.id
        });

        if(toggled instanceof Error) {
            console.log(`Failed to toggle like on activity ${el.id}`);
        } else {
            console.log(`Succefully liked activity [${el.id}]`);
        }
    });
};

cl.login()
.then(async() => {
    new CronJob(
        "*/3 * * * * *",
        tick,
        null,
        true,
        'Europe/Prague'
    );

    new CronJob(
        "*/60 * * * * *",
        likeTick,
        null,
        true,
        'Europe/Prague'
    );

    process.stdout.write(`Bot started!\n`);
})
.catch(err => {
    process.stderr.write(`Error happened while starting the bot: ${err}\n`)
})