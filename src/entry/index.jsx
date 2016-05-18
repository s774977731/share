import '../common/lib';
import App from '../component/App';
import ReactDOM from 'react-dom';
import React from 'react';
import {Router, hashHistory } from 'react-router';

const rootRoute = {
  component: 'div',
  childRoutes: [{
    path: '/',
    component: require('../component/App'),
    indexRoute: { onEnter: (nextState, replace) => replace('/share') },
    childRoutes: [
     require('../route/Share')
    ]
  }]
};

ReactDOM.render(
  <Router history={hashHistory} routes={rootRoute} />,
  document.getElementById('react-content'));
// ReactDOM.render(<App/>,document.getElementById('react-content'));
