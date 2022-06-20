import axios from "axios";

/**
 * Execute request with query and variables in body and return Error 
 * or data by graphql api
 * 
 * @typedef {Object} options
 * @property {String} options.query Gql query
 * @property {Object} options.variables Gql variables
 * @property {import("axios").AxiosInstance} options.instance Axios instace
 * 
 * @returns {Promise<Error | Object>}
 */
export default async({ query, variables, instance }) => {
    return await instance.post('/graphql', {
        query: query,
        variables: variables
    })
    .then(res => {
        if(!res.data) {
            throw new Error("Something happened!");
        }

        return res.data.data;
    })
    .catch(err => {
        return new Error({
            retryAfter: parseInt(err.response.headers['x-ratelimit-remaining'])
        });
    })
}