import Client from "./client.js";
import dotenv from 'dotenv';

dotenv.config();

const cl = new Client(process.env.TOKEN);
cl.login()
.then(async() => {
    cl.fetchGlobal({
        page
    })
})
.catch(err => {
    console.log(err);
})