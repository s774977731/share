import React from 'react';
import {DatePicker} from 'antd';
import './App.less';

class App extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <div>{this.props.children}</div>
      </div>
    )
  }
};

App.propTypes = {
  children: React.PropTypes.element
};

App.contextTypes = {
  title: React.PropTypes.string
};

export default App;
