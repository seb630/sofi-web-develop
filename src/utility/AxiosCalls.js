import axios from 'axios'
import _, { assign, startsWith } from 'lodash'
import { globalConstants } from '@/_constants'
import { clearStorage, retrieveJSONData, storeJSONData } from './Storage'
import { actions } from 'mirrorx'
import querystring from 'query-string'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export { getData, saveData, validateToken, axiosAuthCall, axiosLoginCall }

// fetch token expirationDate
function getTokenExpirationDate(token) {
    if (!token || !token.expired_at) {
        return null
    } else {
        return new Date(token.expired_at)
    }
}

// find the status token status
function isTokenExpired(token) {
    const expirationDate = getTokenExpirationDate(token)
    return expirationDate < new Date()
}

// calculate the expired at time from expired_in
function tokenReceived(token) {
    if (token.expired_at === undefined) {
        const tokenDate = new Date()
        tokenDate.setUTCSeconds(token.expires_in)
        token.expired_at = tokenDate
    // console.log('auth/refresh, set expire at: ', token.expired_at);
    }
}

const onError = ((error, redirect) => {
    if (redirect) {
        clearStorage()
        let newHref = window.location.href.replace(window.location.origin,'').split('?path=')
        newHref = newHref.length>1 ? newHref[1] : newHref[0]
        window.location.href = `/login?path=${newHref}`
    }
    return Promise.reject(error)
})

// token validation
function validateToken() {
    const token = retrieveJSONData('token')
    let tokenExpired = isTokenExpired(token)
    let promise
    if (tokenExpired) {    // if the token is expired then refresh the token
    // console.log('token expired, refresh: ', token.expires_in, token.expired_at);
        let apiUrl = globalConstants.API_LOGIN_URL + '?grant_type=' + globalConstants.GRANTREFRESH + '&refresh_token=' + token?.refresh_token
        promise = axiosAuthCall(apiUrl, globalConstants.USERNAME, globalConstants.PASSWORD)
    } else {
        promise = Promise.resolve({
            status: 200,
            data: token,
            old: true
        })
    }
    return promise.then((response) => {
        let token = response.data
        tokenReceived(token)
        if (response.status === 200) {
            if (token && !response.old) {
                const remember = actions.auth.getS().auth.remember
                storeJSONData('token', token, remember)
                actions.auth.save({authToken: response.data})
            }
        } else if (response.status === 400) {
            onError('refreshing token failed!', true)
        }else {
            return Promise.reject('refreshing token failed!')
        }
        return token
    })
        .catch((error) => onError(error, true)
        )
}

function axiosCall(method, url, headers, data, blob=false, auth=true) {
    const responseType = blob ? 'blob' : 'json'
    if (auth){
        const token = retrieveJSONData('token')
        if (!token) {   // if token is null then rediret to login page
            clearStorage()
            let newHref = window.location.href.replace(window.location.origin,'').split('?path=')
            newHref = newHref.length>1 ? newHref[1] : newHref[0]
            window.location.href = `/login?path=${newHref}`
        } else
            return validateToken()
                .then((token) => {
                    headers = headers || {}
                    if (!token || !token.access_token) return Promise.reject('invalid token!')
                    return axios({
                        method: method,
                        url: url,
                        headers: assign(headers, { Authorization: 'Bearer ' + token.access_token }),
                        data: data,
                        responseType
                    })
                })
    }else {
        return axios({
            method: method,
            url: url,
            headers: headers,
            data: data,
            responseType
        })
    }

}

let authPromise = undefined

