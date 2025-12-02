import { Col, Radio, Row } from 'antd'
import { showProductName } from '@/utility/Common'

export const lockContent = (product, onChange, lockStatus) =>
    <div>
        <h4>Lock your {showProductName(product)}</h4>
        <p>The SOFIHUB team recommend that you lock your {showProductName(product)}. What does this mean?
            It means your {showProductName(product)} is more secure because no one can associate it with their account by going through this same process again.
        </p>
        <p>You can always invite new carers using the portal, and unlock the {showProductName(product)} in the &quot;Settings&quot;
            tab at any time. And if you need help with anything you can always get in touch with our support
            team.
        </p>
        <Row gutter={24}>
            <Col xs={24} md={12}>
                <p>Would you like to lock this {showProductName(product)}?</p>
            </Col>
            <Col xs={24} md={12}>
                <Radio.Group
                    onChange={onChange}
                    value={lockStatus}>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                </Radio.Group>
            </Col>
        </Row>
    </div>
