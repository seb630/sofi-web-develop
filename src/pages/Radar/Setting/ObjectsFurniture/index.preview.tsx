import {Card} from 'antd'
import RadarMap3D from '@/components/RadarMap3D'

export interface PreviewProps {
    title: string;
    data: any [];
    layout: any;
    frames: any;
    config: any;
    revision: number;
    onChange: Function;
}

const Preview = (props: PreviewProps) => {

    const {
        title,
        data,
        layout,
        frames,
        config,
        revision,
    } = props

    return (
        <Card title={title}
            type='inner'>
            <RadarMap3D data={data}
                layout={layout}
                frames={frames}
                config={config}
                revision={revision}
                onInitialized={() => {
                }}
                onRelayouting={() => {
                }}
                onRelayout={() => {
                }}
                isInSight={false}/>
        </Card>
    )
}

export default Preview
