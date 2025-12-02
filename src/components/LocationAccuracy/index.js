import './LocationAccuracy.scss'

function LocationAccuracy (props) {
    let { status } = props
    status = status || 'Inaccurate'
    return (
        <span className={`locationAccuracy locationAccuracy-${status && status.toLowerCase()}`}>{ status }</span>
    )
}

export default LocationAccuracy

