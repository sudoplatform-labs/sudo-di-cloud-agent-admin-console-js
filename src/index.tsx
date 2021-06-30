import momentTZ from 'moment-timezone';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './containers/App';

momentTZ.tz.setDefault('UTC');

ReactDOM.render(<App />, document.getElementById('root'));
