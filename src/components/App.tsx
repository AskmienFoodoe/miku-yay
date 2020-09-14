import React from 'react'
import { Grid, Segment, Form, TextArea } from 'semantic-ui-react'

import OperationList from './OperationList'
import { Chart } from '../common/Chart'
import ChartContext from '../contexts/ChartContext'
import ChartInput from './ChartInput'

class App extends React.Component {

    static contextType = ChartContext
    context!: React.ContextType<typeof ChartContext>

    state = {
        outputChart: '',
    }

    handleSubmit = (outputChart: Chart) => {
        this.setState({outputChart: JSON.stringify(outputChart.chartElements)})
    }

    render() {
        return (
            <>
                <Grid stackable columns={3} textAlign='center' style={{ height: '100vh', paddingTop:'150px' }} centered>
                    <Grid.Column width={4} style={{minWidth: '250px'}}>
                        <Segment>
                            <h3 style={{textAlign: 'center'}}>Input</h3>
                            <ChartInput />
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={8} style={{minWidth: '1025px'}}>
                        <Segment style={{textAlign: 'center', minWidth: '1000px'}}>
                            <h3>Operations</h3>
                            <div>Note: most operations do not interact with BPM markers unless specified.</div>
                            <div style={{marginBottom: '10px'}}>Tip: many things have hoverover popups that explain what they do!</div>
                            <OperationList onSubmit={this.handleSubmit} />
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={3} style={{minWidth: '250px'}}>
                        <Segment style={{textAlign: 'center'}}>
                            <h3>Output</h3>
                            <Form>
                                <Form.Field 
                                    style={{minHeight: '300px'}}
                                    control={TextArea} 
                                    readOnly 
                                    value={this.state.outputChart}
                                    placeholder='Transformed chart source code appears here!'
                                />
                            </Form>
                        </Segment>
                    </Grid.Column>
                </Grid>
            </>
        )
    }
}

export default App