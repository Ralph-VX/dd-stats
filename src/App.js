import React from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import './App.css';


class Input extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          eHitRate : 0,
          pHitRate : 0,
          eHit : false,
          pHit : false,
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.eHitRate = React.createRef();
      this.eHit = React.createRef();
      this.pHit = React.createRef();
  }

  handleSubmit(event) {
      event.preventDefault();
      this.props.onSubmit(this.state);
      this.eHitRate.current.focus();
      this.eHitRate.current.select();
      this.pHit.current.checked = false;
      this.eHit.current.checked = false;
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
                  敵命中率：<input name="eHitRate" type="number" value={this.state.eHitRate} onChange={this.handleChange} tabIndex="2" ref={this.eHitRate}/>
              </label>
              <br />
              <label>
                  味命中率：<input name="pHitRate" type="number" value={this.state.pHitRate} onChange={this.handleChange} tabIndex="3"/>
              </label>
              <br />
              <label>
                  敵命中：<input name="eHit" type="checkbox" value={this.state.eHit} onChange={this.handleChange} tabIndex="4" ref={this.eHit}/>
              </label>
              <br />
              <label>
                  味命中：<input name="pHit" type="checkbox" value={this.state.pHit} onChange={this.handleChange} tabIndex="5" ref={this.pHit}/>
              </label>
              <br />
              <input type="submit" value="NEXT" tabIndex="6"/>
              <input type="hidden" tabIndex="7" />
          </form>
      )
  }
}

class DataRow extends React.Component {
  /* props: rate, data, edit */
  constructor(props) {
    super(props);
  }

  render() {
    let totalBox;
    let hitBox;
    if (this.props.edit) {
      totalBox = <input name="total" type="number" value={this.props.data[1]} onChange={this.handleChange} />;
      hitBox = <input name="hit" type="number" value={this.props.data[0]} onChange={this.handleChange} />;
    } else {
      totalBox = this.props.data[1];
      hitBox = this.props.data[0];
    }
    return <div>{this.props.rate}%:{hitBox}/{totalBox} ({round(hitBox/(totalBox === 0 ? 1 : totalBox) * 100, 1)}%)</div>
  }

}

class Data extends React.Component {
  render() {
    const data = this.props.hitData.slice();
    if (this.props.hitData2) {
      this.props.hitData2.forEach((contents, rate) =>{
        if (contents) {
          if (data[rate]) {
            data[rate][0] += contents[0];
            data[rate][1] += contents[1];
          } else {
            data[rate] = contents;
          }
        }
      })
    }
    let rateList = data.map((contents, rate) => {
      if (contents) {
        return <li key={rate}>
            <DataRow data={contents} rate={rate} edit={false}/>
          </li>
      } else {
        return null;
      }
    }).filter(Boolean);
    return <ul className="dataList">
      {rateList}
    </ul>
  }
}

class App extends React.Component {
  /** state format: pHitData[RATE] = [HIT COUNT, TOTAL COUNT] */
  constructor(props) {
      super(props);
      let stored = localStorage.getItem("ddstats");
      let data;
      if (stored) {
        data = JSON.parse(stored);
      } else {
        data = {
          pHitData : [],
          eHitData : []
        }
      }
      this.state = {
        data: data,
        history: [],
        historyIndex: 0
      }
  }

  addDataSet(oldData, dataSet) {
    const pHitData = oldData.pHitData.slice();
    const eHitData = oldData.eHitData.slice();
    if (eHitData[dataSet.eHitRate]) {
      const data = eHitData[dataSet.eHitRate];
      data[1] = data[1] + 1;
      data[0] = data[0] + dataSet.eHit ? 1 : 0;
      eHitData[dataSet.eHitRate] = data;
    } else {
      eHitData[dataSet.eHitRate] = [dataSet.eHit ? 1 : 0,1];
    }
    
    if (pHitData[dataSet.pHitRate]) {
      const data = pHitData[dataSet.pHitRate];
      data[1] = data[1] + 1;
      data[0] = data[0] + dataSet.pHit ? 1 : 0;
      pHitData[dataSet.pHitRate] = data;
    } else {
      pHitData[dataSet.pHitRate] = [dataSet.pHit ? 1 : 0, 1];
    }
    return {pHitData: pHitData, eHitData: eHitData};
  }

  removeDataSet(oldData, dataSet) {
    const pHitData = oldData.pHitData.slice();
    const eHitData = oldData.eHitData.slice();
    if (eHitData[dataSet.eHitRate]) {
      const data = eHitData[dataSet.eHitRate];
      data[1] = data[1] - 1;
      data[0] = data[0] - dataSet.eHit ? 1 : 0;
      eHitData[dataSet.eHitRate] = data;
    } else {
      console.log("Something is not correct, as you are trying to undoing non-existing information");
    }
    if (pHitData[dataSet.pHitRate]) {
      const data = pHitData[dataSet.pHitRate];
      data[1] = data[1] - 1;
      data[0] = data[0] - dataSet.pHit ? 1 : 0;
      pHitData[dataSet.pHitRate] = data;
    } else {
      console.log("Something is not correct, as you are trying to undoing non-existing information");
    }
    return {pHitData: pHitData, eHitData: eHitData};
  }

  handleInputSubmit(inputState) {
    const history = this.state.history.slice(0, this.state.historyIndex);
    const oldData = this.state.data;
    const newData = this.addDataSet(oldData, inputState);
    localStorage.setItem("ddstats", JSON.stringify(newData));
    this.setState({
      data: newData,
      history: history.concat(inputState),
      historyIndex: history.length+1
    });
  }

  onUndoClicked() {
    const input = this.state.history[this.state.historyIndex-1];
    const oldData = this.state.data;
    const newData = this.removeDataSet(oldData, input);
    localStorage.setItem("ddstats", JSON.stringify(newData));
    this.setState({
      data: newData,
      historyIndex: this.state.historyIndex-1
    })
  }

  onRedoClicked() {
    const input = this.state.history[this.state.historyIndex];
    const oldData = this.state.data;
    const newData = this.addDataSet(oldData, input);
    localStorage.setItem("ddstats", JSON.stringify(newData));
    this.setState({
      data: newData,
      historyIndex: this.state.historyIndex+1
    })
  }

  onResetClicked() {
    confirmAlert({
      title: "本当にリセットしますか？",
      message: "保存されたデータも削除されるため、データリセットすると取り消しができません。",
      buttons: [
        {
          label: 'リセットする',
          onClick: () => {localStorage.removeItem("ddstats");window.location.reload()}
        },
        {
          label: 'リセットしない'
        }
      ]
    })
  }

  render() {
      return <div className="rootcontainer">
        <div>
          <Input onSubmit={(state) => this.handleInputSubmit(state)}/>
          <div>
            <button tabIndex="-1" disabled={this.state.historyIndex === 0} onClick={() => this.onUndoClicked()}>取り消し</button>
            <button tabIndex="-1" disabled={this.state.historyIndex === this.state.history.length} onClick={() => this.onRedoClicked()}>やり直す</button>
            <button tabIndex="-1" onClick={() => this.onResetClicked()}>データリセット</button>
          </div>
        </div>
        <div className="data">
          <div className="dataContainer">味方命中統計<Data hitData={this.state.data.pHitData}/></div>
          <div className="dataContainer">敵側命中統計<Data hitData={this.state.data.eHitData}/></div>
          <div className="dataContainer">合計命中統計<Data hitData={this.state.data.pHitData} hitData2={this.state.data.eHitData}/></div>
        </div>
      </div>
  }
}

function round(number, precision) {
  var shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }  
    var numArray = ("" + number).split("e");
    return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

export default App;
