import {
    commentactivityQuery,
    fetchGlobalQuery,
    fetchuserQuery,
    fetchuserfollowersQuery,
    fetchuseranimeQuery,
    fetchuserfollowingQuery,
    togglefollowQuery,
    togglelikeQuery,
    fetchanimeactivitiesQuery
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

    /**
     * Fetch global or following feed
     * 
     * @param {Object} obj
     * @param {Number} [1] obj.page Number of page you want to return
     * @param {Number} [25] obj.perPage Number of results to return in one page
     * @param {String} [global] obj.type Type of feed (following or global)
     * @param {String} [all] obj.filter
     * @param {Boolean} [true] obj.isFollowing Display posts by users that are following you
     * @param {Boolean} [true] obj.hasReplies Display posts with replies
     * 
     * @returns {Promise<Error | Object>}
     */
    fetchGlobal = (obj = {}) => {
        return requester({
            query: fetchGlobalQuery,
            variables: {
                "page": obj?.page || 1, 
                "type": obj?.type || "global",
                "filter": obj?.filter || "all",
                "isFollowing": obj?.isFollowing || false,
                "hasReplies": obj?.hasReplies || true,
                "perPage": obj?.perPage || 25
            },
            instance: this.authorizedInstance
        })
    }

    /**
     * Toggle like on specific activity
     * 
     * @param {Object} obj
     * @param {Number} obj.id - Id of the activity 
     * 
     * @returns {Promise<Error | Object>}
     */
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

    /**
     * Toggle follow for specific user
     * 
     * @param {Object} obj
     * @param {Number} obj.id Id of the user
     * 
     * @returns {Promise<Error | Object>}
     */
    toggleFollow = (obj = {}) => {
        return requester({
            query: togglefollowQuery,
            variables: {
                id: obj?.id
            },
            instance: this.authorizedInstance
        });
    }

    /**
     * Comment on specific activity
     * 
     * @param {Object} obj
     * @param {String} obj.text Content of the activity (could be HTML)
     * @param {Number} obj.activityId Id of the activity you want to comment on
     * 
     * @returns {Promise<Error | Object>}
     */
    commentActivity = (obj = {}) => {
        return requester({
            query: commentactivityQuery,
            variables: {
                "text": obj?.text,
                "activityId": obj?.activityId
            },
            instance: this.authorizedInstance
        })
    }

    /**
     * Fetch user by username
     * 
     * @param {Object} obj 
     * @param {Number} obj.id Unique identificator of the anilist user
     * @param {String} obj.name Username of the anilist user
     * 
     * @returns {Promise<Error | Object>}
     */
    fetchUser = (obj = {}) => {
        return requester({
            query: fetchuserQuery,
            variables: {
                id: obj.id,
                name: obj.name
            },
            instance: this.authorizedInstance
        })
    }

    /**
     * Fetch followings of the user
     * 
     * @param {Object} obj
     * @param {Number} obj.id Unique identificator of the user
     * @param {Number} obj.page Number of the page you want to return
     *  
     * @returns {Promise<Error | Object>}
     */
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

    /**
     * Fetch followers of specific users
     * 
     * @param {Object} obj
     * @param {Number} obj.id Unique identificator of the user
     * @param {Number} obj.page Number of the page you want to return
     * 
     * @returns {Promise<Error | Object>} 
     */
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

    /**
     * Fetch anime list of specific user
     * 
     * @param {Object} obj
     * @param {Number} obj.userId If of the user you want to fetch
     * 
     * @returns {Promise<Error | Object>} 
     */
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

    /**
     * Fetch activities from specific anime
     * 
     * @param {Object} obj
     * @param {Number} id Id of the anime
     * @param {Number} [1] page Number of the page you want to fetch
     * @param {Number} [20] perPage Number of results to return from one page
     * 
     * @returns {Promise<Error | Object>} 
     */
    fetchAnimeActivities = (obj = {}) => {
        return requester({
            query: fetchanimeactivitiesQuery,
            variables: {
                id: obj?.id,
                page: obj?.page || 1, 
                perPage: obj?.perPage || 25
            },
            instance: this.authorizedInstance
        })
    };
    
    constructor(token) {
        this.rememberMeCookie = token;
    }
};