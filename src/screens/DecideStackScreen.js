import React from 'react';
import { connect } from 'react-redux';

import hathorLib from '@hathor/wallet-lib';
import { resetData } from '../actions';


/**
 * Only used for deciding which stack (App or Init) to display, so nothing is rendered.
 */
class DecideStackScreen extends React.Component {
  async componentDidMount() {
    this.props.dispatch(resetData());
    await hathorLib.storage.store.preStart();
    if (hathorLib.wallet.loaded()) {
      this.props.navigation.navigate('App');
    } else {
      this.props.navigation.navigate('Init');
    }
  }

  render() {
    return null;
  }
}

export default connect(null)(DecideStackScreen);
