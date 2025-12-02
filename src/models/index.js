import UserModel from './User'
import HubModel from './Hub'
import SettingModel from './Setting'
import ReleaseModel from './Release'
import AuthModel from './Auth'
import SofiBeaconModel from './SofiBeacon'
import Common from './Common'
import Apn from './Apn'
import ThirdParty from './ThirdParty'
import BillingModel from './Billing'
import OrgModel from './Organisation'
import { SofiHubModel } from './sofiHubModel'
import PermissionModel from './Permission'
import SIMModel from './SIM'
import RadarModel from './Radar'

const initModels = (mirror) => {
    mirror.model(SofiHubModel(UserModel))
    mirror.model(SofiHubModel(SettingModel))
    mirror.model(SofiHubModel(HubModel))
    mirror.model(SofiHubModel(ReleaseModel))
    mirror.model(SofiHubModel(AuthModel))
    mirror.model(SofiHubModel(SofiBeaconModel))
    mirror.model(SofiHubModel(PermissionModel))
    mirror.model(SofiHubModel(Apn))
    mirror.model(SofiHubModel(BillingModel))
    mirror.model(SofiHubModel(ThirdParty))
    mirror.model(SofiHubModel(OrgModel))
    mirror.model(SofiHubModel(SIMModel))
    mirror.model(SofiHubModel(RadarModel))
    mirror.model(SofiHubModel(Common))

}

export default initModels

