import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Col, Divider, List, Popover, Row, Table } from 'antd'
import { renderTime } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import _ from 'lodash'
import Media from 'react-media'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    detailedMedication: state.hub.detailedMedication,
})

const hourThreshold = [0,5,10,14,18] // Threshold are 6am, 11am, 4pm and 11pm

const initialData = [
    {
        name: 'Overnight',
        time: renderTime(hourThreshold[0],hourThreshold[1]),
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    },
    {
        name: 'Morning',
        time: renderTime(hourThreshold[1],hourThreshold[2]),
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    },
    {
        name: 'Lunch',
        time: renderTime(hourThreshold[2],hourThreshold[3]),
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    },
    {
        name: 'Afternoon',
        time: renderTime(hourThreshold[3],hourThreshold[4]),
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    },
    {
        name: 'Evening',
        time: renderTime(hourThreshold[4],hourThreshold[0]),
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    }
]

class newMedi extends Component{
    constructor(props) {
        super(props)

        this.state = {
            weekChange: 0,
            startDate: moment().day(1).weeks(moment().local().weeks()).set({hour:0,minute:0,second:0}),
            endDate: moment().day(0).weeks(moment().local().weeks() + 1).set({hour:23,minute:59,second:59}),
        }
    }

    generateData = (rows) => {
        let dataList = _.cloneDeep(initialData)
        rows.map(row => {
            const mediTime = moment(row.occurred_at)
            if (mediTime.isBetween(this.state.startDate, this.state.endDate, 'hour', null, '[]')){
                const hour = mediTime.hour()
                const weekDay = mediTime.format('ddd')
                if (hour<hourThreshold[1]){
                    dataList[0][weekDay]+=1
                }else if (hour<hourThreshold[2]){
                    dataList[1][weekDay]+=1
                }else if (hour<hourThreshold[3]){
                    dataList[2][weekDay]+=1
                }else if (hour<hourThreshold[4]){
                    dataList[3][weekDay]+=1
                } else dataList[4][weekDay]+=1
            }
        })
        return dataList
    }

    handleDateChange = (value) => {
        const weekChange = this.state.weekChange + value
        const startDate = moment().day(1).weeks(moment().local().weeks() + weekChange).set({hour:0,minute:0,second:0})
        const endDate = moment().day(0).weeks(moment().local().weeks() + weekChange + 1).set({hour:23,minute:59,second:59})
        this.setState({weekChange,startDate,endDate})
        const hubId = this.props.selectedHub.hub_id
        actions.hub.getDetailedMedication({hubId,
            fromTime: startDate,
            toTime: endDate,
            size: globalConstants.TIMELINE_SIZE, page: 0 })
    }

    renderPopover = (text, record, index, dayOfWeek) => {
        return text!==0
            ? <Popover title={moment.weekdays(dayOfWeek)+' '+record.name} content={
                this.props.detailedMedication.content.filter(item=>{
                    const start = hourThreshold[index]
                    let end = hourThreshold[index===hourThreshold.length-1? 0 : index+1]
                    end = end===0 ? 24 : end
                    const occurred = moment(item.occurred_at)
                    return parseInt(occurred.format('d'))===dayOfWeek &&
                        parseInt(occurred.format('H')) >= start && parseInt(occurred.format('H'))< end
                }).map(item=> <div key={item.resident_activity_id}>
                    {moment(item.occurred_at).format(globalConstants.LONG_TIME_FORMAT)}</div>)
            }>
                {text}
            </Popover>
            : null
    }
    buildColumns = () => {
        let column = []
        column.push({
            title: '',
            dataIndex: 'name',
            key: 'name',
            width: '15%'
        })
        moment.weekdaysShort().map((day,i) => {i!==0 && column.push({
            title: <Media query={{ maxWidth: 1050 }}>
                {matches => matches ? (moment.weekdaysMin(i)) : (day)}
            </Media>,
            dataIndex: moment.weekdaysShort(i),
            key: moment.weekdaysShort(i),
            render: (text, record, index) => this.renderPopover(text,record,index,i),
            width: '10%',
            align: 'center'
        })})
        column.push({
            title: <Media query={{ maxWidth: 1050 }}>
                {matches => matches ? 'Su' : 'Sun'}
            </Media>,
            dataIndex: 'Sun',
            key: 'Sun',
            render: (text, record, index) => this.renderPopover(text,record,index,0),
            width: '10%',
            align: 'center'
        })
        column.push({
            title: '',
            dataIndex: 'time',
            key: 'time',
            width: '15%',
            align: 'right'
        })
        return column
    }

    render(){
        const listDataSource = this.props.detailedMedication ? this.props.detailedMedication.content.filter(medication=>
            moment(medication.occurred_at).isBetween(this.state.startDate,this.state.endDate, 'day','[]')) : []
        const column = this.buildColumns()
        const dataSource = this.props.detailedMedication?
            this.generateData(this.props.detailedMedication.content) : []
        return (
            <div>
                <Media query={{ maxWidth: 850 }}>
                    {matches => matches ?
                        <div>
                            <Row type="flex" justify="center">
                                { this.state.startDate.format('dddd DD/MM/YYYY')
                                } - {this.state.endDate.format('dddd DD/MM/YYYY') }
                            </Row>
                            <Row type="flex" justify="space-around">
                                <Button icon={<LeftOutlined />} onClick={() => this.handleDateChange(-1)}/>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={()=>this.handleDateChange(1)}
                                    disabled={this.state.weekChange>=0}
                                />
                            </Row>
                        </div>:
                        <Row type="flex" justify="center">
                            <Button icon={<LeftOutlined />} onClick={() => this.handleDateChange(-1)}/>
                            <p style={{fontSize: '22px'}}>
                                { this.state.startDate.format('dddd DD/MM/YYYY')
                                } - {this.state.endDate.format('dddd DD/MM/YYYY') }
                            </p>
                            <Button
                                icon={<RightOutlined />}
                                onClick={()=>this.handleDateChange(1)}
                                disabled={this.state.weekChange>=0}
                            />
                        </Row>
                    }
                </Media>

                <Row type="flex" justify="center">
                    <Col xs={0} sm={24} xl={18}>
                        <Table scroll={{x: true}}
                            dataSource={dataSource}
                            columns={column}
                            rowKey="time"
                            pagination={false}
                        />
                    </Col>
                </Row>
                <Divider style={{margin: '20px 0'}}/>
                <Row type="flex" justify="center">
                    <Col xs={24} md={18}>
                        <div className="fixedHeightContainer">
                            <List
                                size="large"
                                header={<div>Medication Access: </div>}
                                dataSource={listDataSource}
                                renderItem={item => (
                                    <List.Item key={item.resident_activity_id}>
                                        <div>{moment(item.occurred_at).format(globalConstants.LONGDATETIME_FORMAT)}</div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}


export default connect(mapStateToProps, null) (newMedi)
