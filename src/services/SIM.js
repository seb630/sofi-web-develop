import { getData, saveData } from '@/utility/AxiosCalls'

function getSIMActivations() {
    const url = 'sim-activations'
    return getData(url)
}

function getSIMActivation(id) {
    const url = `sim-activations/${id}?refresh=true`
    return getData(url)
}

function postSIMActivation(payload) {
    const url = 'sim-activations'
    return saveData(url, payload, 'POST')
}

function updateSIMActivation(payload) {
    const url = `sim-activations/${payload.id}`
    return saveData(url, payload, 'PUT')
}

function deleteSIMActivation(id) {
    const url = `sim-activations/${id}`
    return saveData(url, null, 'DELETE')
}

function getSIMProviders() {
    const url = 'sim-providers'
    return getData(url)
}

function getCarriers(providerName) {
    const url = `sim-providers/${providerName}/carriers`
    return getData(url)
}

function getICCIDs(providerName) {
    const url = `sim-providers/${providerName}/iccids`
    return getData(url)
}

function putSIMActivate(id, notify) {
    const url = `sim-activations/${id}/activate?notifyOnActive=${notify}`
    return saveData(url, {}, 'PUT')
}

function putSIMDeactivate(id) {
    const url = `sim-activations/${id}/deactivate`
    return saveData(url, {}, 'PUT')
}

function getProductActivation(type, macOrImei) {
    const url = `sim-activations/product?productType=${type}&productMacOrImei=${macOrImei.trim()}`
    return getData(url)
}

function putSIMDeactivationSuggestion(payload) {
    const url = 'sim-activations/deactivation-suggestion'
    return saveData(url, payload, 'PUT')
}

function putSIMMassDeactivation(payload) {
    const url = 'sim-activations/mass-deactivation'
    return saveData(url, payload, 'PUT')
}

function getScheduledDeactivations(page=0,size=100) {
    const url = `scheduled-deactivations?size=${size}&page=${page}`
    return getData(url)
}

function postScheduledDeactivation(payload) {
    const url = 'scheduled-deactivations'
    return saveData(url, payload, 'POST')
}

function updateScheduledDeactivation(payload) {
    const url = `scheduled-deactivations/${payload.id}`
    return saveData(url, payload, 'PUT')
}

function deleteScheduledDeactivation(id) {
    const url = `scheduled-deactivations/${id}`
    return saveData(url, null, 'DELETE')
}

function getActiveDeactivationById(id) {
    const url = `scheduled-deactivations/active?simActId=${id}`
    return getData(url)
}

export default {
    getSIMActivations,
    getSIMActivation,
    postSIMActivation,
    updateSIMActivation,
    deleteSIMActivation,
    putSIMActivate,
    putSIMDeactivate,
    getICCIDs,
    getCarriers,
    getSIMProviders,
    getProductActivation,
    putSIMMassDeactivation,
    putSIMDeactivationSuggestion,
    getScheduledDeactivations,
    postScheduledDeactivation,
    updateScheduledDeactivation,
    deleteScheduledDeactivation,
    getActiveDeactivationById

}
