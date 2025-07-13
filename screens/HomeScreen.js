import { XMLParser } from 'fast-xml-parser';
import React, { Component } from 'react';
import { ActivityIndicator, Alert, AppState, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';

export default class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
    }

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
        this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);
        this.fetchData(this.state.rssLink)
    }

    componentWillUnmount() {
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
        }
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
                try {
                    const result = this.parser.parse(response);
                    console.log('Parsed RSS result:', JSON.stringify(result, null, 2));

                    // Handle different RSS structures
                    let items = [];
                    if (result && result.rss && result.rss.channel) {
                        if (Array.isArray(result.rss.channel)) {
                            // If channel is an array, take the first one
                            items = result.rss.channel[0].item || [];
                        } else {
                            // If channel is an object
                            items = result.rss.channel.item || [];
                        }
                    }

                    // Ensure items is an array
                    if (!Array.isArray(items)) {
                        items = items ? [items] : [];
                    }

                    console.log('Extracted items:', items.length);

                    this.setState({
                        isLoading: false,
                        dataSource: items,
                    });
                } catch (error) {
                    console.log('Error parsing XML:', error);
                    Alert.alert('Error', 'Failed to parse RSS feed');
                    this.setState({ isLoading: false });
                }
            })
            .catch((err) => {
                console.log('error fetching data', err)
                Alert.alert('Error', 'Failed to fetch RSS feed');
                this.setState({ isLoading: false });
            })
    }

    onSearch = (text) => {
        const { dataSource } = this.state
        text = text.toLowerCase();
        let newarr = [];
        for (var i = 0; i < dataSource.length; i++) {
            // With fast-xml-parser, the title might be a direct string or object
            const title = typeof dataSource[i].title === 'string' ? dataSource[i].title : dataSource[i].title || '';
            if (title.toLowerCase().includes(text)) {
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

    renderItem = ({ item }) => {
        // Handle different data structures from fast-xml-parser
        const title = typeof item.title === 'string' ? item.title : item.title || 'No title';
        const description = typeof item.description === 'string' ? item.description : item.description || 'No description';
        const pubDate = typeof item.pubDate === 'string' ? item.pubDate : item.pubDate || '';
        const link = typeof item.link === 'string' ? item.link : item.link || '';
        const author = typeof item.author === 'string' ? item.author : item.author || 'Unknown';

        return (
            <TouchableOpacity onPress={() => {
                Alert.alert(title, description,
                    [
                        { text: 'OK' },
                        { text: 'View', onPress: () => this.props.navigation.navigate('Web', { uri: link }) },
                    ])
            }}>
                <ListItem containerStyle={{ flex: 1, width: '100%', paddingTop: 5 }}
                    title={title}
                    titleStyle={{ fontWeight: 'bold', fontFamily: 'Mali' }}
                    subtitle={pubDate}
                    subtitleStyle={{ fontFamily: 'Mali' }}
                    leftAvatar={{
                        source: this.state.image && { uri: this.state.image },
                        title: author
                    }}
                />
            </TouchableOpacity>
        )
    }

    render() {
        let index = 0;
        const data = [
            { key: index++, label: 'Recent 20', value: '20' },
            { key: index++, label: 'Recent 50', value: '50' },
            { key: index++, label: 'Recent 100', value: '100' },
            { key: index++, label: 'Recent 200', value: '200' },
        ];

        return (
            <View style={{ flex: 1 }}>
                <SearchBar
                    showCancel
                    inputStyle={{ fontFamily: 'Mali' }}
                    onChangeText={search => this.setState({ search })}
                    value={this.state.search}
                    onClear={() => this.setState({ search: '', searched: false })}
                    onSubmitEditing={() => this.onSearch(this.state.search)}
                    placeholder={"Search Here..."}
                    searchIcon={{ size: 24 }}
                    clearIcon={{ size: 24 }}
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
                    <FlatList
                        data={this.state.searched ? this.state.searchData : this.state.dataSource}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh}
                            />
                        }
                        style={{ flex: 1 }}
                    />
                }
            </View>
        )
    }
}
