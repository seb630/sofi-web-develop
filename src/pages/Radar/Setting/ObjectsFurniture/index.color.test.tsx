import '@testing-library/jest-dom'
import {render} from '@testing-library/react/pure'
import Color, {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'

jest.mock('@/scss/colours.scss', () => '')

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Property Color Item', () => {
    test('should color be red', () => {
        const givenColor = ColorEnum.RED
        const {getByTestId} = render(<Color
            color={givenColor}
            selected={false}
            onChange={() => {
            }}/>)
        const redPropertyColorItem =
            getByTestId(`${givenColor}PropertyColorItemTestId`)
        expect(redPropertyColorItem).toBeInTheDocument()
    })
    test('should color be orange', () => {
        const givenColor = ColorEnum.BROWN
        const {getByTestId} = render(<Color
            color={givenColor}
            selected={false}
            onChange={() => {
            }}/>)
        const redPropertyColorItem =
            getByTestId(`${givenColor}PropertyColorItemTestId`)
        expect(redPropertyColorItem).toBeInTheDocument()
    })
})
