import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Button, Card, Col, Input, message, Modal, Row } from 'antd'
import PropTypes from 'prop-types'

class DeleteCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            modal: false,
        }
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                actions.user.deleteUser(this.props.currentUser.user_id).then(()=> {
                    message.success('User deleted')
                    actions.routing.push('/globalAdmin/user')
                }).catch((error)=>{
                    Modal.error({
                        title: 'Error deleting user',
                        content: (
                            <div>
                                <p>{error.message}</p>
                            </div>
                        )
                    })
                })
            }
        })
    }
    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col className="dangerTitle">Delete User</Col>
        <Col className="floatRight">
            <Button danger onClick={this.handleOpen}>
                Delete User
            </Button>
        </Col>
    </Row>

    render() {
        const {currentUser, form} = this.props
        const {getFieldDecorator} = form
        return (<Fragment>
            <Card className="advanced_block" title={this.renderTitle()}>
                <div>
                    <p>Deleting a user will remove their records from the database. This user will not be able to login again. They will
                        however be able to register a new account later. Deleting a user may result in a device lacking carers! Make sure
                        that devices linked to this user have other carers that are able to handle anomalies, SOS, or fall events.
                    </p>
                    <p>
                        Please note: you may need to first remove all devices this user has access to first. Additionally a user who has
                        admin privileges cannot be deleted, you may need to revoke those privileges.
                    </p>
                </div>
            </Card>
            <Modal
                okText="Delete"
                open={this.state.modal} onCancel={this.handleClose}
                onOk={this.handleSubmit}
                okButtonProps={{type:'danger'}}
                cancelButtonProps={{type:'primary'}}
                centered={false} title="Are you sure you wish to delete this user?"  style={{height: '500px'}}
            >
                <Form layout="vertical">
                    <p>Deleting: <b>{currentUser.first_name} {currentUser.last_name}</b>, will result in this person not being able to
                        login, links to any devices they have access to can be removed. This can result in devices not having any carers!
                    </p>
                    <p>If you wish to delete the user: <b>{currentUser.first_name} {currentUser.last_name}</b>, please type in their
                        email address <b>{currentUser.email}</b> into the text box below.
                    </p>

                    <Form.Item
                        label="Email"
                    >
                        {getFieldDecorator('email', {
                            rules: [{
                                type:'enum', enum: [currentUser.email],  message: 'Email address does not match, you ' +
                                    'must type in the exact email address in order to delete this user',
                            }, {
                                required: true, message: 'Please input the Email!',
                            }],
                        })(
                            <Input />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
        )
    }
}

DeleteCard.propTypes={
    currentUser: PropTypes.object.isRequired
}

export default Form.create({})(DeleteCard)
