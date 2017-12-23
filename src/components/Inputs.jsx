import React from 'react';
import '../style/index.css';
import TextField from 'material-ui/TextField';

export default class Inputs extends React.Component {
 render() {
  return <div>
    <TextField floatingLabelText="Initial Sleep Drive" id="init-sleep-drive" />
    <TextField floatingLabelText="Wake Constant" id="wake-constant" />
    <TextField floatingLabelText="Sleep Constant" id="sleep-constant" />
    <TextField floatingLabelText="Wake Mean" id="wake-mean" />
    <TextField floatingLabelText="Wake Amplitude" id="wake-amplitude" />
    <TextField floatingLabelText="Cycle Trough Time" id="cycle-trough-time"/>
    <TextField floatingLabelText="Sleep Mean" id="sleep-mean" />
    <TextField floatingLabelText="Skew" id="skew" />

  </div>
 }
}
