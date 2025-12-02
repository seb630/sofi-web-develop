import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Select, Spin } from 'antd'
import PropTypes from 'prop-types'

class AddRadarUserModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isSubmitting: false,
            isOpen: false,
            selectedUserId: null
        }
    }

    /**  set Open */
    setOpen = (isOpen) => {
        this.setState({ isOpen })
    }

    /** handle Change */
    handleChange = (value) => {
        this.setState({ selectedUserId: value})
    }

    /** handle Save */
    handleSave = async () => {
        try {
            const { radar } = this.props
            const { selectedUserId } = this.state
            if(selectedUserId) {
                this.setState({ isSubmitting: true })
                await actions.radar.associateRadarUser({ user_id: selectedUserId, product_id: radar.id  })
                await actions.radar.fetchRadarUsers(radar.id)
                message.success('Saved successfully !!',3)
                this.setOpen(false)
            }
        } catch (err) {
            err.global_errors && err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        } finally {
            this.setState({ isSubmitting: false })
        }
    }

    /** build Options */
    buildOptions = () => {
        return this.props.allUsers?.map(user => (
            <Select.Option key={user.user_id} value={user.user_id}>{`${user.first_name} ${user.last_name} (${user.email})`}</Select.Option>
        ))
    }

    render() {
        const { selectedUserId, isOpen, isSubmitting } = this.state
        const userOptions = this.buildOptions()
        return (
            <Fragment>
                <Button id="button-linkUser" icon={<PlusOutlined />} type="primary" onClick={this.setOpen.bind(this,true)}> Add </Button>
                <Modal open={isOpen}
                    okText="Save"
                    onCancel={this.setOpen.bind(this,false)}
                    onOk={this.handleSave}
                    centered={false} title="Add User"  style={{height: '300px'}}>
                    <Spin spinning={isSubmitting}>
                        <label> Full Name </label>
                        <Select style={{ width: '100%' }} id="drp-users"
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            value={selectedUserId}
                            onChange={this.handleChange}
                        >
                            {userOptions}
                        </Select>
                    </Spin>
                </Modal>
            </Fragment>
        )
    }
}


AddRadarUserModal.propTypes = {
    radar: PropTypes.shape({
        radar_id: PropTypes.number
    }),
    radarUsers: PropTypes.array,
    allUsers: PropTypes.arrayOf(PropTypes.shape({
        user_id: PropTypes.number,
        first_name: PropTypes.string,
        last_name: PropTypes.string
    }))
}

export default AddRadarUserModal
