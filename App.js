import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Asset } from 'expo-asset'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View } from "react-native"
import Header from './components/Header'
import Colors from './constants/Colors'
import HomeScreen from "./screens/HomeScreen"
import RSSFeedManager from "./screens/RSSFeedManager"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default class App extends Component {
    state = {
        isReady: false,
    }

    componentDidMount() {
        this._loadResourcesAsync();
    }

    async _loadResourcesAsync() {
        try {
            await this._cacheResourcesAsync();
            this.setState({ isReady: true });
        } catch (e) {
            console.warn(e);
        } finally {
            await SplashScreen.hideAsync();
        }
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
            return null;
        }

        return (
            <View style={styles.container}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="RSSFeedManager"
                        screenOptions={{
                            headerTitle: () => <Header />,
                            headerStyle: {
                                backgroundColor: Colors.themeColor,
                                height: 60,
                            },
                            animationEnabled: true,
                        }}
                    >
                        <Stack.Screen
                            name="RSSFeedManager"
                            component={RSSFeedManager}
                            options={{ headerTitle: () => <Header /> }}
                        />
                        <Stack.Screen
                            name="FeedContent"
                            component={HomeScreen}
                            options={({ route }) => ({
                                title: route.params?.feed?.name || 'RSS Feed',
                                headerStyle: {
                                    backgroundColor: Colors.themeColor,
                                },
                                headerTitleStyle: {
                                    fontFamily: 'Mali',
                                    fontSize: 18,
                                    color: '#fff',
                                },
                                headerTintColor: '#fff',
                            })}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
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
