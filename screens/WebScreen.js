import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { WebView } from 'react-native-webview';

export default class WebScreen extends Component {
    renderBack = () => {
        return (
            <Icon
                name='arrow-left'
                type='font-awesome'
                color='#fff'
                onPress={() => this.props.navigation.goBack()}
            />
        );
    };

    render() {
        const { route } = this.props;
        const uri = route.params?.uri;

        return (
            <View style={{ flex: 1 }}>
                <WebView
                    startInLoadingState
                    originWhitelist={['*']}
                    source={{ uri }}
                    style={{ marginTop: 20 }}
                />
            </View>
        );
    }
}
