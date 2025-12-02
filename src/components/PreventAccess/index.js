import { Alert } from  'antd'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'

function PreventAccess(props) {
    const { allowAccess } = props
    return (allowAccess ? props.children :
        <div className="contentPage">
            <div className="beacon-container">
                <Alert message={globalConstants.PREVENT_ACCESS_PAGE} type="error" />
            </div>
        </div>)
}

PreventAccess.propTypes = {
    allowAccess: PropTypes.bool.isRequired
}

export default PreventAccess

