import TPService from '../services/ThirdParty'
import { actions } from 'mirrorx'

export default {
    name: 'thirdParty',
    initialState: {
        TPDestinations: null,
        TPKinds: null,
    },
    reducers: {
    },
    effects: {
        async fetchAllDestination () {
            try {
                const data = await TPService.getTPIDestinations()
                actions.thirdParty.save({
                    TPDestinations: data
                })
            } catch(err) {
                actions.thirdParty.save({
                    TPDestinations: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchAllKinds () {
            try {
                const data = await TPService.getTPIDestinationKinds()
                actions.thirdParty.save({
                    TPKinds: data
                })
            } catch(err) {
                actions.thirdParty.save({
                    TPKinds: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createDestination (payload) {
            try {
                return await TPService.postTPIDestination(payload).then(()=>{
                    actions.thirdParty.fetchAllDestination()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateDestination ({ id, payload}) {
            try {
                return await TPService.updateTPIDestination(id,payload).then(()=>{
                    actions.thirdParty.fetchAllDestination()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteDestination (id) {
            try {
                return await TPService.deleteTPIDestination(id).then(()=>{
                    actions.thirdParty.fetchAllDestination()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        }
    }
}
