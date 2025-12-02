import { Button, Col, Modal, Row, Typography } from 'antd'
import { ExclamationCircleOutlined, SendOutlined } from '@ant-design/icons'
import styles from '@/scss/colours.scss'
import { Fragment, useEffect, useState } from 'react'

export const EmergencyModal = (props) => {
    const [isSmallScreen, setIsSmallScreen] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 600px)')
        const handleMediaChange = (event) => {
            setIsSmallScreen(event.matches)
        }
        mediaQuery.addEventListener('change', handleMediaChange)
        setIsSmallScreen(mediaQuery.matches)
        return () => {
            mediaQuery.removeEventListener('change', handleMediaChange)
        }
    }, [])

    return <Modal
        width={700}
        footer={null}
        open={props.open}
        onCancel={props.onCancel}
        closable={false}
        onAdd = {props.onAdd}
        onChecked = {props.onChecked}
    >
        {
            <>
                <Typography style={{ width: '100%', textAlign: 'center', fontSize: '22px', fontWeight: '600', color:'black' }}>
                    What would you like to add?
                </Typography>
                <Row justify="center" style={{ display: 'flex', flexDirection: 'row', columnGap: '50px', rowGap: '10px', paddingTop: '20px' }}>
                    <Col style={{ justifyContent: 'center', alignItems: 'center', width: '200px', }}>
                        <Button type="primary" size="large" style={{ color: 'white', marginBottom: '10px' }} 
                            onClick={() => { props.onChecked(); props.onCancel()}}>
                            Emergency Services
                        </Button>
                        <Typography style={{textAlign:'center'}}>
                            Police, Fire Brigade, or Ambulance
                        </Typography>
                    </Col>
                    {isSmallScreen ? <></>:<Col style={{ justifyContent: 'center', alignItems: 'center', borderLeft: 'solid 1px black' }}></Col>}
                    <Col style={{ justifyContent: 'center', alignItems: 'center', width: '230px' }}>
                        <Button type="primary" size="large" style={{ color: 'white', marginBottom: '10px' }} onClick={() => { props.onAdd(); props.onCancel() }}>
                            Mobile Phone or Landline
                        </Button>
                        <Typography style={{textAlign:'center'}}>
                            For example a friend, family, or a neighbour
                        </Typography>
                    </Col>
                </Row>
            </>
        }
    </Modal>
}

export const CheckModal = (props) => {
    return <Modal
        width={700}
        footer={null}
        open={props.open}
        onCancel={props.onCancel}
        closable={false}
        onEmergency = {props.onEmergency}
    >
        {
            <>
                <Typography style={{ width: '100%', fontSize: '26px', fontWeight: '500', color:'black' }}>
                    Before we add the EmergencyServices:
                </Typography>
                <Col style={{padding: '10px',  color:'black' }}>
                    <Typography style={{ fontSize: '18px', fontWeight: '400'}}>
                        We need to let you know that some features of your pendant will be switched off and unavailable:
                    </Typography>
                    <Typography style={{ fontSize: '18px', padding: '15px 0px 15px 0px'}}>
                        - Restrict inbound calls to emergency contacts only will be switched off
                    </Typography>
                    <Typography style={{ fontSize: '14px', padding: '0px 0px 0px 10px'}}>
                        This is because if the emergency services need to call you back it will be from a private or unlisted number, leaving this feature switched on will mean the emergency services won&apos;t be able to call you back.
                    </Typography>
                    <Typography style={{ fontSize: '18px', padding: '15px 0px 15px 0px'}}>
                        We also need to let you know that:
                    </Typography>
                    <Typography style={{ fontSize: '18px' }}>
                        - The emergency services will take up one space in your emergency contacts list. This means you will only be able to have 9 other emergency contacts listed
                    </Typography>
                    <Typography style={{ fontSize: '18px', padding: '15px 0px 15px 0px'}}>
                        - The emergency services must always be the last contact on your list
                    </Typography>
                    <Typography style={{ fontSize: '14px', padding: '0px 0px 0px 10px'}}>
                        This is because sometimes the emergency services need to call you back - and if your pendant has started a call with a different emergency contact the emergency services may have some difficulty reaching you.
                    </Typography>
                </Col>
                <Row justify="end" style={{ display: 'flex', flexDirection: 'row', padding: '5px 0px 10px 0px', columnGap: '20px' }}>
                    <Button type="primary" size="large" style={{ color: 'white' }} onClick={() => { props.onCancel()}}>
                        Cancel
                    </Button>
                    <Button type="primary" size="large" style={{ color: 'white' }} onClick={() => { props.onEmergency(); props.onCancel()}}>
                        I understand
                    </Button>
                </Row>
            </>
        }
    </Modal>
}