import apnService from '../services/APN'
import { actions } from 'mirrorx'

export default {
    name: 'APN',
    initialState: {
        adminAPN: null,
        beaconAPN: null,
    },
    reducers: {
    },
    effects: {
        async fetchAllApn () {
            try {
                const data = await apnService.fetchAllAPNs({
                    fetchArchived: true,
                    fetchNonArchived: true
                })
                actions.APN.save({
                    adminAPN: data
                })
            } catch(err) {
                actions.APN.save({
                    adminAPN: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchBeaconApn (beaconId) {
            try {
                const data = await apnService.fetchBeaconAPNs(beaconId)
                actions.APN.save({
                    beaconAPN: data
                })
            } catch(err) {
                actions.APN.save({
                    beaconAPN: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createApn (params) {
            try {
                return await apnService.createAPN(params)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateApn ({ id, params}) {
            try {
                return await apnService.updateAPN(id,params)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        }
    }
}
