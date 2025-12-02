import { getData, saveData } from '../utility/AxiosCalls'

function reminderData (hubId) {
    const url = `hubs/${hubId}/reminders?active-only=true`
    return getData(url)
}

function deleteReminder (hubId, reminderId) {
    const url = `hubs/${hubId}/reminders/${reminderId}`
    return saveData(url, null, 'DELETE')
}

function putReminder (hubId, reminderId, payload) {
    const url = `hubs/${hubId}/reminders/${reminderId}`
    return saveData(url, payload, 'PUT')
}

function postReminder (hubId, payload) {
    const url = `hubs/${hubId}/reminders`
    return saveData(url, payload, 'POST')
}

function settingData (hubId) {
    const url = `hubs/${hubId}/settings`
    return getData(url)
}

function postSettings (hubId, settings) {
    const url = `hubs/${hubId}/settings`
    return saveData(url, settings, 'POST')
}

function featureFlagsData (hubId) {
    const url = `hubs/${hubId}/feature-flags`
    return getData(url)
}

function anomalyPreferencesData (hubId) {
    const url = `hubs/${hubId}/anomaly-preferences`
    return getData(url)
}

function holidayData (hubId) {
    const url = `hubs/${hubId}/holidays`
    return getData(url)
}

function deleteHoliday (hubId, holidayId) {
    const url = `hubs/${hubId}/holidays/${holidayId}`
    return saveData(url, null, 'DELETE')
}

function postHoliday (hubId, holiday) {
    const url = `hubs/${hubId}/holidays`
    return saveData(url, holiday, 'POST')
}

function updateHoliday (hubId, holidayId, holiday) {
    const url = `hubs/${hubId}/holidays/${holidayId}`
    return saveData(url, holiday, 'PUT')
}

function postFeatureFlags (hubId, featureFlags) {
    const url = `hubs/${hubId}/feature-flags`
    return saveData(url, featureFlags, 'PUT')
}

function postAnomalyPreferences (hubId, alertFlags) {
    const url = `hubs/${hubId}/anomaly-preferences`
    return saveData(url, alertFlags, 'PUT')
}

function getTTSVoice () {
    const url = 'enum/TtsVoice'
    return getData(url)
}

function getTTSSpeed () {
    const url = 'enum/TtsSpeed'
    return getData(url)
}

export default {
    reminderData,
    deleteReminder,
    putReminder,
    postReminder,
    settingData,
    postSettings,
    featureFlagsData,
    anomalyPreferencesData,
    holidayData,
    deleteHoliday,
    postHoliday,
    postFeatureFlags,
    postAnomalyPreferences,
    getTTSVoice,
    getTTSSpeed,
    updateHoliday
}
