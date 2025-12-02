// import Plot from 'react-plotly.js'
import {Col, Row} from 'antd'

export interface RadarMap3DProps {
    data: any;
    layout: any;
    frames: any;
    config: any;
    revision: any;
    onInitialized: any;
    onRelayouting: any;
    onRelayout: any;
    isInSight: boolean;
}

const RadarMap3D = ({
    // data,
    // layout,
    // frames,
    // config,
    // revision,
    // onInitialized,
    // onRelayouting,
    // onRelayout,
    isInSight
}: RadarMap3DProps) => {
    return <>
        {/*<Plot*/}
        {/*    data={data}*/}
        {/*    layout={layout}*/}
        {/*    frames={frames}*/}
        {/*    config={config}*/}
        {/*    revision={revision}*/}
        {/*    onInitialized={onInitialized}*/}
        {/*    // @ts-ignore*/}
        {/*    onRelayouting={onRelayouting}*/}
        {/*    onRelayout={onRelayout}*/}
        {/*    useResizeHandler={true}*/}
        {/*    style={{width: '100%', height: '100%'}}*/}
        {/*/>*/}
        <span />
        {isInSight && <Row justify="center" style={{width: '100%'}}>
            <Col>
                <div style={{
                    fontSize: 26,
                    fontWeight: 'lighter'
                }}>(No one in sight)
                </div>
            </Col>
        </Row>}
    </>
}

export default RadarMap3D
