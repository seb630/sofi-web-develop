import {MyIcon} from '../../pages/Common/Common'

function SensorBattery (props) {
    const { battery, admin } = props
    return(
        <span className="batteryLevel">{admin && <span className="">{battery>100 ? 100 : battery}%</span>}
            {
                battery >= '0' && battery < '30'
                    ? <MyIcon type="icon-battery-0"/>
                    : ''
            }
            {
                battery >= '30' && battery < '50'
                    ? <MyIcon type="icon-battery2"/>
                    : ''
            }
            {
                battery >= '50' && battery <= '69'
                    ? <MyIcon type="icon-battery3"/>
                    : ''
            }
            {
                battery >= '70'
                    ? <MyIcon type="icon-battery4"/>
                    : ''
            }</span>
    )
}

export default SensorBattery

