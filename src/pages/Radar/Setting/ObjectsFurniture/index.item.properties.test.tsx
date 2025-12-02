import {render} from '@testing-library/react/pure'
import '@testing-library/jest-dom'
import ItemProperties, {ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'

jest.mock('@/pages/Radar/Setting/ObjectsFurniture/data/index', () => ({
    bedData: {},
    layoutData: {},
    personData: {},
    radarData: {}
}))

jest.mock('@/scss/colours.scss', () => '')

describe('Property}', () => {

    let getByTestId: Function
    const model:ItemModel = {
        id: 1,
        name: 'Test',
        color: ColorEnum.BLUE,
        height: 100,
        length: 100,
        width: 100,
        coord: {x:0,y:0,z:0},
        type: ItemTypeEnum.BED,
        rotation: 0,
    }

    beforeAll(() => {

        ({
            getByTestId,
        } = render(<ItemProperties
            formProps={{
                onUpdate:(item: ItemModel) => {
                    console.log(JSON.stringify(item))
                },
                model,
            }}
            colorProps={{
                selectedColor: ColorEnum.NONE,
                onChange:() => {}
            }}
            directionProps={{
                onChange: () => {}
            }}
            rotateProps={{
                onChange: () => {}
            }}
        />))
    })

    test('has <PropertyForm/>', () => {
        const propertyFormTestId = 'propertyFormTestId'
        const propertyFormComponent = getByTestId(propertyFormTestId)
        expect(propertyFormComponent).toBeInTheDocument()
    })

    test('has <PropertyDirection/>', () => {
        const propertyDirectionTestId = 'propertyDirectionTestId'
        const propertyDirectionComponent = getByTestId(propertyDirectionTestId)
        expect(propertyDirectionComponent).toBeInTheDocument()
    })

    test('has <PropertyColor/>', () => {
        const propertyColorTestId = 'propertyColorTestId'
        const propertyColorComponent = getByTestId(propertyColorTestId)
        expect(propertyColorComponent).toBeInTheDocument()
    })

    test.todo('should save all settings for newly added object')

})
