import React from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import hathorLib from '@hathor/wallet-lib';
import NewHathorButton from '../components/NewHathorButton';
import SimpleInput from '../components/SimpleInput';
import AmountTextInput from '../components/AmountTextInput';
import InputLabel from '../components/InputLabel';
import HathorHeader from '../components/HathorHeader';
import OfflineBar from '../components/OfflineBar';
import Spinner from '../components/Spinner';
import FeedbackModal from '../components/FeedbackModal';
import checkIcon from '../assets/images/icCheckBig.png';
import errorIcon from '../assets/images/icErrorBig.png';
import { sendTx } from '../actions';
import { Strong } from '../utils';


/**
 * tokensBalance {Object} dict with balance for each token
 */
const mapStateToProps = (state) => ({
  tokensBalance: state.tokensBalance,
});

const mapDispatchToProps = (dispatch) => ({
  sendTx: (amount, address, token, pin) => dispatch(sendTx(amount, address, token, pin)),
});

class SendConfirmScreen extends React.Component {
  /**
   * modal {FeedbackModal} modal to display. If null, do not display
   * }
   */
  state = {
    modal: null,
  };

  /**
   * amount {int} amount to send
   * address {string} address to send to
   * token {object} info about the selected token to send
   */
  constructor(props) {
    super(props);
    // we receive these 3 values from previous screens
    this.amount = this.props.navigation.getParam('amount');
    this.address = this.props.navigation.getParam('address');
    this.token = this.props.navigation.getParam('token');
    this.amountAndToken = `${hathorLib.helpers.prettyValue(this.amount)} ${this.token.symbol}`;
  }

  executeSend = (pinCode) => {
    // show loading modal
    this.setState({
      modal:
        // eslint-disable-next-line react/jsx-indent
        <FeedbackModal
          icon={<Spinner />}
          text='Your transfer is being processed'
        />,
    });
    this.props.sendTx(this.amount, this.address, this.token, pinCode).then(
      this.onSuccess, this.onError
    );
  }

  onSendPress = () => {
    const params = {
      cb: this.executeSend,
      canCancel: true,
      screenText: 'Enter your 6-digit pin to authorize operation',
      biometryText: 'Authorize operation',
    };
    this.props.navigation.navigate('PinScreen', params);
  }

  onSuccess = () => {
    this.setState({
      modal:
        // eslint-disable-next-line react/jsx-indent
        <FeedbackModal
          icon={<Image source={checkIcon} style={{ height: 105, width: 105 }} resizeMode='contain' />}
          text={
            <Text>Your transfer of <Strong>{this.amountAndToken}</Strong> has been confirmed</Text>
          }
          onDismiss={this.exitScreen}
        />,
    });
  }

  onError = (message) => {
    this.setState({
      modal:
        // eslint-disable-next-line react/jsx-indent
        <FeedbackModal
          icon={<Image source={errorIcon} style={{ height: 105, width: 105 }} resizeMode='contain' />}
          text={message}
          onDismiss={() => this.setState({ modal: null })}
        />,
    });
  }

  exitScreen = () => {
    this.setState({ modal: null });
    this.props.navigation.popToTop();
    this.props.navigation.dismiss();
  }

  render() {
    const getAvailableString = () => {
      // eg: '23.56 HTR available'
      const balance = this.props.tokensBalance[this.token.uid];
      const available = balance ? balance.available : 0;
      return `${hathorLib.helpers.prettyValue(available)} ${this.token.symbol} available`;
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HathorHeader
          withBorder
          title={`SEND ${this.token.name.toUpperCase()}`}
          onBackPress={() => this.props.navigation.goBack()}
        />
        {this.state.modal}
        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
          <View>
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <AmountTextInput
                editable={false}
                value={this.amountAndToken}
              />
              <InputLabel style={{ marginTop: 8 }}>
                {getAvailableString()}
              </InputLabel>
            </View>
            <SimpleInput
              label='Address'
              editable={false}
              value={this.address}
              containerStyle={{ marginTop: 48 }}
            />
          </View>
          <NewHathorButton
            title='Send'
            onPress={this.onSendPress}
            // disable while modal is visible
            disabled={this.state.modal !== null}
          />
        </View>
        <OfflineBar />
      </SafeAreaView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendConfirmScreen);
