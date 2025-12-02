import {render} from '@testing-library/react/pure'
import ObjectsFurniture from '@/pages/Radar/Setting/ObjectsFurniture/index'
import '@testing-library/jest-dom'

//should be empty for canvas for plotly, otherwise test doesn't stop
jest.mock('@/pages/Radar/Setting/ObjectsFurniture/data/index', () => ({
    bedData: {},
    layoutData: {},
    personData: {},
    radarData: {}
}))

jest.mock('@/scss/colours.scss', () => '')

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('<ObjectsFurniture/>', () => {

    const givenPreviewTitle = 'Preview'
    const givenItemListTitle = 'Objects / Furniture'
    const givenRadarSettings = {
        left_length: 4,
        right_length: 5,
    }
    let getByText: Function

    beforeAll(() => {
        ({getByText} = render(
            <ObjectsFurniture
                previewTitle={givenPreviewTitle}
                itemListTitle={givenItemListTitle}
                settings={givenRadarSettings}
            />))
    })

    test('has <Preview/> with Title, Preview', () => {
        const title = getByText(givenPreviewTitle)
        expect(title).toBeInTheDocument()
    })

    test('has <ItemList/> with Title, Objects / Furniture', () => {
        const title = getByText(givenItemListTitle)
        expect(title).toBeInTheDocument()
    })
})
