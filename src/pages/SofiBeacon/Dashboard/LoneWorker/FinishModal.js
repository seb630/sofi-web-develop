import { Button, Col, Modal, Row, Typography } from 'antd'

const FinishModal = (props) => {
    const {open, onCancel, onFinish, onExtend, expired} = props

    return <Modal
        width={340}
        open={open}
        onCancel={onCancel}
        title="Finish or extend Lone Worker Session"
        footer={[<Button type="primary" onClick={onCancel} key="cancel">Cancel</Button>]}
    >
        <Row wrap={false} justify="space-between" gutter={[12,12]}>
            <Col flex="auto">
                <Typography.Paragraph>Would you like to finish your session?</Typography.Paragraph>
            </Col>
            <Col>
                <Button type="primary" onClick={onFinish}>{expired? 'Resolve' : 'Finish' }</Button>
            </Col>
        </Row>

        <Row wrap={false} justify="space-between" gutter={[12,12]}>
            <Col flex="auto">
                <Typography.Paragraph>Or would you like to extend your session?</Typography.Paragraph>
            </Col>
            <Col>
                <Button type="primary" onClick={onExtend}>Extend</Button>
            </Col>
        </Row>
    </Modal>
}

export default FinishModal
