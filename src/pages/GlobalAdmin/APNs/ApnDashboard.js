import { Component } from 'react'
import { connect } from 'mirrorx'
import { Pie } from '@ant-design/charts'
import { Card } from 'antd'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    adminAPN: state.APN.adminAPN,
    beacons: state.sofiBeacon.allBeacons
})

class APNDashboard extends Component {

    generateData = () => {
        const { adminAPN, beacons } = this.props
        let apnObj = {}
        beacons?.map(beacon=> {
            apnObj[beacon.apn_id] = apnObj[beacon.apn_id]
                ? apnObj[beacon.apn_id]+1
                : 1
        })
        let chartData = []
        Object.keys(apnObj).map(key=>{
            if (key!=='null' && adminAPN?.find(apn=>apn.id==key)) {
                let record = {
                    x: adminAPN.find(apn=>apn.id==key).apn_name,
                    y: apnObj[key]
                }
                chartData.push(record)
            }else if (key==='null'){
                let record = {
                    x: 'No APN',
                    y: apnObj[key]
                }
                chartData.push(record)
            }
        })
        return chartData
    }

    render() {
        const chartData = this.generateData()
        const beaconsLength = this.props.beacons?.length || 0
        const pieConfig = {
            appendPadding: 10,
            data: chartData,
            angleField: 'y',
            colorField: 'x',
            radius: 1,
            innerRadius: 0.7,
            label: {
                type: 'outer',
                content: '{name} {percentage}',
            },
            statistic: {
                title:{
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    customHtml:()=>`${beaconsLength} ${titleCase(globalConstants.PENDANT_GENERIC)}`,
                },
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    customHtml: ()=>`${chartData.length} different APNs`,
                },
            },
            interactions: [{ type: 'element-active' }],
        }
        return (
            <Card title="APN usage" loading={!this.props.adminAPN}>
                <Pie {...pieConfig}/>
            </Card>
        )
    }
}

export default connect(mapStateToProps,{})(APNDashboard)
