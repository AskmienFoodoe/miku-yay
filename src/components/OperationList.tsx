import React from 'react'
import OperationSelector from './selectors/OperationSelector'
import { OperationSelectorMetadata } from '../common/OperationSelectorMetadata'
import { BoundChartOperation } from '../common/operations'
import { v4 as uuid } from 'uuid'
import { Chart } from '../common/Chart'
import { Form, Button, ButtonProps, Popup } from 'semantic-ui-react'
import ChartContext from '../contexts/ChartContext'

type propsType = {
    onSubmit: (chart: Chart) => void
}

type stateType = {
    operationSelectors: OperationSelectorMetadata[]
}

export default class OperationList extends React.Component<propsType, stateType> {

    static contextType = ChartContext
    context!: React.ContextType<typeof ChartContext>

    state = {
        operationSelectors: [] as OperationSelectorMetadata[]
    }

    handleOperationChange = (id: string, boundOperation: BoundChartOperation) => {
        this.setState({ operationSelectors: this.state.operationSelectors.map(metadata => metadata.id === id ? { id: metadata.id, callback: boundOperation } : metadata) })
    }

    addOperationSelector = () => {
        this.setState({ operationSelectors: [...this.state.operationSelectors, { id: uuid(), callback: (chart: Chart) => chart } ] })
    }

    removeOperationSelector = (id: string) => {
        this.setState({ operationSelectors: this.state.operationSelectors.filter(metadata => metadata.id !== id) })
    }

    applyOperations = () => {
        let outputChart = new Chart(this.context.chart.chartElements)
        for (let metadata of this.state.operationSelectors) {
            outputChart = metadata.callback(outputChart)
        }
        this.props.onSubmit(outputChart)
    }

    renderOperationSelectors() {
        return (this.state.operationSelectors.map(metadata =>
            <Form.Group key={metadata.id} inline>
                <OperationSelector onOperationChange={this.handleOperationChange.bind(this, metadata.id)} />
                <Button
                    circular
                    floated='right'
                    icon='close'
                    color='youtube'
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
                        event.preventDefault()
                        if (event.clientX !== 0) {
                            this.removeOperationSelector(metadata.id)
                        }
                    }}
                />
            </Form.Group>
        ))
    }

    render() {
        return (
            <Form>
                {this.renderOperationSelectors()}
                <Popup on={['hover']} position='bottom left' mouseEnterDelay={550} content='Adds an operation to the stack. Operations are performed in succession from top to bottom.' trigger={
                    <Button
                        circular
                        floated='left'
                        icon='plus'
                        content='Add Operation'
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
                            event.preventDefault()
                            this.addOperationSelector()
                        }}
                    />
                }/>
                <Form.Button color='yellow' content='Do It' onClick={this.applyOperations}/>
            </Form>
        )
    }
}