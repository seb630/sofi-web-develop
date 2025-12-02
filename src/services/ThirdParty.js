import { getData , saveData } from '@/utility/AxiosCalls'

function getTPIDestinations() {
    const url = 'tp-destinations'
    return getData(url)
}

function postTPIDestination(payload) {
    const url = 'tp-destinations'
    return saveData(url, payload, 'POST')
}

function updateTPIDestination(id, payload) {
    const url = `tp-destinations/${id}`
    return saveData(url, payload, 'PUT')
}

function deleteTPIDestination(id) {
    const url = `tp-destinations/${id}`
    return saveData(url, null, 'DELETE')
}

function getTPIDestinationKinds() {
    const url = 'enum/TpAccountKind'
    return getData(url)
}

function getHubTPs(hubId) {
    const url = `hubs/${hubId}/tp-accounts`
    return getData(url)
}

function postHubTP(hubId, payload) {
    const url = `hubs/${hubId}/tp-accounts`
    return saveData(url, payload, 'POST')
}

function updateHubTP(hubId, id, payload) {
    const url = `hubs/${hubId}/tp-accounts/${id}`
    return saveData(url, payload, 'PUT')
}

function deleteHubTP(hubId, id) {
    const url = `hubs/${hubId}/tp-accounts/${id}`
    return saveData(url, null, 'DELETE')
}

function getBeaconTPs(beaconId) {
    const url = `beacons/${beaconId}/tp-accounts`
    return getData(url)
}

function postBeaconTP(beaconId, payload) {
    const url = `beacons/${beaconId}/tp-accounts`
    return saveData(url, payload, 'POST')
}

function updateBeaconTP(beaconId, id, payload) {
    const url = `beacons/${beaconId}/tp-accounts/${id}`
    return saveData(url, payload, 'PUT')
}

function deleteBeaconTP(beaconId, id) {
    const url = `beacons/${beaconId}/tp-accounts/${id}`
    return saveData(url, null, 'DELETE')
}

function getRadarTPs(radarId) {
    const url = `products/${radarId}/tp-accounts`
    return getData(url)
}

function postRadarTP(radarId, payload) {
    const url = `products/${radarId}/tp-accounts`
    return saveData(url, payload, 'POST')
}

function updateRadarTP(radarId, id, payload) {
    const url = `products/${radarId}/tp-accounts/${id}`
    return saveData(url, payload, 'PUT')
}

function deleteRadarTP(radarId, id) {
    const url = `products/${radarId}/tp-accounts/${id}`
    return saveData(url, null, 'DELETE')
}

export default {
    getTPIDestinations,
    getTPIDestinationKinds,
    postTPIDestination,
    updateTPIDestination,
    deleteTPIDestination,
    getHubTPs,
    getBeaconTPs,
    postHubTP,
    postBeaconTP,
    updateHubTP,
    updateBeaconTP,
    deleteHubTP,
    deleteBeaconTP,
    getRadarTPs,
    postRadarTP,
    updateRadarTP,
    deleteRadarTP
}
