import React from 'react'
import { Dropdown, Label, Popup, DropdownItemProps } from 'semantic-ui-react'
import { PlacementType } from '../../common/enums'

const options = [
    { key: 'place', text: 'Place', value: PlacementType.Place },
    { key: 'replace', text: 'Replace', value: PlacementType.Replace },
    { key: 'insert', text: 'Insert', value: PlacementType.Insert }
]

const popups: {[key: string]: string} = {
    [PlacementType.Place]: `Places notes alongside existing notes.`,
    [PlacementType.Replace]: `Erases any existing notes that would overlap, before placing notes.`,
    [PlacementType.Insert]: `Pushes existing notes AND BPM MARKERS forward before placing notes.`,
}

type propsType = {
    onPlacementTypeChange: (placementType: PlacementType) => void
}

type stateType = {
    placementType: PlacementType
}

export default class PlacementTypeSelector extends React.Component<propsType, stateType> {

    state = {
        placementType: PlacementType.Place,
    }

    handleOptionChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
        let newPlacementType = data.value as PlacementType
        this.setState({ placementType: newPlacementType })
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (prevState.placementType !== this.state.placementType) {
            this.props.onPlacementTypeChange(this.state.placementType)
        }
    }

    renderDropdownOptions() {
        return options.map((option) => 
            <Popup key={option.key} on={['hover']} position='right center' mouseEnterDelay={400} content={popups[option.value]} trigger={
                <Dropdown.Item {...option} active={this.state.placementType === option.value} onClick={this.handleOptionChange}/>
            } />
        )
    }

    render() {
        return (
            <>
                <Label style={{ fontSize: '16px' }}>
                    <Dropdown text={this.state.placementType}>
                        <Dropdown.Menu>
                            {this.renderDropdownOptions()}
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
            </>
        )
    }
}