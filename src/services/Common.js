import { getData } from '@/utility/AxiosCalls'
import queryString from 'query-string'
import axios from 'axios'
import {globalConstants} from '@/_constants'

function getBeaconEmergencyContactChangeLogs(params){
    const url = `change-logs?${queryString.stringify(params)}`
    return getData(url)
}

function getBECChanges(id){
    const url = `bec-changes/${id}`
    return getData(url)
}

function getTC () {
    const url = `${globalConstants.API_BASE_URL}static-text/terms-conditions`
    return axios({
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'text/html',
        },
    })
}

function getPrivacy () {
    const url = `${globalConstants.API_BASE_URL}static-text/privacy-policy`
    return axios({
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'text/html',
        },
    })
}

export default {
    getBeaconEmergencyContactChangeLogs,
    getBECChanges,
    getTC,
    getPrivacy
}
