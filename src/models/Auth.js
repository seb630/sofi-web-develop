import { retrieveJSONData } from '@/utility/Storage'

const existingToken = retrieveJSONData('token')

export default {
    name: 'auth',
    initialState: {
        authToken: existingToken ? existingToken : null,
        remember: true,
    },
    reducers: {
    },
    effects: {
        getS(data, getState) {
            return getState()
        }
    }
}
