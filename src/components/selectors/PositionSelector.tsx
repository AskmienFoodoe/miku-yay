import React from 'react'
import { Dropdown, Label, Input, InputOnChangeData, Popup, DropdownItemProps } from 'semantic-ui-react'
import { PositionSelectorOption } from '../../common/enums'
import deepEqual from 'deep-equal'

const options = [
    { key: 'note', text: 'Note', value: PositionSelectorOption.Note },
    { key: 'beat', text: 'Beat', value: PositionSelectorOption.Beat },
    { key: 'relative', text: 'ΔBeat', value: PositionSelectorOption.Relative }
]

const popups: {[key: string]: string} = {
    [PositionSelectorOption.Note]: `Places notes starting at the position of the provided note.`,
    [PositionSelectorOption.Beat]: `Places notes starting from the provided beat.`,
    [PositionSelectorOption.Relative]: `Places notes X beats relative to the position of the first note in the selection.`
}

type propsType = {
    onPositionChange: (state: positionSelectorState) => void,
    excludeRelative?: boolean
}

type stateType = {
    positionSelectorText: string
}

type positionSelectorState = {
    positionSelectorOption: PositionSelectorOption,
    position: number
}

export default class PositionSelector extends React.Component<propsType, stateType | positionSelectorState> {

    state = {
        positionSelectorOption: PositionSelectorOption.Note,
        positionSelectorText: 'Note',
        position: 0
    }

    handleOptionChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
        let newPositionSelectorOption = data.value as PositionSelectorOption
        if (newPositionSelectorOption === PositionSelectorOption.Relative) {
            this.setState({ positionSelectorOption: newPositionSelectorOption, positionSelectorText: data.text, position: 0 })
        } else {
            this.setState({ positionSelectorOption: newPositionSelectorOption, positionSelectorText: data.text })
        }

    }

    handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        let newPosition = +data.value
        if (this.state.positionSelectorOption === PositionSelectorOption.Note) {
            newPosition = Math.floor(newPosition)
        }
        this.setState({ position: newPosition })
    }

    componentDidUpdate(prevProps: propsType, prevState: positionSelectorState) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            this.props.onPositionChange(this.state)
        }
    }

    renderDropdownOptions() {
        let optionsToUse
        if (this.props.excludeRelative) {
            optionsToUse = options.slice(0,2)
        } else {
            optionsToUse = options
        }
        return optionsToUse.map((option) => 
            <Popup key={option.key} on={['hover']} position='right center' mouseEnterDelay={400} content={popups[option.value]} trigger={
                <Dropdown.Item {...option} active={this.state.positionSelectorOption === option.value} onClick={this.handleOptionChange}/>
            } />
        )
        
    }

    render() {
        return (
            <>
                <Label style={{ fontSize: '16px' }}>
                    <Dropdown text={this.state.positionSelectorText}>
                        <Dropdown.Menu>
                            {this.renderDropdownOptions()}
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Input
                    style={{ width: '80px' }}
                    type='number'
                    min={this.state.positionSelectorOption === PositionSelectorOption.Relative ? undefined : 0}
                    step={this.state.positionSelectorOption === PositionSelectorOption.Note ? 1 : 0.25}
                    value={this.state.position}
                    onChange={this.handlePositionChange}
                />
            </>
        )
    }
}

export type { positionSelectorState }