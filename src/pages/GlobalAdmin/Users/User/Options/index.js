import { Component } from 'react'
import { Row, Card, Col, Space } from 'antd'
import PropTypes from 'prop-types'
import PromoteCard from './PromoteCard'
import DeleteCard from './DeleteCard'
import ResetCard from './ResetCard'
import MFACard from '@/pages/GlobalAdmin/Users/User/Options/MFACard'

class Options extends Component {

    render() {
        let {currentUser} = this.props
        return (<Row className="contentPage" justify="center" type="flex">
            <Col xs={22} sm={20} lg={16}>
                <Space direction="vertical">
                    <Card title="Other Options" headStyle={{fontSize: '28px' ,fontWeight: 700}}>
                        <ResetCard currentUser={currentUser} />
                    </Card>
                    <Card title={<span className="dangerTitle">Danger Zone</span>} headStyle={{fontSize: '28px' ,fontWeight: 700}}>
                        <PromoteCard currentUser={currentUser} />
                        <MFACard currentUser={currentUser} />
                        <DeleteCard currentUser={currentUser} />
                    </Card>
                </Space>
            </Col>

        </Row>)
    }
}

Options.propTypes={
    currentUser: PropTypes.object.isRequired
}
export default Options
