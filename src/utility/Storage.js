import { actions } from 'mirrorx'
import moment from 'moment'
import { globalConstants } from '@/_constants'

function resetStore() {
    actions.user.resetState()
    actions.setting.resetState()
    actions.hub.resetState()
    actions.auth.save({
        authToken: null
    })
    actions.release.resetState()
    actions.sofiBeacon.resetState()
    actions.radar.resetState()
    actions.SIM.resetState()
    actions.common.resetState()
}

//set the value in localstorage and sessionStorage
function storeJSONData(key, value, remember=true) {
    if (value === undefined) {
        alert('No Associated hub with user profile.')
    } else {
        if (!remember) {
            sessionStorage.setItem(key, JSON.stringify(value))
            return true
        } else {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        }
    }
}

function storeDeviceData(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(key, JSON.stringify(value))
    return true
}


const setExpireStorage = (key, value, expired) =>{
    const now = new Date()

    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
        value: value,
        expiry: now.getTime() + expired*1000*60
    }
    localStorage.setItem(key, JSON.stringify(item))
}

const getExpireStorage = (key) =>{
    const itemStr = localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }
    let item = JSON.parse(itemStr)
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

const getOobeStorage = () => {
    const itemStr = localStorage.getItem('oobe')
    // if the item doesn't exist, return null
    if (!itemStr) {
        return []
    }
    let item = JSON.parse(itemStr)
    return item?.filter(record=>!record.time || moment(record.time).isAfter(moment().subtract(globalConstants.OOBE_SKIP_TIME,'minute'))) || []
}

//get the localstorage or sessionStorage values
function retrieveJSONData(key) {
    return sessionStorage.getItem(key) ?
        JSON.parse(sessionStorage.getItem(key)) :
        JSON.parse(localStorage.getItem(key))
}
//clear the localstorage  or sessionstorage value
const clearStorage = () => {
    sessionStorage && sessionStorage.removeItem('token')
    localStorage && localStorage.removeItem('token')
    resetStore()
}

export {
    storeJSONData,
    retrieveJSONData,
    clearStorage,
    setExpireStorage,
    getExpireStorage,
    storeDeviceData,
    getOobeStorage
}
