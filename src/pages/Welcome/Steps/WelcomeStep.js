import { Button } from 'antd'
import { Fragment } from 'react'
import HubIcon from '../../../images/hub_icon.svg'
import { actions } from 'mirrorx'
import { settings } from '../../Settings/Initial'
import { globalConstants } from '@/_constants'

const welcomeStep = (next, selectedHub, setting) =>{
    const initialise = () => {
        if(setting){
            next()
        } else{
            const hubId = selectedHub.hub_id
            actions.setting.saveSettings({hubId, settings}).then(() => {
                next()
            }, (error) => {
                this.setState({ updatePersonalMessage: globalConstants.WENT_WRONG + ' ' + error})
            })
        }
    }
    const title = 'Welcome'
    const content =
        <Fragment>
            <div className="wizardContent">
                <h4>Thanks for buying your {globalConstants.HUB_SOFIHUB}!</h4>
                <div className="text-center"><HubIcon className="hubImg"/></div>
                <p>You&#39;re almost there, we need just a few more details from you in order to finish setting up the {globalConstants.HUB_SOFIHUB}.</p>
            </div>
            <div className="steps-action">
                <Button type="primary" onClick={initialise} className="floatRight">Let&#39;s go!</Button>
            </div>
        </Fragment>
    return {title,content}
}

export default welcomeStep
