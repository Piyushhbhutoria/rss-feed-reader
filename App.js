import { AppLoading } from 'expo'
import { Asset } from 'expo-asset'
import * as Font from 'expo-font'
import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View } from "react-native"
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import Header from './components/Header'
import Colors from './constants/Colors'
import HomeScreen from "./screens/HomeScreen"
import WebScreen from "./screens/WebScreen"

const config = {
    defaultNavigationOptions: {
        headerTitle: () => <Header />,
        headerStyle: {
            backgroundColor: Colors.themeColor,
            height: 60,
        },
        animationEnabled: true,
        swipeEnabled: true,
    },
}

const HomeStack = createStackNavigator(
    {
        Home: HomeScreen,
        Web: WebScreen,
    },
    config,
)

HomeStack.navigationOptions = {
    tabBarLabel: 'All',
}

HomeStack.path = ''

const AppContainer = createAppContainer(HomeStack)

export default class App extends Component {
    state = {
        isReady: false,
    }

    async _cacheResourcesAsync() {
        const images = [require('./assets/images/icon.png')];
        await Font.loadAsync({
            'Mali': require('./assets/fonts/Mali-Regular.ttf'),
        });

        const cacheImages = images.map(image => {
            return Asset.fromModule(image).downloadAsync();
        });
        return Promise.all(cacheImages);
    }

    render() {
        if (!this.state.isReady) {
            return (
                <AppLoading
                    startAsync={this._cacheResourcesAsync}
                    onFinish={() => this.setState({ isReady: true })}
                    onError={console.warn}
                />
            );
        }

        return (
            <View style={styles.container}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <AppContainer />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
