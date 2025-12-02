import {Redirect} from 'mirrorx'
import MFACodePage from './MFACodePage'
import MFAConfigPage from './MFAConfigPage'
import { retrieveJSONData } from '@/utility/Storage'


const MFAPage = (props) => {
    const {sourcePage} = props
    const token = retrieveJSONData('token')
    return(
        token?.mfa_enabled && token?.mfa_required ?
            token?.mfa_code_verified ? <MFACodePage {...props}/> : <MFAConfigPage {...props}/>
            : <Redirect to={sourcePage||'/deviceSelection'} />
    )
}

export default MFAPage
