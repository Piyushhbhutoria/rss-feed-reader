import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Header(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Rss Reader</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        fontSize: 43,
        color: '#fff',
    },
});
