import '@testing-library/jest-dom'
import {render} from '@testing-library/react/pure'
import ColorList from '@/pages/Radar/Setting/ObjectsFurniture/index.color.list'
import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'

jest.mock('@/scss/colours.scss', () => '')

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Property Color', () => {

    let getByTestId: Function

    test.todo('should open false')

    beforeAll(() => {
        ({getByTestId} = render(
            <ColorList
                selectedColor={ColorEnum.BLUE}
                onChange={()=> {}}/>))
    })

    test('has Blue <PropertyColorItem/>', () => {
        const givenColor = ColorEnum.BLUE
        expect(getPropertyColorItem(givenColor)).toBeInTheDocument()
    })
    test.todo('should set selected object color to Blue')

    test('has Red <PropertyColorItem/>', () => {
        const givenColor = ColorEnum.RED
        expect(getPropertyColorItem(givenColor)).toBeInTheDocument()
    })
    test.todo('should set selected object color to Red'
    )
    test('has Green <PropertyColorItem/>', () => {
        const givenColor = ColorEnum.GREEN
        expect(getPropertyColorItem(givenColor)).toBeInTheDocument()
    })
    test.todo('should set selected object color to Green')

    test('has Brown <PropertyColorItem/>', () => {
        const givenColor = ColorEnum.BROWN
        expect(getPropertyColorItem(givenColor)).toBeInTheDocument()
    })
    test.todo('should set selected object color to Brown')

    test('has Gray <PropertyColorItem/>', () => {
        const givenColor = ColorEnum.GRAY
        expect(getPropertyColorItem(givenColor)).toBeInTheDocument()
    })
    test.todo('should set selected object color to Gray')

    const getPropertyColorItem = (givenColor: ColorEnum) => {
        const propertyColorItemDataTestId = `${givenColor}PropertyColorItemTestId`
        return getByTestId(propertyColorItemDataTestId)
    }


})
