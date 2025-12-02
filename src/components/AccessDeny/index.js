import { useState, useEffect } from 'react'
import { MinusCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import {connect} from 'mirrorx'
import PropTypes from 'prop-types'
import './index.scss'

const mapStateToProps = state => ({
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

const AccessDenied = (props) => {
    const [modal, setModal] = useState(false)
    useEffect(() => {!allowAccess && !modal && hasModal && openModal()})
    const { privilege, currentOrg, myPrivileges, admin, hasModal } = props
    const view = privilege.includes('VIEW')
    const allowAccess = admin || myPrivileges && myPrivileges[currentOrg?.organization_id]?.includes(privilege)
    const openModal = () => {
        setModal(true)
        Modal.error({
            width: 300,
            title: <div align="center" className='accessDenied'>
                <MinusCircleOutlined />
                <p>Access Denied!</p>
            </div>,
            icon: null,
            content:<div>
                <p>You do not have permission to {view ? 'view': 'modify'} this resource.</p>
                <p>If you think this is a mistake, please contact your organisation management team.</p>
            </div>,
            okText: 'Okay',
            // onOk:()=> actions.routing.goBack()
        })
    }
    return (allowAccess ? props.children : <div/>)
}

AccessDenied.propTypes = {
    privilege: PropTypes.string.isRequired,
    currentOrg: PropTypes.object,
    hasModal: PropTypes.bool,
}

AccessDenied.defaultProps = {
    hasModal: true
}

export default connect(mapStateToProps)(AccessDenied)


