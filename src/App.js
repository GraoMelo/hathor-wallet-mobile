/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import '../shim';

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  createBottomTabNavigator, createStackNavigator, createSwitchNavigator, createAppContainer,
} from 'react-navigation';
import { Provider, connect } from 'react-redux';

import hathorLib from '@hathor/wallet-lib';
import IconTabBar from './icon-font';

import { store } from './reducer';
import DecideStackScreen from './screens/DecideStackScreen';
import {
  WelcomeScreen, InitialScreen, NewWordsScreen, LoadWordsScreen,
} from './screens/InitWallet';
import ChoosePinScreen from './screens/ChoosePinScreen';
import MainScreen from './screens/MainScreen';
import SendScanQRCode from './screens/SendScanQRCode';
import SendAddressInput from './screens/SendAddressInput';
import SendAmountInput from './screens/SendAmountInput';
import SendConfirmScreen from './screens/SendConfirmScreen';
import ChangeToken from './screens/ChangeToken';
import ReceiveScreen from './screens/Receive';
import PaymentRequestDetail from './screens/PaymentRequestDetail';
import RegisterToken from './screens/RegisterToken';
import RegisterTokenManual from './screens/RegisterTokenManual';
import CreateToken from './screens/CreateToken';
import Settings from './screens/Settings';
import TokenDetail from './screens/TokenDetail';
import UnregisterToken from './screens/UnregisterToken';
import HathorLogo from './components/HathorLogo';
import PinScreen from './screens/PinScreen';
import About from './screens/About';
import Security from './screens/Security';
import ResetWallet from './screens/ResetWallet';
import Dashboard from './screens/Dashboard';
import LoadHistoryScreen from './screens/LoadHistoryScreen';


const InitStack = createStackNavigator(
  {
    WelcomeScreen,
    InitialScreen,
    NewWordsScreen,
    LoadWordsScreen,
    ChoosePinScreen,
  },
  {
    initialRouteName: 'WelcomeScreen',
    defaultNavigationOptions: {
      headerTintColor: '#0273a0',
      headerTitle: <HathorLogo />,
      headerTitleContainerStyle: {
        marginLeft: Platform.OS === 'ios' ? 0 : -56, // In android when you have the navigation with a back button the title is moved to the right
      },
    },
  },
);

const DashboardStack = createStackNavigator(
  {
    Dashboard,
    MainScreen,
  },
  {
    initialRouteName: 'Dashboard',
    headerMode: 'none',
  },
);

const SendStack = createStackNavigator(
  {
    SendScanQRCode,
    SendAddressInput,
    SendAmountInput,
    SendConfirmScreen,
  },
  {
    initialRouteName: 'SendScanQRCode',
    headerMode: 'none',
  },
);

const RegisterTokenStack = createStackNavigator(
  {
    RegisterToken,
    RegisterTokenManual,
  },
  {
    initialRouteName: 'RegisterToken',
    headerMode: 'none',
  },
);

const tabBarIconMap = {
  Home: 'icDashboard',
  Send: 'icSend',
  Receive: 'icReceive',
  Settings: 'icSettings',
};

const TabNavigator = createBottomTabNavigator({
  Home: DashboardStack,
  Send: SendStack,
  Receive: ReceiveScreen,
  Settings,
}, {
  initialRoute: 'Home',
  tabBarOptions: {
    activeTintColor: '#E30052',
    inactiveTintColor: 'rgba(0, 0, 0, 0.5)',
    style: {
      paddingTop: 12,
      paddingBottom: 12,
    },
    tabStyle: {
      justifyContent: 'center',
    },
    showIcon: true,
    showLabel: false,
  },
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      const iconName = tabBarIconMap[routeName];
      return <IconTabBar name={iconName} size={24} color={tintColor} />;
    },
  }),
});

const disableSwipeDown = () => ({
  gesturesEnabled: false,
});

const AppStack = createStackNavigator({
  Main: TabNavigator,
  About,
  Security,
  ResetWallet,
  PaymentRequestDetail,
  RegisterToken: RegisterTokenStack,
  ChangeToken,
  PinScreen: {
    screen: PinScreen,
    navigationOptions: disableSwipeDown,
  },
  CreateToken,
  TokenDetail,
  UnregisterToken,
}, {
  mode: 'modal',
  headerMode: 'none',
});


/**
 * loadHistory {bool} Indicates we're loading the tx history
 * lockScreen {bool} Indicates screen is locked
 */
const mapStateToProps = state => ({
  loadHistory: state.loadHistoryStatus.active,
  lockScreen: state.lockScreen,
});

export class _AppStackWrapper extends React.Component {
  static router = AppStack.router;

  style = StyleSheet.create({
    auxView: {
      backgroundColor: 'white',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    },
  });

  render() {
    const renderAuxiliarViews = () => {
      // the auxiliar view needs to be rendered after the other views, or it won't be visible
      // on Android: https://github.com/facebook/react-native/issues/14555
      if (this.props.loadHistory || this.props.lockScreen) {
        return (
          <View style={this.style.auxView}>
            {this.props.lockScreen
              ? <PinScreen isLockScreen navigation={this.props.navigation} />
              : <LoadHistoryScreen />}
          </View>
        );
      }
      return null;
    };

    return (
      <View style={{ flex: 1 }}>
        <AppStack navigation={this.props.navigation} />
        {renderAuxiliarViews()}
      </View>
    );
  }
}

const AppStackWrapper = connect(mapStateToProps)(_AppStackWrapper);

const SwitchNavigator = createSwitchNavigator({
  Decide: DecideStackScreen,
  App: AppStackWrapper,
  Init: InitStack,
}, {
  initialRouteName: 'Decide',
});

const NavigationContainer = createAppContainer(SwitchNavigator);

const App = () => (
  <Provider store={store}>
    <NavigationContainer />
  </Provider>
);

// custom interceptor for axios
const createRequestInstance = (resolve, timeout) => {
  const instance = hathorLib.axios.defaultCreateRequestInstance(resolve, timeout);

  instance.interceptors.response.use(response => response, error => Promise.reject(error));
  return instance;
};
hathorLib.axios.registerNewCreateRequestInstance(createRequestInstance);

export default App;
