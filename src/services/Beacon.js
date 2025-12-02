import { getData, saveData } from '@/utility/AxiosCalls'
import queryString from 'query-string'
import _ from 'lodash'
import { globalConstants } from '@/_constants'
import axios from 'axios'

/** fetch all beacons head state
 * @param : {boolean} fetchArchived
 * @param : {boolean} fetchNonArchived
 * @return : {Promise}
*/
function fetchAllBeaconHeadState(params){
    const url = `beacons-data-head-states?${queryString.stringify(params)}`
    return getData(url)
}

/** fetch all beacons
 * @param : {boolean} fetchArchived
 * @param : {boolean} fetchNonArchived
 * @return : {Promise}
*/
function fetchAllBeacons (params) {
    const url = `beacons?${queryString.stringify(params)}`
    return getData(url)
}

/** fetch beacon
 * @return : Promise
*/
function fetchBeacon() {
    const url = 'beacons'
    return getData(url)
}

function postBeacons(payload) {
    const url = 'beacons'
    return saveData(url,payload,'POST')
}

function getBeaconById (intId) {
    const url = `beacons/intId/${intId}`
    return getData(url)
}

function getBeacon (beaconId) {
    const url = `beacons/${beaconId}`
    return getData(url)
}

/** fetch beacon head state
 * @param: beaconId
 * @return : Promise
*/
function fetchBeaconHeadState(params) {
    const url = `beacon-data-head-state?beaconId=${params}`
    return getData(url)
}

/** fetch beacon emergency contact
 * @param: beaconId
 * @return : Promise
*/
function fetchBeaconEmergencyContacts(params) {
    const url = `beacon-emergency-contacts/${params}`
    return getData(url)
}

function getEmergencyCallNumbers() {
    const url = 'beacon/emergency-call-numbers'
    return getData(url)
}

/** fetch beacon historical location with page
 * @param : {number} beaconId
 * @param : {date} start-date
 * @param : {date} end-date
 * @param : {page} page
 * @param : {size} size
 * @return : {Promise}
*/
function fetchBeaconHistoricalLocationWithPage(params) {
    const url = `beacon-gps-histories?${queryString.stringify(params)}`
    return getData(url)
}

/** fetch all beacon historical data in range
 * @param : {number} beaconId
 * @param : {date} start-date
 * @param : {date} end-date
 * @return: {Promise} waiting when all of request resolved
*/
async function fetchBeaconHistoricalLocation(params) {
    let requests = []
    const size = 300
    const firstLoad = await fetchBeaconHistoricalLocationWithPage(_.extend({},params,{ size, page: 0 }))
    for(let index = 1; index < firstLoad.total_pages ; ++ index){
        requests.push(fetchBeaconHistoricalLocationWithPage(_.extend({},params,{ size, page: index })))
    }

    if (requests.length > 0) {
        return Promise.all(requests).then((results) => {
            return results.reduce((prev,next) => {
                prev.content = prev.content.concat(next.content)
                return prev
            } , firstLoad)
        })
    }

    return firstLoad
}

/** save beacon infor
 * @param: { beacon_id, imei , phone , archived , display_name }
 * @return : Promise
*/
function saveBeaconInfor (params) {
    const url = `beacon/${params.pub_id}`
    return saveData(url,params,'PUT')
}

/** save emmergency contacts
 * @param : {}
 * @return : Promise
 */
function saveEmergencyContacts (params) {
    const url = 'beacon-emergency-contacts'
    return saveData(url,params,'PUT')
}

/** create Beacon
 * @param: {Object} params
 * @return: {Promise}
*/
function createBeacon(params) {
    const url = 'beacon'
    return saveData(url,params,'POST')
}

/** sms AGPS
 * @param {Object} params { beaconId }
 * @return {Promise}
*/
function smsAGPS(params) {
    const url = `sms-agps?${queryString.stringify(params)}`
    return saveData(url,{},'POST')
}

/** sms APN
 * @param {Object} params{ beaconId , apnId}
 * @return {Promise}
*/
function smsAPN(params) {
    const url = `sms-apn?${queryString.stringify(params)}`
    return saveData(url,{},'POST')
}

/** sms AGPS
 * @param {Object} params params{ beaconId }
 * @return {Promise}
*/
function smsServerAddress(params) {
    const url = `sms-server-address?${queryString.stringify(params)}`
    return saveData(url,{},'POST')
}

/** fetch Beacon associate with Hub
 * @param {Object} params { hubId }
 * @return {Promise}
*/
function fetchBeaconAssociateWithHub({ hubId }) {
    const url = `beacons/hubs/${hubId}`
    return getData(url)
}

