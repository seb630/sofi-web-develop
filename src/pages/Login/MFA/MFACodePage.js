import { Button, Col, Form, Input, message, Row, Typography } from 'antd'
import { actions } from 'mirrorx'

const {Paragraph, Text, Title} = Typography

const MFACodePage = (props) => {
    const {me, sourcePage, onCancel} = props

    const handleSubmit = (values) => {
        const payload = {
            user_id: me?.user_id,
            code: values.code
        }
        actions.user.verifyMfaCode(payload).then(()=>{
            actions.routing.push(sourcePage && !sourcePage.includes('login') ? sourcePage : '/deviceSelection')
        }).catch(()=>{
            message.error('MFA code incorrect, please try again')
        })
    }

    return(

        <Typography className="text-center">
            <Form onFinish={handleSubmit}>
                <Title level={5}>One more step, MFA:</Title>
                <Paragraph>
                   Please provide the latest MFA code from your authenticator:
                </Paragraph>

                <Paragraph style={{display: 'inline-block'}}>
                    <Form.Item label="Latest Code" name="code">
                        <Input style={{ width: 150 }} maxLength={6} />
                    </Form.Item>
                </Paragraph>

                <Row justify="center" gutter={[20]} style={{marginBottom: '50px'}}>
                    <Col>
                        <Button onClick={onCancel}>Cancel and go back</Button>
                    </Col>
                    <Col>
                        <Button type="primary" htmlType="submit">Login</Button>
                    </Col>
                </Row>
                <Text type="secondary" strong>Lost access to your authenticator?</Text><br/>
                <Text type="secondary">Please reach out to support or an administrator to resolve this issue</Text>
            </Form>
        </Typography>
    )
}

export default MFACodePage
