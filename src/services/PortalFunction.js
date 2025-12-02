import { getData , saveData } from '../utility/AxiosCalls'
import queryString from 'query-string'

function getPortalFunctionRules(feature) {
    const url = `portal-function-rules?function=${feature}`
    return getData(url)
}

function postPortalFunctionRules(payload) {
    const url = 'portal-function-rules'
    return saveData(url, payload, 'POST')
}

function putPortalFunctionRules(payload) {
    const url = `portal-function-rules/${payload.rule_id}`
    return saveData(url, payload, 'PUT')
}

function deletePortalFunctionRules(ruleId) {
    const url = `portal-function-rules/${ruleId}`
    return saveData(url, {}, 'DELETE')
}

function getProductPortalFunctionRules(params) {
    const url = `portal-function-rules/product/?${queryString.stringify(params)}`
    return getData(url)
}

export default {
    getPortalFunctionRules,
    getProductPortalFunctionRules,
    postPortalFunctionRules,
    putPortalFunctionRules,
    deletePortalFunctionRules,
}
