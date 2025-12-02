import { Button, Card, Col, Row } from 'antd'
import PropTypes from 'prop-types'

const ChangeCard = (props) => {
    return <Card title="Need to make some changes?">
        <Row align="middle" justify="center" type="flex" className="margin-bottom" gutter={24}>
            <Col span={10} className="zeroPadding">
                <Button
                    style={{height: 'auto',whiteSpace:'normal'}}
                    onClick={()=>props.onTabChanged('general')}>Update or change emergency contacts</Button>
            </Col>
            <Col span={10} className="zeroPadding">
                <Button
                    style={{height: 'auto',whiteSpace:'normal'}}
                    onClick={()=>props.onTabChanged('detection')}>Change fall detection settings</Button>
            </Col>
        </Row>
    </Card>
}

ChangeCard.propTypes={
    onTabChanged: PropTypes.func.isRequired
}

export default ChangeCard
