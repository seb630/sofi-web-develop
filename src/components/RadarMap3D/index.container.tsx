import {useWindowDimensions} from '@/utility/Common'
import {memo, useEffect, useState} from 'react'
import {isMobile} from 'react-device-detect'
import RadarMap3D from '@/components/RadarMap3D/index'

interface RadarMap3DContainerProps {
    dataSource: any;
    radarConfig: any;
    dragMode: boolean;
}

const RadarMap3DContainer = ({dataSource,
    radarConfig,
    dragMode}: RadarMap3DContainerProps) => {

    const minXYZ = Math.min(radarConfig?.right_length,
        radarConfig?.left_length,
        radarConfig?.radar_height) || 1

    //@ts-ignore
    const {height} = Math.max(useWindowDimensions(), 550)
    const [isPlotOnRelayout, setIsPlotOnRelayOuting] = useState(false)
    const figureInitialState = {
        data: dataSource,
        layout: {
            width: null,
            height: height - 450,
            margin: {
                l: 20,
                r: 20,
                b: 10,
                t: 30,
                pad: 4
            },
            uirevision: true,
            showlegend: true,
            autosize: true,
            scene: {
                dragmode: dragMode,
                aspectmode: 'manual',
                aspectratio: {
                    x: radarConfig?.right_length / minXYZ * (isMobile ? 0.4 : 0.8),
                    y: radarConfig?.left_length / minXYZ * (isMobile ? 0.4 : 0.8),
                    z: radarConfig?.radar_height / minXYZ * (isMobile ? 0.4 : 0.8),
                },
                xaxis: {title: {text: ''}, range: [Math.min(0, dataSource[1].x), radarConfig?.right_length]},
                yaxis: {title: {text: ''}, range: [Math.min(0, dataSource[1].y), radarConfig?.left_length]},
                zaxis: {dtick: 1, tick0: 0, range: [Math.min(0, dataSource[1].z), radarConfig?.radar_height || 0], title: {text: 'Wall'}},
                camera: {
                    eye: {
                        x: 1.8,
                        y: 1.8,
                        z: 1.8
                    }
                },

            }
        },
        frames: [],
        config: {responsive: true, displayModeBar: false}
    }
    const [figure, setFigure] = useState(figureInitialState)

    useEffect(() => setFigure({
        ...figure,
        data: dataSource,
        layout: {
            ...figure.layout,
            scene: {
                ...figure.layout.scene,
                xaxis: {title: {text: ''}, range: [Math.min(0, ...dataSource[1].x), radarConfig?.right_length]},
                yaxis: {title: {text: ''}, range: [Math.min(0, ...dataSource[1].y), radarConfig?.left_length]},
            }
        }
        // eslint-disable-next-line
        }), [!isPlotOnRelayout && dataSource])

    const onInitialized = (figure: any) => {
        setFigure(figure)
    }

    const onRelayouting = () => {
        setIsPlotOnRelayOuting(true)
    }

    const onRelayout = (layout: any) => {
        setFigure((figure) => {
            figure.layout.scene.camera = layout['scene.camera']
            return figure
        },)
        setIsPlotOnRelayOuting(false)
    }

    const isInSight = (): boolean => {
        return dataSource[1].x.length === 0
    }

    return (
        <RadarMap3D data={figure.data}
            layout={figure.layout}
            frames={figure.frames}
            config={figure.config}
            revision={revision}
            onInitialized={onInitialized}
            onRelayouting={onRelayouting}
            onRelayout={onRelayout}
            isInSight={isInSight()}/>
    )
}

let revision = 0

const arePropsEqual = (prevProps: any, nextProps: any) => {
    const dataPrev = prevProps.dataSource[1]
    const dataNext = nextProps.dataSource[1]

    const ifEqual =
        (dataPrev?.text.length === dataNext?.text.length &&
            dataPrev?.text[0] === dataNext?.text[0] ||
            (dataPrev?.x?.length === 0 && dataNext?.x?.length === 0))
        && dataPrev.mode === dataNext.mode //check show xyz mode
        && dataPrev.length === dataNext.length //check extra if extra surface added
    revision += ifEqual ? 0 : 1
    return ifEqual
}

export default memo(RadarMap3DContainer, arePropsEqual)
