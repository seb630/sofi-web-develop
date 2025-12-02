import '@testing-library/jest-dom'
import {render} from '@testing-library/react/pure'
import Direction from '@/pages/Radar/Setting/ObjectsFurniture/index.direction'


describe('Property Direction', () => {

    let queryAllByLabelText: Function

    beforeAll(() => {

        ({
            queryAllByLabelText,
        } = render(
            <Direction
                onChange={()=> {}}/>))
    })

    test.todo('should rotate by 3D Map rotation')

    test('has Northwest, Northeast <Button/> with ↖ and ↗ <Icon/>', () => {
        const buttonIconLabel = 'up'
        const buttonUpIconComponents = queryAllByLabelText(buttonIconLabel)
        expect(buttonUpIconComponents.length).toBe(1)
    })

    test.todo('should move Northwest')
    test.todo('should move Northeast')

    test('has Southwest, Southeast <Button/> with ↙ and ↘ <Icon/>', () => {
        const buttonIconLabel = 'down'
        const buttonUpIconComponents = queryAllByLabelText(buttonIconLabel)
        expect(buttonUpIconComponents.length).toBe(1)
    })

    test.todo('should move Southwest')
    test.todo('should move Southeast')


})
