import { actions } from 'mirrorx'
import SettingService from '../services/Setting'

export default {
    name: 'setting',
    initialState: {
        reminders: null,
        settings: null,
        featureFlags: null,
        anomalyPreferences: null,
        holidays: null,
        apiVersion: null,
        ttsVoice : null,
        ttsSpeed: null,
    },
    reducers: {
    },
    effects: {
        getS(data, getState){
            return getState()
        },
        async getReminders(hubId){
            const result = await SettingService.reminderData(hubId)
            actions.setting.save({
                reminders: result
            })
        },
        async removeReminder({hubId, reminderId}){
            await SettingService.deleteReminder(hubId, reminderId).then(()=>
                actions.setting.getReminders(hubId)
            )
        },
        async updateReminder({hubId, reminderId, payload}){
            await SettingService.putReminder(hubId, reminderId, payload).then(()=>
                actions.setting.getReminders(hubId)
            )
        },
        async addReminder({hubId, payload}){
            await SettingService.postReminder(hubId, payload).then(()=>
                actions.setting.getReminders(hubId)
            )
        },
        async getSettings(hubId){
            const result = await SettingService.settingData(hubId)
            actions.setting.save({
                settings: result
            })
        },
        async getFeatureFlags(hubId){
            const result = await SettingService.featureFlagsData(hubId)
            actions.setting.save({
                featureFlags: result
            })
        },
        async getAnomalyPreferences(hubId){
            const result = await SettingService.anomalyPreferencesData(hubId)
            actions.setting.save({
                anomalyPreferences: result
            })
        },
        async getHolidays(hubId){
            const result = await SettingService.holidayData(hubId)
            actions.setting.save({
                holidays: result.content || []
            })
        },
        async saveSettings({hubId, settings}){
            await SettingService.postSettings(hubId, settings).then((data)=> {
                actions.setting.getSettings(hubId)
                return data
            }
            )
        },
        async saveFeatureFlags({hubId, featureFlags}){
            try {
                await SettingService.postFeatureFlags(hubId, featureFlags)
                !featureFlags?.notRefresh && actions.setting.getFeatureFlags(hubId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }

        },
        async saveAnomalyPreferences({hubId, anomalyPreferences}){
            await SettingService.postAnomalyPreferences(hubId, anomalyPreferences).then((data)=> {
                actions.setting.save({
                    anomalyPreferences: data
                })
            }
            )
        },
        async removeHoliday({hubId, holidayId}){
            await SettingService.deleteHoliday(hubId, holidayId).then(()=>
                actions.setting.getHolidays(hubId)
            )
        },
        async updateHoliday({hubId, holidayId, holiday}){
            try {
                await SettingService.updateHoliday(hubId, holidayId, holiday).then(()=>
                    actions.setting.getHolidays(hubId)
                )
            }catch (err) {
                return Promise.reject(err.response)
            }
        },
        async addHoliday({hubId, holiday}){
            try {
                await SettingService.postHoliday(hubId, holiday).then(()=>
                    actions.setting.getHolidays(hubId)
                )
            }catch (err) {
                return Promise.reject(err.response)
            }
        },
        async getTTSVoice(){
            const result = await SettingService.getTTSVoice()
            actions.setting.save({
                ttsVoice: result
            })
        },
        async getTTSSpeed(){
            const result = await SettingService.getTTSSpeed()
            actions.setting.save({
                ttsSpeed: result
            })
        },
    }
}
