import React, { Component } from 'react';
import { ActivityIndicator, Alert, AppState, FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';
import Touchable from "react-native-platform-touchable";

const parseString = require('react-native-xml2js').parseString;

export default class HomeScreen extends Component {
    state = {
        isLoading: true,
        search: '',
        searched: false,
        searchData: '',
        appState: AppState.currentState,
        refreshing: false,
        num: 10,
        dataSource: '',
        rssLink: 'https://groups.google.com/forum/feed/vitians2020/msgs/rss.xml?num='
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.fetchData(this.state.rssLink)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.fetchData(this.state.rssLink)
                .catch((error) => {
                    // console.log(error);
                    Alert.alert('Error', error.message);
                    this.setState({ isLoading: false })
                });
            // console.log('App has come to the foreground!');
        }
        this.setState({ appState: nextAppState });
    }

    fetchData = (URL) => {
        return fetch(URL + this.state.num.toString())
            .then(response => response.text())
            .then(async response => {
                let res = ''
                await parseString(response, function (err, result) {
                    // console.log(Object.keys(result.rss.channel[0].item))
                    res = result.rss.channel[0]
                })
                this.setState({
                    isLoading: false,
                    dataSource: res.item,
                });
            })
            .catch((err) => {
                console.log('error fetching data', err)
            })
    }

    onSearch = (text) => {
        const { dataSource } = this.state
        text = text.toLowerCase();
        let newarr = [];
        for (var i = 0; i < dataSource.length; i++) {
            let k = JSON.stringify(dataSource[i]['title'][0].toLowerCase())
            // console.log(k)
            if (k.includes(text)) {
                newarr.push(dataSource[i])
            }
        }
        this.setState({
            searched: true,
            searchData: newarr,
        })
    }

    loadMore = option => {
        this.setState({ num: option.value, refreshing: true })
        this.fetchData(this.state.rssLink)
            .then(() => {
                this.setState({ refreshing: false });
            })
            .catch(error => {
                Alert.alert('Error', error.message);
                this.setState({ isLoading: false })
            });
    }

    onRefresh = () => {
        this.setState({ refreshing: true });
        this.fetchData(this.state.rssLink)
            .then(() => {
                this.setState({ refreshing: false });
            })
            .catch((error) => {
                // console.log(error);
                Alert.alert('Error', error.message);
                this.setState({ isLoading: false })
            });
    }

    renderItem = ({ item }) => (
        <Touchable onPress={() => {
            Alert.alert(item.title[0], item.description[0],
                [
                    { text: 'OK' },
                    { text: 'View', onPress: () => this.props.navigation.navigate('Web', { uri: item.link[0] }) },
                ])
        }}>
            <ListItem containerStyle={{ flex: 1, width: '100%', paddingTop: 5 }}
                title={item.title[0]}
                titleStyle={{ fontWeight: 'bold', fontFamily: 'Mali' }}
                subtitle={item.pubDate[0]}
                subtitleStyle={{ fontFamily: 'Mali' }}
                leftAvatar={{
                    source: this.state.image && { uri: this.state.image },
                    title: item.author[0]
                }}
            />
        </Touchable>
    )


    render() {
        let index = 0;
        const data = [
            { key: index++, label: 'Recent 10', value: '20' },
            { key: index++, label: 'Recent 50', value: '50' },
            { key: index++, label: 'Recent 100', value: '100' },
            { key: index++, label: 'Recent 200', value: '200' },
        ];

        return (
            <View style={{ flex: 1 }}>
                <SearchBar
                    round
                    cancelIcon
                    showCancel
                    inputStyle={{fontFamily: 'Mali'}}
                    onChangeText={search => this.setState({ search })}
                    value={this.state.search}
                    onClear={(search) => this.setState({ search: '', searched: false })}
                    onEndEditing={() => this.onSearch(this.state.search)}
                    placeholder={"Search Here..."}
                />
                <ModalSelector
                    data={data}
                    initValue="Load more..."
                    selectTextStyle={{ fontFamily: 'Mali' }}
                    onChange={this.loadMore}
                />
                {this.state.isLoading ?
                    <View style={{ flex: 1, padding: 20 }}>
                        <ActivityIndicator />
                    </View> :
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh}
                            />
                        }
                    >
                        <FlatList
                            data={this.state.searched ? this.state.searchData : this.state.dataSource}
                            renderItem={this.renderItem}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </ScrollView>
                }
            </View>
        )
    }
}