/** associate Beacon to Hub
 * @param {Object} params
 * @return {Promise}
*/
function associateBeaconToHub({ beaconId, hubId }) {
    const url = `beacons/${beaconId}/hubs/${hubId}`
    return saveData(url,{},'PUT')
}

/** unassociate Beacon from hub
 * @param {Object} params
 * @return {Promise}
*/
function unassociateBeaconFromHub({ beaconId }) {
    const url = `beacons/${beaconId}/hubs`
    return saveData(url,{},'DELETE')
}

/** add User to beacon
 * @param {Object} params
 * @return {Promise}
*/
function linkBeaconUser ({ userId, beaconId }){
    const url = 'beacon-users'
    return saveData(url,{ user_id: userId , beacon_id: beaconId },'POST')
}

function requestLinkingBeacon (payload){
    const url = 'beacon-users/request-linking'
    return saveData(url,payload,'POST')
}

/** add User to beacon
 * @param {Object} params
 * @return {Promise}
*/
function unlinkBeaconUser ({ userId, beaconId }){
    const url = 'beacon-users'
    return saveData(url,{ user_id: userId , beacon_id: beaconId  },'DELETE')
}

function fetchBeaconUsers (beaconId) {
    const url = `beacons/${beaconId}/users`
    return getData(url)
}

function fetchBeaconRawData(params) {
    const url = `beacon-raw-data-histories?${queryString.stringify(params)}`
    return getData(url)
}

function fetchBeaconAlert(beaconId) {
    const url = `beacon-alert-conditions/${beaconId}`
    return getData(url)
}

function updateBeaconAlert (payload){
    const url = 'beacon-alert-conditions'
    return saveData(url,payload,'PUT')
}

function deleteBeaconAlert (beaconId, type='HUB_SPEAK_REMINDER_CHARGE_BEACON') {
    const url = `beacon-alert-conditions/${beaconId}/${type}`
    return saveData(url,{},'DELETE')
}

function getBeaconModels () {
    const url = 'enum/BeaconModel'
    return getData(url)
}

function getBeaconGeofence(beaconId) {
    const url = `beacons/${beaconId}/geofence`
    return getData(url)
}

function postBeaconGeofence(payload) {
    const url = `beacons/${payload.pub_id}/geofence`
    return saveData(url,payload,'POST')
}

function putBeaconGeofence(payload) {
    const url = `beacon-geofence/${payload.id}`
    return saveData(url,payload,'PUT')
}

function deleteBeaconGeofence(geofenceId) {
    const url = `beacon-geofence/${geofenceId}`
    return saveData(url,{},'DELETE')
}

function putBeaconFall(payload) {
    const url = `beacons/${payload.beacon_id}/fall`
    return saveData(url,payload,'POST')
}

function deleteBeaconCommandQueue(beaconId) {
    const url = `beacons/${beaconId}/command-queue`
    return saveData(url,{},'DELETE')
}

function getBeaconSettings(beaconId) {
    const url = `beacons/${beaconId}/settings`
    return getData(url)
}

function getBeaconPowerOptions(beaconId) {
    const url = `beacons/${beaconId}/report-interval-options`
    return getData(url)
}

function postURLSettings(beaconId) {
    const url = `beacons/${beaconId}/gps-url`
    return saveData(url,{},'POST')
}

function postTCPSettings(payload) {
    const url = `beacons/${payload.beacon_id}/${payload.feature}${payload.enabled!==undefined ? `?enabled=${payload.enabled}` : ''}`
    return saveData(url,payload,'POST')
}

function postSMSSettings(payload) {
    const url = `beacons/${payload.beacon_id}/sms-${payload.feature}${payload.enabled!==undefined ? `?enabled=${payload.enabled}` : ''}`
    return saveData(url,payload,'POST')
}

function putBeaconOOBE(payload) {
    const url = `beacon/${payload.beacon_id}/oobe?action=${payload.action}`
    return saveData(url,payload,'PUT')
}

function getBeaconOrgs(beaconId) {
    const url = `beacons/${beaconId}/orgs`
    return getData(url)
}

