import {getData, saveData} from '@/utility/AxiosCalls'
import moment from 'moment/moment'
import { format4Api } from '@/utility/Locale'
import { globalConstants } from '@/_constants'

function hubsData (page, size) {
    const url = `hubs?size=${size}&page=${page}`
    return getData(url)
}

function getHub (hubId) {
    const url = `hubs/${hubId}`
    return getData(url)
}

function sensorData (hubId) {
    const url = `hubs/${hubId}/device-statuses`
    return getData(url)
}

function hubUserData (hubId) {
    const url = `hubs/${hubId}/users`
    return getData(url)
}

function hubStatus (hubId) {
    const url = `hubs/${hubId}/resource-status`
    return getData(url)
}

function hubSpaces (hubId) {
    const url = `hubs/${hubId}/spaces`
    return getData(url)
}

function hubDevices (hubId) {
    const url = `hubs/${hubId}/devices`
    return getData(url)
}

function hubNewDevices (hubId) {
    const url = `hubs/${hubId}/new-devices`
    return getData(url)
}

function hubMessages (hubId, page) {
    const start = format4Api(moment()
        .subtract(7, 'day')
        .startOf('day'))
    const url = `hubs/${hubId}/messages?type=SPEAK&page=${page - 1}&sort=sent_at,desc&size=${globalConstants.MESSAGE_PAGE_SIZE}&after=${start}`
    return getData(url)
}

function hubErrors (hubId, size, page, filter, sorter) {
    const url = filter ?  `hubs/${hubId}/errors?page=${page}&size=${size}&sort=${sorter}&level=${filter}`:
        `hubs/${hubId}/errors?page=${page}&size=${size}&sort=${sorter}`
    return getData(url)
}

function hubTraces (hubId, size, page) {
    const url = `hubs/${hubId}/hub-event-traces?page=${page}&size=${size}&sort=uploaded_at,desc`
    return getData(url)
}

function eventTraceFile (traceId) {
    const url = `hub-event-trace-files/${traceId}`
    return getData(url, true)
}

function hubAnomalies (hubId, page) {
    const url = `hubs/${hubId}/anomalies?sort=occurred_at,desc&page=${page}`
    return getData(url)
}

function getUnResolvedAnomalies (hubId) {
    const url = `hubs/${hubId}/anomalies?only-unresolved=true&sort=occurred_at,desc&size=30`
    return getData(url)
}

function resolveAnomaly (anomalyId, hubId, userId ) {
    const url = `hubs/${hubId}/anomalies/${anomalyId}/resolve`
    const payload = {
        'resolution': 'CARER',
        'resolvedBy': userId,
    }
    return saveData(url, payload, 'PUT')
}

function hubLastKnown (hubId) {
    const url = `hubs/${hubId}/last-known-occupancy`
    return getData(url)
}

function getDetailedMessage (hubId, fromTime, toTime, size, p) {
    const url = `hubs/${hubId}/messages?after=${format4Api(fromTime)}&before=${format4Api(toTime)}&size=${size}&page=${p}&sort=sent_at,desc`
    return getData(url)
}

function getDetailedMedication (hubId, fromTime, toTime, size, p) {
    const url = `/hubs/${hubId}/resident-activity?classifier=ACCESSED_MEDICATION&from=${format4Api(fromTime)}&to=${format4Api(toTime)}&size=${size}&page=${p}&sort=occurred_at,desc`
    return getData(url)
}

function getDetailedAnomalies (hubId, fromTime, toTime, size, p) {
    const url = `hubs/${hubId}/anomalies?from=${format4Api(fromTime)}&to=${format4Api(toTime)}&size=${size}&page=${p}
    &sort=occurred_at,desc`
    return getData(url)
}

function getDetailedActionState (hubId, fromTime, toTime, size, p) {
    const url = `hubs/${hubId}/device-action-state-histories?from=${format4Api(fromTime)}&to=${format4Api(toTime)}&size=${size}&page=${p}&sort=last_update_at,desc`
    return getData(url)
}

function getDetailedOccupancies (hubId, fromTime, toTime, size, p, condensed) {
    const url = `hubs/${hubId}/occupancy-periods?condensed=${condensed}&from=${format4Api(fromTime)}&to=${format4Api(toTime)}&size=${size}&page=${p}&sort=exited_at,desc`
    return getData(url)
}

function getLastOccupancies (hubId, toTime, size) {
    const url = `hubs/${hubId}/occupancy-periods?to=${format4Api(toTime)}&size=${size}&sort=exited_at,desc`
    return getData(url)
}

function getInstruction (hubId, instructionId) {
    const url = `hubs/${hubId}/instructions/${instructionId}`
    return getData(url)
}

function postTestMessage (hubId, payload ) {
    const url = `hubs/${hubId}/instructions`
    return saveData(url, payload, 'POST')
}

function restart (hubId) {
    const url = `hubs/${hubId}/instructions`
    const payload = {
        data: {},
        hub_id: hubId,
        instruction_type: 'RESTART_HUB'
    }
    return saveData(url, payload, 'POST')
}

function traceUpload (hubId) {
    const url = `hubs/${hubId}/instructions`
    const payload = {
        data: {},
        hub_id: hubId,
        instruction_type: 'UPLOAD_TRACE'
    }
    return saveData(url, payload, 'POST')
}

function checkForUpdates (hubId) {
    const url = `hubs/${hubId}/instructions`
    const payload = {
        data: {},
        hub_id: hubId,
        instruction_type: 'CHECK_FOR_UPDATE'
    }
    return saveData(url, payload, 'POST')
}

function putHub (hub) {
    const url = `hubs/${hub.hub_id}`
    return saveData(url, hub, 'PUT')
}

