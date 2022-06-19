import {
    commentactivityQuery,
    fetchGlobalQuery,
    fetchuserQuery,
    fetchuserfollowersQuery,
    fetchuseranimeQuery,
    fetchuserfollowingQuery,
    togglefollowQuery,
    togglelikeQuery
} from './queries/index.js';
import parseSessionCookie from './utils/parsesessioncookie.js'
import requester from './utils/requester.js';
import axios from 'axios';


export default class Client {
    rememberMeCookie;
    laravelSessionCookie;

    /**
     * @type {import("axios").AxiosInstance} Instance that will be used to make 
     * authorized requests to Anilist Graphql API (access the methods that you're only
     * able to use as user when you're logged in)
     */
    authorizedInstance;

    /**
     * Fetch session that will be used to authorize while doing requests on 
     * data that will be only fetched if our client is authorized
     * 
     * @returns {Promise<Error | Boolean>} If connection was sucessfull or not
     */
    login = () => new Promise(async(resolve, reject) => {
        const res = await axios.get('https://anilist.co/404', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                "Cookie": `remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=${this.rememberMeCookie};`,
            }
        });

        try {
            const session = parseSessionCookie(res.headers["set-cookie"]);

            this.laravelSessionCookie = session;
            this.authorizedInstance = axios.create({
                baseURL: "https://graphql.anilist.co",
                method: 'POST',
                withCredentials: true,
                headers: {
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                    'Cookie': `remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=${this.rememberMeCookie};laravel_session=${this.laravelSessionCookie};`,
                },
                'Connection': "close",
                'Accept-Language': "cs,sk;q=0.8,en-US;q=0.5,en;q=0.3",
                'Accept-Encoding': "gzip, deflate, br"
            });

            resolve(session);
        } catch(e) {
            return reject(new Error(`Failed to fetch the session cookie\nerr: ${e}`))
        }
    });

    fetchGlobal = (obj = {}) => {
        return requester({
            query: fetchGlobalQuery,
            variables: {
                "page": obj?.page || 1, 
                "type": obj?.type || "global",
                "filter": obj?.filter || "all",
                "isFollowing": obj?.isFollowing || false,
                "hasReplies": obj?.hasReplies || true
            },
            instance: this.authorizedInstance
        })
    }

    toggleLike = (obj = {}) => {
        return requester({
            query: togglelikeQuery,
            variables: {
                id: obj?.id,
                type: 'ACTIVITY'
            },
            instance: this.authorizedInstance
        });
    }

    toggleFollow = (obj = {}) => {
        return requester({
            query: togglefollowQuery,
            variables: {
                id: obj?.id
            },
            instance: this.authorizedInstance
        });
    }

    commentActivity = (obj = {}) => {
        return requester({
            query: commentactivityQuery,
            variables: {
                "text": obj?.text,
                "type": obj?.type,
                "activityId": obj?.activityId
            },
            instance: this.authorizedInstance
        })
    }

    fetchUser = (obj = {}) => {
        return requester({
            query: fetchuserQuery,
            variables: {
                name: obj?.name
            },
            instance: this.authorizedInstance
        })
    }

    fetchUserFollowing = (obj = {}) => {
        return requester({
            query: fetchuserfollowingQuery, 
            variables: {
                id: obj?.id,
                page: obj?.page,
                type: 'following'
            },
            instance: this.authorizedInstance
        });
    }

    fetchUserFollowers = (obj = {}) => {
        return requester({
            query: fetchuserfollowersQuery,
            variables: {
                id: obj?.id,
                page: obj?.page,
                type: 'followers'
            },
            instance: this.authorizedInstance
        });
    }

    fetchUserAnime = (obj = {}) => {
        return requester({
            query: fetchuseranimeQuery,
            variables: {
                type: 'ANIME',
                userId: obj?.userId
            },
            instance: this.authorizedInstance
        });
    }
    
    constructor(token) {
        this.rememberMeCookie = token;
    }
};