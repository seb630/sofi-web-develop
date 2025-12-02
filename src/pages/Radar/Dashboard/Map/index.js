import moment from 'moment'
import { Card, Row } from 'antd'
import styles from '@/scss/colours.scss'
import RadarMap3DContainer from '@/components/RadarMap3D/index.container'
import { getObjectData } from '@/pages/Radar/Setting/ObjectsFurniture/data/dataUtil'

const markerSymbols = ['circle' , 'square' , 'diamond' , 'circle-open' , 'cross']

const RadarMapCard = (props) => {
    const { selectedRadar, selectedStateHistoryPersons, showXYZData, showFallLayer, showLive, radarConfig, radarSurrounds} = props
    const personsArray = showLive?
        selectedRadar.radar_action==='NO_PERSON_IN_SIGHT' || selectedRadar.num_of_person === 0 || selectedRadar.status === 'OFFLINE' ? [] :
            JSON.parse(selectedRadar.persons) :
        selectedStateHistoryPersons?.length>0 ?
            selectedStateHistoryPersons.reduce((acc,curr)=>acc.concat(curr.persons),[]) :
            []
    let marker = 0
    let timestamp = 0
    const threshold = radarConfig?.fall_threshold

    const calculateDotColor = (record) => {
        const fall = record.radar_action === 'PERSON_HAS_FALLEN'
        const belowThreshold = (record.position.z + (radarConfig?.radar_height>0 ? radarConfig.radar_height : 0)) < threshold
        return fall && belowThreshold ? styles.red : styles.grey
    }

    let dataSource3d = personsArray?.reduce((result, person)=>{
        if (person.activityTimestamp === timestamp){
            marker +=1
        }else {
            timestamp = person.activityTimestamp
            marker = 0
        }
        result.x.push(person.position.x.toFixed(2))
        result.y.push(person.position.y.toFixed(2))
        result.z.push((person.position.z + (radarConfig?.radar_height>0 ? radarConfig.radar_height : 0)).toFixed(2))
        result.text.push(person.activityTimestamp && moment.unix(person.activityTimestamp).format('HH:mm:ss'))
        result.marker.color.push(calculateDotColor(person))
        result.marker.symbol.push(markerSymbols[marker])
        result.customdata.push(marker+1)
        return result
    },{
        x:[],
        y:[],
        z:[],
        customdata: [],
        text:[],
        type:'scatter3d',
        name: 'Person',
        texttemplate: 'Person: (%{x}, %{y}, %{z})',
        mode: showXYZData!=='hide' ? 'markers+text' : 'markers',
        hovertemplate: 'Person%{customdata}<br>x: %{x}<br>y: %{y}<br>z: %{z}<br><b>%{text}</b><extra></extra>',
        marker: {color: [], symbol: []},
        showlegend: false
    })
    dataSource3d = [{
        x:[0],
        y:[0],
        z:[props?.radarConfig?.radar_height>0 ? props.radarConfig.radar_height : 0],
        type:'scatter3d',
        name: 'Radar',
        texttemplate: 'Radar: (%{x}, %{y}, %{z})',
        mode: showXYZData!=='hide' ? 'markers+text' : 'markers',
        hovertemplate: 'Radar<br>x: %{x}<br>y: %{y}<br>z: %{z}<extra></extra>',
        marker: {color: ['#000000']},
        showlegend: false
    }].concat([dataSource3d])

    if (showFallLayer==='fallLayerShow') {
        dataSource3d = dataSource3d.concat([{
            x: [0,radarConfig?.right_length],
            y: [0,radarConfig?.left_length],
            z:[[threshold,threshold],[threshold,threshold]],
            type:'surface',
            opacity: 0.4,
            name: 'fall threshold',
            hoverinfo: 'name',
            showlegend: false,
            showscale: false,
        }])
    }
    if (radarSurrounds?.surrounds){
        dataSource3d = dataSource3d.concat(JSON.parse(radarSurrounds.surrounds).map(item=>getObjectData(item, radarConfig?.left_length, radarConfig?.right_length)))
    }

    return (
        <Card className={'radarStatusContainer radarMapContainer'} bodyStyle={{height: '100%'}}>
            {/*<RadarDateFilter*/}
            {/*    online={online}*/}
            {/*    {...props}*/}
            {/*/>*/}
            <Row>
                <RadarMap3DContainer
                    dataSource={dataSource3d}
                    radarConfig={radarConfig}
                />
            </Row>
        </Card>
    )
}

export default RadarMapCard
