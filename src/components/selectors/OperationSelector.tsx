import React from 'react'
import { Dropdown, Label, Form, Popup, DropdownItemProps } from 'semantic-ui-react'
import { BoundChartOperation } from '../../common/operations'
import { Chart } from '../../common/Chart'
import MoveOperation from '../operation-widgets/MoveOperation'
import { Operation, SlideNotePos } from '../../common/enums'
import CopyOperation from '../operation-widgets/CopyOperation'
import MirrorOperation from '../operation-widgets/MirrorOperation'
import { popups } from '../../constants/operation-popups'
import ReverseOperation from '../operation-widgets/ReverseOperation'
import ConvertToFlickOperation from '../operation-widgets/ConvertToFlickOperation'
import SetInitialBpmOperation from '../operation-widgets/SetInitialBpmOperation'
import GenerateTapPatternOperation from '../operation-widgets/GenerateTapPatternOperation'
import GenerateSlidePatternOperation from '../operation-widgets/GenerateSlidePatternOperation'
import ShiftOperation from '../operation-widgets/ShiftOperation'

const options = Object.values(Operation).map(operation => {
    return {
        key: operation.toLowerCase(),
        text: operation,
        value: operation
    }
})

type propsType = {
    onOperationChange: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    operationOption: Operation
    boundOperation: BoundChartOperation
}

export default class OperationSelector extends React.Component<propsType, stateType> {

    state = {
        operationOption: Operation.Move,
        boundOperation: (chart: Chart) => chart
    }

    handleOptionChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
        let newOperationOption = data.value as Operation
        this.setState({ operationOption: newOperationOption })
    }

    updateBoundOperation = (boundOperation: BoundChartOperation) => {
        this.setState({ boundOperation: boundOperation })
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if(prevState.boundOperation !== this.state.boundOperation) {
            this.props.onOperationChange(this.state.boundOperation)
        }
    }

    renderOperationWidget() {
        switch (this.state.operationOption) {
            case Operation.Move:
                return <MoveOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.Copy:
                return <CopyOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.Mirror:
                return <MirrorOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.Reverse:
                return <ReverseOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.Shift:
                return <ShiftOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.ConvertToFlick:
                return <ConvertToFlickOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.SetInitialBpm:
                return <SetInitialBpmOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.GenerateTapPattern:
                return <GenerateTapPatternOperation updateBoundOperation={this.updateBoundOperation} />
            case Operation.GenerateASlidePattern:
                return <GenerateSlidePatternOperation updateBoundOperation={this.updateBoundOperation} pos={SlideNotePos.A} />
            case Operation.GenerateBSlidePattern:
                return <GenerateSlidePatternOperation updateBoundOperation={this.updateBoundOperation} pos={SlideNotePos.B} />
        }
    }

    renderDropdownOptions() {
        return options.map((option) => 
            <Popup key={option.key} on={['hover']} position='right center' mouseEnterDelay={400} content={popups[option.value]} trigger={
                <Dropdown.Item {...option} active={this.state.operationOption === option.value} onClick={this.handleOptionChange}/>
            } />
        )
    }

    render() {
        return (
            <Form.Input>
                <Label style={{ fontSize: '16px' }}>
                    <Dropdown text={this.state.operationOption}>
                        <Dropdown.Menu>
                            {this.renderDropdownOptions()}
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
                {this.renderOperationWidget()}
            </Form.Input>
        )
    }
}