function axiosLoginCall(url, username, password, remember) {
    if (authPromise === undefined) {
        authPromise = axios({
            method: 'POST',
            url: url,
            data: querystring.stringify({
                username: username,
                password: password,
                grant_type: 'password'
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true,
            auth: {
                'username': globalConstants.USERNAME,
                'password': globalConstants.PASSWORD
            }
        })
            .then((response) => {
                authPromise = undefined
                tokenReceived(response.data)
                actions.auth.save({authToken: response.data, remember: remember})
                const isSuccess = storeJSONData('token', response.data, remember)
                if (!isSuccess) {
                    return Promise.reject('token saving error!')
                }
                return response
            })
            .catch((error) => {
                authPromise = undefined
                // axios.Cancel()
                return Promise.reject(error.response)
            })
    }
    return authPromise
}

// refresh access token api call
function axiosAuthCall(url, username, password) {
    if (authPromise === undefined) {
        authPromise = axios({
            method: 'POST',
            url: url,
            withCredentials: true,
            auth: {
                'username': username,
                'password': password
            }
        })
            .then((response) => {
                authPromise = undefined
                tokenReceived(response.data)
                const remember = actions.auth.getS().auth.remember
                actions.auth.save({authToken: response.data, remember: remember})
                const isSuccess = storeJSONData('token', response.data, remember)
                if (!isSuccess) {
                    return Promise.reject('token saving error!')
                }
                return response
            })
            .catch((error) => {
                authPromise = undefined
                // axios.Cancel()
                return onError(error, true)
            })
    }
    return authPromise
}

function normalizeUrl(baseUrl, url) {
    if (startsWith(url, baseUrl)) return url
    return baseUrl.replace(/\/*$/, '') + '/' + url.replace(/^\/*/, '')
}

function callAPI(method, url, headers, data, refresh, blob, auth) {
    url = normalizeUrl(globalConstants.API_BASE_URL, url)
    let promise
    if (auth) {
        if (refresh === undefined || refresh === null) {
            promise = Promise.resolve()
        } else {
            let token = retrieveJSONData('token')
            let authUrl = globalConstants.API_LOGIN_URL + '?grant_type=' + globalConstants.GRANTREFRESH + '&refresh_token=' + token?.refresh_token
            promise = axiosAuthCall(authUrl, globalConstants.USERNAME, globalConstants.PASSWORD)
        }
        return promise.then((response) => {
            if (response) {
                let token = response.data
                tokenReceived(token)
                if (response.status === 200) {
                    if (token && !response.old) {
                        const remember = actions.auth.getS().auth.remember
                        storeJSONData('token', token, remember)
                        actions.auth.save({authToken: response.data})
                    }
                } else {
                    return onError(Promise.reject('refreshing token failed!'), true)
                }
            }
            return axiosCall(method, url, headers, data, blob, auth)?.then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    !actions.setting.getS().setting.apiVersion && actions.setting.save({apiVersion: response.headers['api-version']})
                    return response.data
                } else {
                    return Promise.reject(response)
                }
            })
                .catch((error) => {
                    if (error.response?.status === 401  && error.response.data.error?.includes('invalid') && !refresh) { // refresh token and try once again
                        return callAPI(method, url, headers, data, true, blob, auth)
                    }
                    return errorHandler(error)
                })
        })
            .catch((error) => {
                return onError(error, false)
            })
    }else {
        return axiosCall(method, url, headers, data, blob, auth)
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    !actions.setting.getS().setting.apiVersion && actions.setting.save({apiVersion: response.headers['api-version']})
                    return response.data
                } else {
                    return Promise.reject(response)
                }
            })
            .catch((error) => {
                if (error.response?.status === 401 && error.response.data.error.includes('invalid') && !refresh) { // refresh token and try once again
                    return callAPI(method, url, headers, data, true, blob, auth)
                }
                return errorHandler(error)
            })
    }
}

const errorHandler = (error) =>{
    const { response } = error
    const status = response?.status
    if (status && status>= 501 && status<=504 ) {
        actions.routing.push({
            pathname: '/exception',
            state: {code: status}
        })
    }else{
        error.response && error.response.data &&_.extend(error.response.data, extractErrorMessages(error.response.data))
        return onError(error, false)
    }
}

function getData(url, blob=false, auth=true) {
    return callAPI('GET', url, null, null, null, blob, auth)
}

function saveData(url, payload, method, auth=true, blob=false) {
    return callAPI(method, url, null, payload, null, blob, auth)
}

/** extract Error Message
 * @param {Object} err { field_errors , global_errors , message }
 * @return {string}
 */
function extractErrorMessages (err) {
    let field_errors = err.field_errors || []
    let global_errors = err.global_errors ? err.global_errors.forEach(e => {
        return `${e.message}`
    }) : []

    if(err.message) {
        global_errors.push(err.message)
    }

    return {
        field_errors,
        global_errors
    }
}
