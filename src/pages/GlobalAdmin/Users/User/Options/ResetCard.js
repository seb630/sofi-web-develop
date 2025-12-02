import { Fragment, useRef, useState } from 'react'
import {actions} from 'mirrorx'
import { Card, Row, Col, Modal, Input, Button, Form, message, Space } from 'antd'
import PropTypes from 'prop-types'
import ReCAPTCHA from 'react-google-recaptcha'
import { globalConstants } from '@/_constants'

const ResetCard = (props) => {

    const [modal, setModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const recaptchaRef = useRef()
    const [form] = Form.useForm()
    const {currentUser} = props

    const captchaSuccess = (captcha) => {
        const values = form.getFieldsValue()
        const payload = {
            email: values.email,
            captcha: captcha
        }
        setLoading(true)
        actions.user.forgot(payload).then(() => {
            form.resetFields()
            setLoading(false)
            message.success('Reset email sent.')
            setModal(false)
        }, (error) => {
            recaptchaRef.current.reset()
            setLoading(false)
            message.error(error.message, 10)
        })
    }

    const renderTitle = () => <Row type="flex" justify="space-between" >
        <Col>Reset password on behalf of this account</Col>
        <Col className="floatRight">
            <Button type="primary" onClick={()=>setModal(true)}>
                Reset Password
            </Button>
        </Col>
    </Row>

    return (<Fragment>
        <Card className="advanced_block" title={renderTitle()}>
            <div>
                <p>You can reset the password of this account on behalf of this person. </p>

                <p>The process results in a password reset email being sent to this user&#39;s nominated email account.
                    They must then find the email and click the password reset link inside. They will be taken to a web
                    page allowing them to set a new password. Then they will be prompted to login using this new
                    password.
                </p>
            </div>
        </Card>
        <Modal
            okText="Submit"
            okButtonProps={{loading: loading}}
            open={modal} onCancel={()=>setModal(false)}
            onOk={() => {form?.validateFields().then(() => {
                recaptchaRef.current.execute()
            })
                .catch((info) => {
                    message.error('Validate Failed:', info)
                })
            }}
            centered={false} title="Reset password on behalf of user"
        >
            <Form layout="vertical" form={form}>
                <p>You are about to do a password reset for: <b>{currentUser.first_name} {currentUser.last_name}
                </b>&#39;s account, with email address  <b>{currentUser.email}</b>
                </p>
                <p>If this is correct, please type in their email address <b>{currentUser.email}</b> into
                    the text box below.
                </p>
                <Space direction="vertical">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{
                            type:'enum', enum: [currentUser.email],  message: 'Email address does not match, you ' +
                            'must type in the exact email address in order to reset password',
                        }, {
                            required: true, message: 'Please input the Email!',
                        }]}
                    >
                        <Input />
                    </Form.Item>

                    <ReCAPTCHA
                        ref={recaptchaRef}
                        size='invisible'
                        badge='inline'
                        sitekey={globalConstants.RECAPTCHA_KEY}
                        onChange={captchaSuccess}
                    />
                </Space>
                <p>
                    Once successful a password reset email will be sent to the user allowing them to reset their
                    password. In the email, there is a link they need to click that will open a web page that allows a
                    password reset. Upon successful password reset, the user is prompted to login on using their new
                    password.
                </p>
                <p>
                    If no email has arrived, please ensure the user has checked their spam folder or junk folder.
                    Alternatively, please ensure their email address is recorded correctly.
                </p>

            </Form>
        </Modal>
    </Fragment>
    )

}

ResetCard.propTypes={
    currentUser: PropTypes.object.isRequired
}

export default ResetCard