async function getAddressFromCoord(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${globalConstants.GOOGLE_WEB_SERVICE_KEY}`
    return axios({
        method: 'GET',
        url: url
    })
}

function postMassBeacons(payload) {
    const url = 'mass-product/beacon'
    return saveData(url,payload,'POST')
}

function getBeaconLinkedHub(beaconId) {
    const url = `beacons/${beaconId}/hubs`
    return getData(url)
}

function getEmergencyContactsByNumber(number,name) {
    const url = name ? `beacon-emergency-contacts/search?number=${number}&name=${name}` : `beacon-emergency-contacts/search?number=${number}`
    return getData(url)
}

function patchEmergencyContactsBulk(payload) {
    const url = 'beacon-emergency-contacts/bulk-update'
    return saveData(url,payload,'PATCH')
}

function postSMSPrefix(beaconId, payload) {
    const url = `beacons/${beaconId}/sms-prefix`
    return saveData(url,payload,'POST')
}

function getBeaconDeviceSettings(beaconId) {
    const url = `beacons/${beaconId}/device-settings`
    return getData(url)
}

function getBeaconFeatures() {
    const url = 'beacon-features'
    return getData(url)
}

function getBeaconAlarmDetail(alarmId) {
    const url = `beacon-alarms/${alarmId}`
    return getData(url)
}

function getBeaconOfflineDetail(alarmId) {
    const url = `beacon-offline-histories/${alarmId}`
    return getData(url)
}

function getBeaconHistoricalAlarms(params) {
    const url = `beacon-alarms?${queryString.stringify(params)}`
    return getData(url)
}

function postPhoneSwitches(beaconId, payload) {
    const url = `beacons/${beaconId}/phone-switches`
    return saveData(url,payload,'POST')
}

function postBulkUpload(payload) {
    const url = 'data-import'
    return saveData(url,payload,'POST')
}

function getBulkUploadList(type) {
    const url = `data-import?type=${type}`
    return getData(url)
}

function getBulkUploadDetail(uploadId) {
    const url = `data-import/${uploadId}`
    return getData(url)
}

function putBulkUpload(id) {
    const url = `data-import/${id}`
    return saveData(url,{},'PUT')
}

function getBulkUploadSample(type) {
    const url = `data-import-template?type=${type}`
    return getData(url, true)
}

function getBatchUpdates() {
    const url = 'batch-updates'
    return getData(url)
}

function getBatchUpdateById(id) {
    const url = `batch-updates/${id}`
    return getData(url)
}

function postBatchUpdate(payload) {
    const url = 'beacons/phone-switches'
    return saveData(url,payload,'POST')
}

function postBatchEC(payload) {
    const url = 'beacons/emergency-contacts'
    return saveData(url,payload,'POST')
}

function postBatchWM(payload) {
    const url = 'beacons/work-mode'
    return saveData(url,payload,'POST')
}

function postDefaultSettings(beaconId) {
    const url = `beacons/${beaconId}/device-settings`
    return saveData(url,null,'POST')
}

function getTPCount(beaconId) {
    const url = `beacons/${beaconId}/tp-accounts-count`
    return getData(url)
}

function getBeaconGeofenceHistory(historyId) {
    const url = `beacon-geofence-history/${historyId}`
    return getData(url)
}

function postFilteredBeaconsExport(payload) {
    const url = 'beacons-dump'
    return saveData(url,payload,'POST', true, true)
}

export default {
    requestLinkingBeacon,
    fetchBeacon,
    getBeacon,
    getBeaconById,
    postBeacons,
    fetchAllBeacons,
    fetchBeaconHeadState,
    fetchAllBeaconHeadState,
    fetchBeaconEmergencyContacts,
    fetchBeaconHistoricalLocation,
    fetchBeaconAssociateWithHub,
    getEmergencyCallNumbers,
    saveBeaconInfor,
    saveEmergencyContacts,
    createBeacon,
    smsAGPS,
    smsAPN,
    smsServerAddress,
    associateBeaconToHub,
    unassociateBeaconFromHub,
    unlinkBeaconUser,
    linkBeaconUser,
    fetchBeaconUsers,
    fetchBeaconRawData,
    updateBeaconAlert,
    fetchBeaconAlert,
    deleteBeaconAlert,
    getBeaconModels,
    getBeaconGeofence,
    postBeaconGeofence,
    putBeaconGeofence,
    deleteBeaconGeofence,
    putBeaconFall,
    deleteBeaconCommandQueue,
    getBeaconSettings,
    getBeaconPowerOptions,
    postURLSettings,
    postTCPSettings,
    postSMSSettings,
    putBeaconOOBE,
    getBeaconOrgs,
    getAddressFromCoord,
    postMassBeacons,
    getBeaconLinkedHub,
    getEmergencyContactsByNumber,
    patchEmergencyContactsBulk,
    postSMSPrefix,
    getBeaconDeviceSettings,
    getBeaconHistoricalAlarms,
    postPhoneSwitches,
    postBulkUpload,
    getBulkUploadList,
    putBulkUpload,
    getBulkUploadDetail,
    getBulkUploadSample,
    getBatchUpdates,
    getBatchUpdateById,
    postBatchUpdate,
    postBatchEC,
    postBatchWM,
    getTPCount,
    getBeaconAlarmDetail,
    getBeaconGeofenceHistory,
    postFilteredBeaconsExport,
    getBeaconOfflineDetail,
    postDefaultSettings,
    getBeaconFeatures
}
