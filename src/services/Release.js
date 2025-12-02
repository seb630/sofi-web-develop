import { getData, saveData } from '@/utility/AxiosCalls'
import queryString from 'query-string'

function allReleaseData(params) {
    const url = `releases?${queryString.stringify(params)}`
    return getData(url)
}

function postRelease(payload) {
    const url = 'releases'
    return saveData(url, payload, 'POST')
}

function getReleasePermission(releaseId, params) {
    const url = `releases/${releaseId}/permissions?${queryString.stringify(params)}`
    return getData(url)
}

function postPermit(releaseId, payload) {
    const url = `releases/${releaseId}/permissions`
    return saveData(url, payload, 'POST')
}

function deletePermit(releaseId, permitId) {
    const url = `releases/${releaseId}/permissions/${permitId}`
    return saveData(url, null, 'DELETE')
}

function allBeaconReleaseData(params) {
    const url = `beacon-releases?${queryString.stringify(params)}`
    return getData(url)
}

function postBeaconRelease(payload) {
    const url = 'beacon-releases'
    return saveData(url, payload, 'POST')
}

function getBeaconReleasePermission(releaseId, params) {
    const url = `beacon-releases/${releaseId}/permissions?${queryString.stringify(params)}`
    return getData(url)
}

function postBeaconPermit(releaseId, payload) {
    const url = `beacon-releases/${releaseId}/permissions`
    return saveData(url, payload, 'POST')
}

function deleteBeaconPermit(releaseId, permitId) {
    const url = `beacon-releases/${releaseId}/permissions/${permitId}`
    return saveData(url, null, 'DELETE')
}

function allRadarReleaseData(params) {
    const url = `radar-releases?${queryString.stringify(params)}`
    return getData(url)
}

function postRadarRelease(payload) {
    const url = 'radar-releases'
    return saveData(url, payload, 'POST')
}

function getRadarReleasePermission(releaseId, params) {
    const url = `radar-releases/${releaseId}/permissions?${queryString.stringify(params)}`
    return getData(url)
}

function postRadarPermit(releaseId, payload) {
    const url = `radar-releases/${releaseId}/permissions`
    return saveData(url, payload, 'POST')
}

function deleteRadarPermit(releaseId, permitId) {
    const url = `radar-releases/${releaseId}/permissions/${permitId}`
    return saveData(url, null, 'DELETE')
}

export default {
    allReleaseData,
    postRelease,
    getReleasePermission,
    postPermit,
    deletePermit,
    allBeaconReleaseData,
    postBeaconPermit,
    postBeaconRelease,
    deleteBeaconPermit,
    getBeaconReleasePermission,
    allRadarReleaseData,
    postRadarPermit,
    postRadarRelease,
    deleteRadarPermit,
    getRadarReleasePermission
}
