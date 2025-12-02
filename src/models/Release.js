import { actions } from 'mirrorx'
import releaseService from '../services/Release'

export default {
    name: 'release',
    initialState: {
        releases: null,
        permissions: null,
        beaconReleases: null,
        beaconPermissions: null,
        radarReleases: null,
        radarPermissions: null,
    },
    reducers: {
    },
    effects: {
        getS(data, getState) {
            return getState()
        },
        async getReleases() {
            const params = {
                sort: 'released_at,asc',
                size: 2000
            }
            const result = await releaseService.allReleaseData(params)
            actions.release.save({
                releases: result.content
            })
        },
        async createRelease(payload) {
            await releaseService.postRelease(payload).then((data) => {
                actions.release.getReleases()
                return data
            })
        },

        async getReleasePermission (releaseId) {
            let allResults = []
            let newPage = 0
            let result = {}
            try {
                do {
                    result = await releaseService.getReleasePermission(releaseId, {size: 100, page: newPage})
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.release.save({
                    permissions: allResults
                })
            } catch(err) {
                actions.release.save({
                    permissions: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async permit({releaseId, payload}) {
            await releaseService.postPermit(releaseId, payload).then(() => {
                actions.release.getReleasePermission(releaseId)
            })
        },
        async unPermit({releaseId, permitId}) {
            await releaseService.deletePermit(releaseId, permitId).then(() => {
                actions.release.getReleasePermission(releaseId)
            })
        },

        async getBeaconReleases() {
            const params = {
                sort: 'released_at,asc',
                size: 2000
            }
            const result = await releaseService.allBeaconReleaseData(params)
            actions.release.save({
                beaconReleases: result.content
            })
        },
        async createBeaconRelease(payload) {
            await releaseService.postBeaconRelease(payload).then((data) => {
                actions.release.getBeaconReleases()
                return data
            })
        },

        async getBeaconReleasePermission (releaseId) {
            let allResults = []
            let newPage = 0
            let result = {}
            try {
                do {
                    result = await releaseService.getBeaconReleasePermission(releaseId, {size: 100, page: newPage})
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.release.save({
                    beaconPermissions: allResults
                })
            } catch(err) {
                actions.release.save({
                    beaconPermissions: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async beaconPermit({releaseId, payload}) {
            await releaseService.postBeaconPermit(releaseId, payload).then(() => {
                actions.release.getBeaconReleasePermission(releaseId)
            })
        },
        async beaconUnPermit({releaseId, permitId}) {
            await releaseService.deleteBeaconPermit(releaseId, permitId).then(() => {
                actions.release.getBeaconReleasePermission(releaseId)
            })
        },

        async getRadarReleases() {
            const params = {
                sort: 'released_at,asc',
                size: 2000
            }
            const result = await releaseService.allRadarReleaseData(params)
            actions.release.save({
                radarReleases: result.content
            })
        },
        async createRadarRelease(payload) {
            await releaseService.postRadarRelease(payload).then((data) => {
                actions.release.getRadarReleases()
                return data
            })
        },

        async getRadarReleasePermission (releaseId) {
            let allResults = []
            let newPage = 0
            let result = {}
            try {
                do {
                    result = await releaseService.getRadarReleasePermission(releaseId, {size: 100, page: newPage})
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.release.save({
                    radarPermissions: allResults
                })
            } catch(err) {
                actions.release.save({
                    radarPermissions: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async radarPermit({releaseId, payload}) {
            await releaseService.postRadarPermit(releaseId, payload).then(() => {
                actions.release.getRadarReleasePermission(releaseId)
            })
        },
        async radarUnPermit({releaseId, permitId}) {
            await releaseService.deleteRadarPermit(releaseId, permitId).then(() => {
                actions.release.getRadarReleasePermission(releaseId)
            })
        }
    }
}
