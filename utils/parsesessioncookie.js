/**
 * Parse array of cookies and get the first one which will in every case 
 * be laravel_session one
 */
export default (cookieArray) => {
    return cookieArray[0].split(';')[0].split('=')[1];
};