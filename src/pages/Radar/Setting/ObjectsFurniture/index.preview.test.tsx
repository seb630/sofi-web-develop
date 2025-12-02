import '@testing-library/jest-dom'
import {render} from '@testing-library/react/pure'
import Preview from '@/pages/Radar/Setting/ObjectsFurniture/index.preview'
import {
    bedData,
    layoutData,
    personData,
    radarData
} from '@/pages/Radar/Setting/ObjectsFurniture/data'

jest.mock('@/pages/Radar/Setting/ObjectsFurniture/data/index', () => ({
    bedData: {},
    layoutData: {},
    personData: {},
    radarData: {}
}))


// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Preview', () => {

    const givenPreviewTitle = 'Preview'
    const givenDefaultFrames: any = []
    const givenDefaultConfig = {responsive: false, displayModeBar: true}
    const givenRevision = 1

    let getByText: Function
    let getByLabelText: Function
    let queryByTestId: Function

    beforeAll(() => {

        ({
            getByText,
            getByLabelText,
            queryByTestId
        } = render(
            <Preview title={givenPreviewTitle}
                data={[bedData, personData, radarData]}
                layout={layoutData}
                frames={givenDefaultFrames}
                config={givenDefaultConfig}
                revision={givenRevision}
                onChange={()=> {}}/>))

    })


    test('has Title, Preview', () => {
        const title = getByText(givenPreviewTitle)
        expect(title).toBeInTheDocument()
    })

    describe('has 3D Map', () => {

        test('is <RadarMap3D/>', () => {
            const radarMap3DComponent = queryByTestId('radarMap3DTestId')
            expect(radarMap3DComponent).toBeInTheDocument()
        })

        test('has Rotate Right <Button/> with title Rotate 90° text and <Icon/> ↺', () => {
            const buttonIconLabel = 'rotate-right'
            const buttonIconComponent = getByLabelText(buttonIconLabel)
            expect(buttonIconComponent).toBeInTheDocument()

            const buttonComponent = buttonIconComponent.parentElement
            const expectedButtonText = 'Rotate 90°'
            expect(buttonComponent).toHaveTextContent(expectedButtonText)
        })

        test('has Rotate Left <Button/> with title <Icon/> ↻ and Rotate 90° text', () => {
            const buttonIconLabel = 'rotate-left'
            const buttonIconComponent = getByLabelText(buttonIconLabel)
            expect(buttonIconComponent).toBeInTheDocument()

            const buttonComponent = buttonIconComponent.parentElement
            const expectedButtonText = 'Rotate 90°'
            expect(buttonComponent).toHaveTextContent(expectedButtonText)
        })

        //bed
        test.todo('have BED when added')
        test.todo('should BED move NORTH')
        test.todo('should BED move SOUTH')
        test.todo('should BED move EAST')
        test.todo('should BED move WEST')
        test.todo('should BED move NORTHEAST')
        test.todo('should BED move NORTHWEST')
        test.todo('should BED move SOUTHEAST')
        test.todo('should BED move SOUTHWEST')
        test.todo('should BED set width')
        test.todo('should BED set length')
        test.todo('should BED set height')
        test.todo('should bed positioning auto customized when it touches the wall')

        //window
        test.todo('have WINDOW when added')
        test.todo('should WINDOW move NORTH')
        test.todo('should WINDOW move SOUTH')
        test.todo('should WINDOW move EAST')
        test.todo('should WINDOW move WEST')
        test.todo('should WINDOW move NORTHEAST')
        test.todo('should WINDOW move NORTHWEST')
        test.todo('should WINDOW move SOUTHEAST')
        test.todo('should WINDOW move SOUTHWEST')
        test.todo('should WINDOW set width')
        test.todo('should WINDOW set length')

        //door
        test.todo('have DOOR when added')
        test.todo('should DOOR move NORTH')
        test.todo('should DOOR move SOUTH')
        test.todo('should DOOR move EAST')
        test.todo('should DOOR move WEST')
        test.todo('should DOOR move NORTHEAST')
        test.todo('should DOOR move NORTHWEST')
        test.todo('should DOOR move SOUTHEAST')
        test.todo('should DOOR move SOUTHWEST')
        test.todo('should DOOR set width')
        test.todo('should DOOR set length')

    })
})
