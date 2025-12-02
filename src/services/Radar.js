import { getData, saveData } from '@/utility/AxiosCalls'
import queryString from 'query-string'

function getRadars(page=0,size=100) {
    const url = `/radars?size=${size}&page=${page}`
    return getData(url)
}

function postRadar(payload) {
    const url = 'products'
    return saveData(url,payload,'POST')
}

function patchRadar (payload) {
    const url = `products/${payload.id}`
    return saveData(url,payload,'PATCH')
}

function getRadar (radarId) {
    const url = `radars/${radarId}`
    return getData(url)
}

function getRadarOrgs (radarId) {
    const url = `products/${radarId}/orgs`
    return getData(url)
}

function getRadarAlarmHistory (radarId, params) {
    const url = `radars/${radarId}/alarm-histories?${queryString.stringify(params)}`
    return getData(url)
}

function putRadarResolveAlarmWithCode (radarId, payload) {
    const url = `radars/${radarId}/alarm-histories/${payload.last_alarm_history_id}/resolve`
    return saveData(url,payload,'PUT')
}

function putRadarResolveSingleAlarmWithCode (radarId, payload) {
    const url = `radars/${radarId}/alarm-histories/${payload.radar_alarm_history_id}/resolve`
    return saveData(url,payload,'PUT')
}

function getRadarConfig (radarId) {
    const url = `radars/${radarId}/config`
    return getData(url)
}

function postRadarConfig (payload) {
    const url = `radars/${payload.id}/config`
    return saveData(url,payload,'POST')
}

function getRadarStateHistory (radarId, params) {
    const url = `radars/${radarId}/state-histories?${queryString.stringify(params)}`
    return getData(url)
}

function getRadarUsers(radarId) {
    const url = `/products/${radarId}/users`
    return getData(url)
}

function postRadarUser(payload) {
    const url = '/product-users'
    return saveData(url,payload,'POST')
}

function deleteRadarUser(payload) {
    const url = '/product-users'
    return saveData(url,payload,'DELETE')
}

function putRadarReboot (radarId) {
    const url = `radars/${radarId}/reboot`
    return saveData(url, {},'PUT')
}

function postRadarTestFall (radarId) {
    const url = `radars/${radarId}/testfalls`
    return saveData(url, {},'POST')
}

function postRadarTestActivation (radarId) {
    const url = `radars/${radarId}/testactivations`
    return saveData(url, {},'POST')
}

function requestLinkingRadar (payload) {
    const url = 'product-users/request-linking'
    return saveData(url, payload,'POST')
}

function postRadarHub(payload) {
    const url = '/radar-hubs'
    return saveData(url,payload,'POST')
}

function deleteRadarHub(payload) {
    const url = '/radar-hubs'
    return saveData(url,payload,'DELETE')
}

function getRadarHubs(radarId) {
    const url = `/radars/${radarId}/hubs`
    return getData(url)
}

function postRadarSpace(payload) {
    const url = '/radar-spaces'
    return saveData(url,payload,'POST')
}

function deleteRadarSpace(payload) {
    const url = '/radar-spaces'
    return saveData(url,payload,'DELETE')
}

function getRadarSpaces(radarId) {
    const url = `/radars/${radarId}/spaces`
    return getData(url)
}

function putRadarSpace(payload) {
    const url = `/radars/${payload.id}/spaces/${payload.old_space_id}`
    return saveData(url, payload,'PUT')
}

function getLatestAlarm (radarId) {
    const url = `radars/${radarId}/alarm-histories?size=1&sort=alarm_at,desc`
    return getData(url)
}

function putRadarCalibration (payload) {
    const url = `radars/${payload.id}/calibration`
    return saveData(url, payload,'PUT')
}

function getRadarCommands(radarId) {
    const url = `/radars/${radarId}/async-commands`
    return getData(url)
}

function postRadarCommands(payload) {
    const url = `/radars/${payload.id}/async-commands`
    return saveData(url,payload,'POST')
}

function getRadarSurrounds(radarId) {
    const url = `/radars/${radarId}/surrounds`
    return getData(url)
}

function putRadarSurrounds(payload) {
    const url = `/radars/${payload.id}/surrounds`
    return saveData(url,payload,'PUT')
}

function getRadarNotifications (params) {
    const url = `product-user-notifications?${queryString.stringify(params)}`
    return getData(url)
}

function putRadarNotifications(payload) {
    const url = 'product-user-notifications'
    return saveData(url,payload,'PUT')
}

export default {
    getRadar,
    getRadarAlarmHistory,
    getRadars,
    getRadarOrgs,
    getRadarStateHistory,
    postRadar,
    patchRadar,
    putRadarResolveAlarmWithCode,
    putRadarResolveSingleAlarmWithCode,
    getRadarUsers,
    postRadarUser,
    deleteRadarUser,
    putRadarReboot,
    postRadarTestFall,
    postRadarTestActivation,
    requestLinkingRadar,
    getRadarHubs,
    postRadarHub,
    deleteRadarHub,
    getRadarSpaces,
    postRadarSpace,
    deleteRadarSpace,
    putRadarSpace,
    getLatestAlarm,
    putRadarCalibration,
    getRadarConfig,
    postRadarConfig,
    getRadarCommands,
    postRadarCommands,
    getRadarSurrounds,
    putRadarSurrounds,
    getRadarNotifications,
    putRadarNotifications
}