function postHubSpace (hubId, space) {
    const url = `hubs/${hubId}/spaces`
    return saveData(url, space, 'POST')
}

function putHubSpace (hubId, space) {
    const url = `hubs/${hubId}/spaces/${space.space_id}`
    return saveData(url, space, 'PUT')
}

function postHubDevices (hubId, device) {
    const url = `hubs/${hubId}/devices`
    return saveData(url, device, 'POST')
}

function putHubDevice (hubId, device) {
    const url = `hubs/${hubId}/devices/${device.device_id}`
    return saveData(url, device, 'PUT')
}

/** fetch hub
 * @param {Object} params
 * @return {Promise}
*/
function fetchHub({ hubId }) {
    const url = `hubs/${hubId}`
    return getData(url)
}

/** fetch beacon suggestion time
 * @param {Object} params
 * @return {Promise}
*/
function fetchBeaconSuggestionsTime({ hubId }) {
    const url = `hubs/${hubId}/beacon-suggestions`
    return getData(url)
}

function updateHouseJSON (hubId) {
    const url = `hubs/${hubId}/download-house-config`
    return saveData(url, {}, 'POST')
}

function addSensor (hubId) {
    const url = `hubs/${hubId}/add-sensor`
    return saveData(url, {}, 'POST')
}

function replaceSensor (hubId, deviceId) {
    const url = `hubs/${hubId}/devices/${deviceId}/replace-sensor`
    return saveData(url, {}, 'POST')
}

function updateSensor (hubId, payload) {
    const url = `hubs/${hubId}/update-sensor`
    return saveData(url, payload, 'POST')
}

function offSensor (hubId, payload) {
    const url = `hubs/${hubId}/off-sensor?device_id=${payload.device_id}`
    return saveData(url, payload, 'POST')
}

function cancelSensor (hubId) {
    const url = `hubs/${hubId}/cancel-pairing`
    return saveData(url, {}, 'POST')
}

function removeSensor (payload) {
    const url = `hubs/${payload.hub_id}/devices/${payload.device_id}`
    return saveData(url, payload, 'DELETE')
}

function removeNewSensor (payload) {
    const url = `hubs/${payload.hub_id}/new-devices/${payload.device_id}`
    return saveData(url, payload, 'DELETE')
}

function deleteSpace (payload) {
    const url = `hubs/${payload.hub_id}/spaces/${payload.space_id}`
    return saveData(url, payload, 'DELETE')
}

function linkSensorToSpace (payload) {
    const url = `spaces/${payload.space_id}/new-devices`
    return saveData(url, payload, 'POST')
}

function getHubNetwork(hubId) {
    const url = `hubs/${hubId}/network`
    return getData(url)
}

function putHubNetwork(hubId, payload) {
    const url = `hubs/${hubId}/network?action=${payload.action}`
    return saveData(url, payload, 'PUT')
}

function updateHubName (payload) {
    const url = `hubs/${payload.hub_id}/display-name`
    return saveData(url, payload, 'PUT')
}

function putHubOOBE(payload) {
    const url = `hubs/${payload.hub_id}/oobe?action=${payload.action}`
    return saveData(url,payload,'PUT')
}

function getHubOrgs(hubId) {
    const url = `hubs/${hubId}/orgs`
    return getData(url)
}

function getEventRules(hubId) {
    const url = `hubs/${hubId}/hub-event-rules`
    return getData(url)
}

function postEventRules(hubId, payload) {
    const url = `hubs/${hubId}/hub-event-rules`
    return saveData(url,payload,'POST')
}

function putEventRules(hubId, payload) {
    const url = `hubs/${hubId}/hub-event-rules/${payload.hub_event_rule_id}`
    return saveData(url,payload,'PUT')
}

function deleteEventRules (hubId, hubEventRuleId) {
    const url = `hubs/${hubId}/hub-event-rules/${hubEventRuleId}`
    return saveData(url, null, 'DELETE')
}

function getEventRuleLogs(hubId) {
    const url = `hubs/${hubId}/hub-event-rule-logs`
    return getData(url)
}

function getIntervalConfig(deviceId) {
    const url = `devices/${deviceId}/interval-config`
    return getData(url)
}

function putIntervalConfig(deviceId, payload) {
    const url = `devices/${deviceId}/interval-config`
    return saveData(url,payload,'PUT')
}

function getHubRadars(hubId) {
    const url = `radar-spaces?hubId=${hubId}`
    return getData(url)
}

export default {
    fetchHub,
    getHub,
    putHubDevice,
    postHubDevices,
    putHubSpace,
    postHubSpace,
    putHub,
    checkForUpdates,
    traceUpload,
    restart,
    postTestMessage,
    getDetailedActionState,
    getDetailedOccupancies,
    getDetailedAnomalies,
    getDetailedMedication,
    getDetailedMessage,
    hubLastKnown,
    resolveAnomaly,
    hubAnomalies,
    eventTraceFile,
    hubTraces,
    hubErrors,
    hubMessages,
    hubDevices,
    hubSpaces,
    hubStatus,
    hubUserData,
    sensorData,
    hubsData,
    fetchBeaconSuggestionsTime,
    getUnResolvedAnomalies,
    updateHouseJSON,
    removeSensor,
    addSensor,
    cancelSensor,
    offSensor,
    hubNewDevices,
    removeNewSensor,
    linkSensorToSpace,
    updateSensor,
    getInstruction,
    deleteSpace,
    replaceSensor,
    getLastOccupancies,
    putHubNetwork,
    getHubNetwork,
    updateHubName,
    putHubOOBE,
    getHubOrgs,
    getEventRuleLogs,
    getEventRules,
    postEventRules,
    putEventRules,
    deleteEventRules,
    getIntervalConfig,
    putIntervalConfig,
    getHubRadars
}
