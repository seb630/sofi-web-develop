import './DeviceStatus.scss'

function DeviceStatus (props) {
    let { status, style } = props
    status = status || 'OFFLINE'
    return (
        <span style={style} className={`deviceStatus deviceStatus-${status?.toLowerCase()}`}>{ status }</span>
    )
}

export default DeviceStatus

