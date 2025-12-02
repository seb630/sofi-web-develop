import { Component } from 'react'
import { actions } from 'mirrorx'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Col, message, Modal, Row, Switch } from 'antd'
import PropTypes from 'prop-types'
import DeleteOrgModal from './DeleteModal'
import { globalConstants } from '@/_constants'

class Action extends Component {

    state = {
        deleteModal: false
    }

    handleDeleteOpen = () => {
        this.setState({deleteModal: true})
    }

    handleDeleteClose = () => {
        this.setState({deleteModal: false})
    }

    onDelete = () => {
        actions.organisation.deleteOrg(this.props.currentOrg.organization_id).then(()=> {
            message.success('Organisation deleted')
            actions.routing.push('/globalAdmin/orgs')
        }).catch((error)=>{
            Modal.error({
                title: 'Error deleting organisation',
                content: (
                    <div>
                        <p>{error.message}</p>
                    </div>
                )
            })
        })

    }

    handleOrgEnabledSwitch = (checked) =>{
        const orgId = this.props.currentOrg.organization_id
        const payload = {
            ...this.props.currentOrg,
            active: checked
        }

        if (checked) {
            Modal.confirm({
                okText: 'Yes',
                cancelText: 'No',
                onOk:  ()=>{
                    actions.organisation.updateOrg({ orgId, payload }).then(() => {
                        message.success('Organisation enabled')
                        actions.organisation.fetchAllOrgs()
                    }, (error) => {
                        message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                    })
                },
                content: <div>
                    Are you sure you wish to enable this organisation? Its users will be able to see it and all of its devices if you
                    enable this organisation
                </div>
            })
        } else{
            Modal.confirm({
                okText: 'Yes',
                cancelText: 'No',
                onOk:  ()=>{
                    actions.organisation.updateOrg({ orgId, payload }).then(() => {
                        message.success('Organisation disabled')
                        actions.organisation.fetchAllOrgs()
                    }, (error) => {
                        message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                    })
                },
                content: <div>
                    Are you sure you wish to disable this organisation? Its users will not be able to see it or its devices if you
                    disable this organisation
                </div>
            })
        }
    }

    render() {
        const {currentOrg} = this.props
        return (
            <div className="contentPage">
                <Row type="flex" className="margin-bottom">
                    <Col span={12}>
                        <Button danger onClick={this.handleDeleteOpen}>
                            Delete Organisation
                        </Button>
                    </Col>
                </Row>
                <Row type="flex" className="margin-bottom" gutter={16}>
                    <Col>Organisation Enabled: </Col>
                    <Col>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={currentOrg.active}
                            onChange={this.handleOrgEnabledSwitch}
                        />
                    </Col>
                </Row>
                <DeleteOrgModal
                    open={this.state.deleteModal}
                    onClose={this.handleDeleteClose}
                    onDelete={this.onDelete}
                    selectedOrg={currentOrg}
                />
            </div>
        )
    }
}

Action.propTypes={
    currentOrg: PropTypes.object.isRequired
}

export default Action
