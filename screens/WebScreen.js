import React, { Component } from 'react';
import { View, WebView } from 'react-native';
import { Icon } from 'react-native-elements';

export default class Web extends Component {
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
        return (
            <View style={{ flex: 1 }}>
                <WebView
                    startInLoadingState
                    originWhitelist={['*']}
                    source={{ uri: this.props.navigation.getParam('uri') }}
                    style={{ marginTop: 20 }}
                />
            </View>
        );
    }
}
