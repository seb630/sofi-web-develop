import { actions } from 'mirrorx'
import { Button, message, Modal, Input, Row, Col, Tooltip, Form, Divider } from 'antd'
import PhoneInput from 'react-phone-number-input'
import {clearStorage} from '@/utility/Storage'
import { LockOutlined } from '@ant-design/icons'
import { ChangePassword } from '@/pages/UserProfile/index'
import { useState } from 'react'
import MFAModal from '@/pages/UserProfile/MFAModal'

const UserProfile = (props) => {
    const {userDetails, open,onClose} = props
    const [passwordModal, setPasswordModal] = useState(false)
    const [mfaModal, setMfaModal] = useState(false)
    const [form] = Form.useForm()

    const handleRollback = () => {
        actions.user.rollbackNewEmail(userDetails.user_id).then(()=>{
            actions.user.me()
            message.success('Roll back successes!')
        })
    }

    const handleSaveUser = () => {
        form?.validateFields().then((values) => {

            const userId = userDetails.user_id
            const payload = {
                ...userDetails,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                username: values.email,
                mobile: values.mobile,
                onboarded: true
            }

            if (payload.email !== userDetails.email) {
                Modal.confirm({
                    content: 'You are about to change your email address, you will be re-sent a verification email, and you will need to login to your account using your new email address.',
                    onOk: () => {
                        actions.user.updateMe({ userId, payload }).then(() => {
                            form?.resetFields()
                            message.success('user profile updated successfully')
                            onClose()
                            clearStorage()
                            actions.routing.push('/login')

                        }, (error) => {
                            if (error.error === 'Conflict') {
                                Modal.error({
                                    title: 'Error while update user profile',
                                    content: (
                                        <div>
                                            <p>{error.message}</p>
                                        </div>
                                    )
                                })
                            } else message.error(error.message)
                        })
                    }
                }
                )
            } else {
                actions.user.updateMe({userId, payload}).then(() => {
                    form?.resetFields()
                    actions.user.me()
                    message.success('user profile updated successfully')
                    onClose()
                }, (error) => {
                    if (error.error==='Conflict'){
                        Modal.error({
                            title: 'Error while update user profile',
                            content: (
                                <div>
                                    <p>{error.message}</p>
                                </div>
                            )
                        })
                    }else message.error(error.message)
                })
            }
        })
            .catch((info) => {
                message.error('Validate Failed:', info)
            })
    }

    const handleMFAButton = () => {
        if (userDetails?.mfa_enabled){
            const payload = {
                ...userDetails,
                mfa_enabled: false
            }

            actions.user.updateMe({userId: userDetails.user_id,payload }).then(()=>
                message.success('MFA Removed')
            )
        }else {
            const payload = {
                ...userDetails,
                mfa_enabled: true
            }
            actions.user.updateMe({userId: userDetails.user_id,payload }).then(()=>
                setMfaModal(true)
            )
        }
    }

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    }

    return (<>
        <Modal
            title="User Profile"
            open={open}
            onCancel={onClose}
            width='750px'
            footer={[
                <Button key="back" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" onClick={handleSaveUser}>Update</Button>
            ]}
        >
            <Form
                form={form}
                onFinish={handleSaveUser}
                layout='vertical'
                initialValues={{
                    username: userDetails.username,
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    mobile: userDetails.mobile,
                    email: userDetails.email,
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            {...formItemLayout}
                            name="first_name"
                            label="First name"
                            rules={[{ required: true, message: 'Please input your first name!', whitespace: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            {...formItemLayout}
                            label="Last name"
                            name="last_name"
                            rules={[{ required: true, message: 'Please input your last name!', whitespace: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            {...formItemLayout}
                            label="Email"
                            name="email"
                            rules={[{
                                type: 'email', message: 'The input is not valid Email!',
                            }, {
                                required: true, message: 'Please input your Email!',
                            }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Username"
                            name="username"
                            {...formItemLayout}
                        >
                            <Input readOnly disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            {...formItemLayout}
                            name="mobile"
                            label="Mobile"
                            rules={[{ min: 8, message: 'Mobile number has a minimum length of 8' }]}
                        >
                            <PhoneInput
                                flagsPath='https://flagicons.lipis.dev/flags/4x3/'
                                country='AU'
                                displayInitialValueAsLocalNumber={true}
                                inputClassName="ant-input"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        {userDetails.new_email && <Tooltip title={<span>We&#39;ve received a request to change your
                                account&#39;s email address. A verification email has been sent to your new email
                                address: {userDetails.new_email} - click the link in that email to confirm your new
                                email address, or you can cancel this email change by pressing the &quot;Roll Back&quot;
                                button</span>}>
                            <Button type="primary" onClick={handleRollback}>Roll Back</Button>
                        </Tooltip>}
                    </Col>
                </Row>
                <Divider />
                <Form.Item
                    label="Security"
                >
                    <Row gutter={[20,20]}>
                        <Col>
                            <Button icon={<LockOutlined/>} onClick={()=>setPasswordModal(true)}>Change Password</Button>
                        </Col>
                        {userDetails?.authorities.some(role=>role.includes('ADMIN')) && userDetails?.mfa_required &&
                        <Col>
                            <Button icon={<LockOutlined/>} onClick={handleMFAButton}>{userDetails?.mfa_enabled ? 'Remove MFA' : 'Enable MFA'}</Button>
                        </Col>}
                    </Row>
                </Form.Item>
            </Form>
        </Modal>
        <ChangePassword
            open={passwordModal}
            onClose={()=> setPasswordModal(false)}
            userId={userDetails?.user_id}
        />
        <MFAModal
            open={mfaModal}
            onClose={()=> setMfaModal(false)}
            me={userDetails}
        />
    </>)

}

export default UserProfile
