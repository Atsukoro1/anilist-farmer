import Client from "./client.js";
import dotenv from 'dotenv';

dotenv.config();

const cl = new Client(process.env.TOKEN);
cl.login()
.then(async() => {
    // console.log(cl.laravelSessionCookie);
    // cl.fetchGlobal()
    // const k = await cl.fetchGlobal();
    // const a = await cl.toggleFollow({
    //     id: k.Page.activities[0].userId
    // });
    // const f = await cl.fetchUser({ name: "Atsukoro" });
    const f = await cl.fetchUser({
        name: "Atsukoro"
    });
    console.log(f);
})
.catch(err => {
    console.log(err);
})