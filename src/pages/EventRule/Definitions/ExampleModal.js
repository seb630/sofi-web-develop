import { Col, Modal, Row, Typography } from 'antd'

const { Text, Paragraph } = Typography
const ExampleModal = props => {
    return (
        <Modal
            width={800}
            title="Event rule examples"
            open={props.open}
            onCancel={props.onClose}
            footer={null}
        >
            <Row>
                <Col>
                    <Typography>
                        <Text strong>I want to know if someone leaves after dark...</Text>
                        <Paragraph>If your loved ones may be prone to confusion and they leave home without support they may lose their sense of direction and be unable to return
                            safely. You can get notified before it happens by setting up a rule. As long as you have sensors at the exit points to the home like the front door,
                            the back door, and garage doors you can set up a rule that notifies you when motion is detected at those selected sensors, and between specific times
                            and we&#39;ll send you a notification when we see motion at those sensors.</Paragraph>
                        <Paragraph>Please note that you must have motion sensors installed at these locations and other exits points to the home in order for the notifications
                            to work successfully. Please make sure sensors have good batteries which are not flat, if a sensor has flat batteries the hub will not be able to
                            detect motion and no notifications will be sent</Paragraph>
                        <Text strong>I want to know when they arrive home safely...</Text>
                        <Paragraph>If you live far away from your loved ones, and they have come to visit you, you probably would like to know that they&#39;ve made it home safe.
                            Using the same rule outlined above you can be notified when the hub sees motion at home.</Paragraph>
                        <Text strong>I want to know if something is happening at home while I&#39;m away on holiday...</Text>
                        <Paragraph>If you set up a rule that triggers on any sensor at all times of the day and night, your hub can let you know if it sees motion at home when
                            you&#39;re away from home.</Paragraph>
                        <Paragraph>When you return don&#39;t forget to remove the rules to you don&#39;t get bothered by notifications!</Paragraph>
                        <Paragraph>As always please make sure sensors have good batteries which are not flat before you leave on holiday. If a sensor has flat batteries the hub
                            will not be able to detect motion and no notifications will be sent.</Paragraph>
                    </Typography >
                </Col>
            </Row>
        </Modal>
    )
}


export default ExampleModal
