import { Button, Modal, Row, Typography } from 'antd'
import { ExclamationCircleOutlined, SendOutlined } from '@ant-design/icons'
import styles from '@/scss/colours.scss'
import { globalConstants } from '@/_constants'
import { useEffect, useState } from 'react'

export const SuccessModal = (props) => {

    const [result, setResult] = useState(props.result)
    useEffect(()=>setResult(props.result), [props.result])
    const invalid = result?.invalid_contacts?.length>0
    return <Modal
        width={600}
        footer={null}
        open={props.open}
        onCancel={props.onCancel}
        closable={false}
    >
        {result && <><Typography>
            <Row justify="center">
                { invalid ? <ExclamationCircleOutlined style={{color: styles.red, fontSize: 100, marginBottom: 30}} /> :
                    <SendOutlined rotate={-30} style={{color: styles.green, fontSize: 100, marginBottom: 30}}  />}
            </Row>
            <Row justify="center">
                <Typography.Title level={5} >{invalid ? 'Error saving emergency contacts' : `Your emergency contacts are being sent to the ${globalConstants.PENDANT_GENERIC}!`}</Typography.Title>
            </Row>
            <Typography.Paragraph>{invalid? result?.message : `It may take several minutes for the ${globalConstants.PENDANT_GENERIC} to accept these changes. You can check progress by seeing if there is a tick next to their name.`}</Typography.Paragraph>
            {invalid && <Typography.Paragraph>
                <Typography.Text strong> Invalid Emergency contacts:</Typography.Text>
                <ul>
                    {result?.invalid_contacts?.map(ec=>
                        <li key={ec.index}>name: {ec.name}, number: {ec.number} </li>
                    )}
                </ul>
            </Typography.Paragraph>
            }
            <Typography.Paragraph><Typography.Text strong>Please note:</Typography.Text> Emergency contacts do not have access to this device via the portal. They will just be called or SMS&#39;d from the {globalConstants.PENDANT_GENERIC}.</Typography.Paragraph>
        </Typography>
        <Row justify="center">
            <Button size="large" style={{background: invalid ? styles.red : styles.green, color: 'white'}} onClick={props.onCancel}>
                {invalid?'Go Back and Fix' : 'Great!'}
            </Button>
        </Row>
        </>}
    </Modal>
}
