import { Card, Col, DatePicker, Divider, List, message, Row, Switch } from 'antd'
import { useState } from 'react'
import moment from 'moment-timezone'
import radarService from '@/services/Radar'
import { CopyOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const {RangePicker} = DatePicker

const Coordinates = (props) => {

    const [pickedTime, setPickedTime] = useState()
    const [showUTC, setShowUTC] = useState(false)
    const [listData, setListData] = useState([])

    const onSelectTime = async (value)=>{
        setPickedTime(value)
        if (value[0]!==null && value[1]!==null){
            let allResults = []
            let newPage = 0
            let result = {}
            const radarId = props.selectedRadar.id
            do {
                const params = {
                    radarId,
                    'start-date': showUTC ? moment.utc(value[0].second(0).format('YYYY-MM-DD HH:mm:ss')).format() : value[0].second(0).format(),
                    'end-date':  showUTC ? moment.utc(value[1].second(59).format('YYYY-MM-DD HH:mm:ss')).format() : value[1].second(59).format(),
                    sort: 'state_update_at,asc',
                    size: 2000,
                    page: newPage
                }
                result = await radarService.getRadarStateHistory(radarId, params)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)

            setListData(allResults?.map(item=>{
                const persons = item?.persons && JSON.parse(item?.persons) || []
                return persons.map(person=>({
                    time: moment(item.state_update_at),
                    position: person?.position
                }))
            }).flat())
        }
    }

    return ( <Card
        className="card-shadow card-radius"
        bordered={false}
        title="Time range filter"
    >
        <Row type="flex" align="middle" gutter={12} >
            <Col>
                <RangePicker
                    disabledDate={current => current && current > moment().add(2,'day').startOf('day')}
                    allowEmpty={[false,false]}
                    showTime={{ format: 'HH:mm' }}
                    format="DD-MM-YYYY HH:mm"
                    onOk={onSelectTime}
                />
            </Col>
            <Col>
                <Switch
                    checkedChildren="UTC"
                    unCheckedChildren="Local timezone"
                    onChange={v=>{
                        setShowUTC(v)
                        setListData([])
                        pickedTime && onSelectTime(pickedTime)
                    }}
                />
            </Col>
            <Col>
                Filtering by date/time in {showUTC ? 'UTC' : moment.tz(moment.tz.guess()).format('z')} (date time shown in results are UTC)
            </Col>
        </Row>
        <Divider/>
        <Row>
            <List
                header={listData.length>0? <Row gutter={20}>
                    <Col>Total: {listData.length} records</Col>
                    <Col>
                        <CopyToClipboard options={{format: 'text/plain'}}
                            text={listData.map(item => `x:${item?.position?.x}, y:${item?.position?.y}, z:${item?.position?.z}, time:${item.time.utc().format()}`).join('\r\n')}
                            onCopy={()=>message.success('Copied')}
                        >
                            <CopyOutlined /></CopyToClipboard>
                    </Col>
                </Row> : null}
                size="small"
                bordered
                dataSource={listData}
                renderItem={item => <List.Item>x:{item?.position?.x}, y:{item?.position?.y}, z:{item?.position?.z}, time:
                    {item.time.utc().format()}</List.Item>}
            >

            </List>
        </Row>
    </Card>)
}

export default Coordinates
