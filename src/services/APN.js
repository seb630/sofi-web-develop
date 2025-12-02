import { getData , saveData } from '../utility/AxiosCalls'
import queryString from 'query-string'

/** fetch all apns
 * @param {boolean} fetchArchived
 * @param {boolean} fetchNonArchived
 * @return {Promise}
*/
function fetchAllAPNs(params) {
    const url = `beacon-apn?${queryString.stringify(params)}`
    return getData(url)
}

/** create APN
 * @return {Promise}
*/
function createAPN (params) {
    const url = 'beacon-apn'
    return saveData(url,params,'POST')
}

/** create APN
 * @return {Promise}
*/
function updateAPN (id,params) {
    const url = `beacon-apn/${id}`
    return saveData(url,params,'PUT')
}

/** Delete APN
 * @return {Promise}
*/
function deleteAPN (id) {
    const url = `beacon-apn/${id}`
    return saveData(url,{},'DELETE')
}

function fetchBeaconAPNs(beaconId) {
    const url = `/orgs/beacon-apn?beaconId=${beaconId}`
    return getData(url)
}

export default {
    fetchAllAPNs,
    createAPN,
    updateAPN,
    deleteAPN,
    fetchBeaconAPNs
}
