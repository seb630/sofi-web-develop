import { Button, Col, Input, message, Modal, Row, Typography } from 'antd'
import StoreBadges from '@/components/StoreBadges'
import { useState, useEffect } from 'react'
import { actions } from 'mirrorx'

const {Paragraph, Text, Title} = Typography


const MFAModal = props => {
    const {me, open, onClose} = props
    const [code, setCode] = useState()
    const [setupKey, setSetupKey] = useState('')
    const onCancel = () => {
        const payload = {
            ...me,
            mfa_enabled: false
        }

        actions.user.updateMe({ userId: me.user_id, payload }).then(() =>
            onClose()
        ).catch(() => {
            message.error('MFA cancel error, please try again')
        })
    }

    useEffect(() => {
        if(me.mfa_qr){
            const queryString = me?.mfa_qr.split('%3Fsecret%3D')[1]
            const key = queryString?.split('%')[0]
            setSetupKey(key)
        }
    }, [me])

    const handleSubmit = () => {
        const payload = {
            user_id: me?.user_id,
            code
        }
        actions.user.verifyMfaCode(payload).then(()=>{
            setCode()
            message.success('MFA set up success')
            onClose()
        }).catch(()=>{
            message.error('MFA code incorrect, please try again')
        })
    }

    return (
        <Modal
            title="Set up MFA"
            open={open}
            onCancel={onCancel}
            footer={null}
        >
            <Typography className="text-center">
                <Title level={5}>Let&#39;s set up MFA for you!</Title>
                <Paragraph>
                    <Text strong>Step 1: </Text>Get your smart phone out, and let&#39;s set up an authenticator app! We suggest the Google Authenticator.
                </Paragraph>

                <Row align="middle" justify="center">
                    <StoreBadges
                        googlePlayUrl="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                        appStoreUrl="https://apps.apple.com/app/google-authenticator/id388497605"
                    />
                </Row>

                <Paragraph>
                    <Text strong>Step 2: </Text>Open the app, and scan this QR code:
                </Paragraph>

                <Row align="middle" justify="center">
                    {me?.mfa_qr && <img src={me.mfa_qr}  alt='QR code' className="margin-bottom"/>}
                </Row>

                <Paragraph>
                    <Text>Or alternatively use this setup key instead:</Text><br/>
                    <Text copyable strong>{setupKey}</Text>
                </Paragraph>

                <Paragraph style={{display: 'inline-block'}}>
                    <Text strong>Step 3: </Text>Validate! Please type in the code: <Input maxLength={6} style={{ width: 150 }} onChange={e=>setCode(e.target.value)} value={code}/>
                </Paragraph>
            </Typography>
            <Row justify="center" gutter={[20, 20]}>
                <Col>
                    <Button onClick={onCancel}>Cancel and go back</Button>
                </Col>
                <Col>
                    <Button type="primary" onClick={handleSubmit} disabled={!code}>Validate and Proceed</Button>
                </Col>
            </Row>
        </Modal>
    )
}


export default MFAModal
