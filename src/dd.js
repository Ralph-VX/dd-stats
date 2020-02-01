import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ehitrate : 0,
            phitrate : 0,
            ehit : false,
            phit : false,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.firstInput = React.createRef();
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.state);
        this.firstInput.current.focus();
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    敵命中率：<input name="ehitrate" type="number" value={this.state.ehitrate} onChange={this.handleChange} tabIndex="2" ref={this.firstInput}/>
                </label>
                <br />
                <label>
                    味命中率：<input name="phitrate" type="number" value={this.state.phitrate} onChange={this.handleChange} tabIndex="3" />
                </label>
                <br />
                <label>
                    敵命中：<input name="ehit" type="checkbox" value={this.state.ehit} onChange={this.handleChange} tabIndex="4" />
                </label>
                <br />
                <label>
                    味命中：<input name="phit" type="checkbox" value={this.state.phit} onChange={this.handleChange} tabIndex="5" />
                </label>
                <br />
                <input type="submit" value="NEXT" tabIndex="6"/>
                <input type="hidden" tabIndex="7" />
            </form>
        )
    }
}

class Core extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        return <div className="rootcontainer">
        <Input onSubmit={(state) => console.log(state)}/>
        </div>
    }
}

// ========================================

ReactDOM.render(
  <Core />,
  document.getElementById('root')
);