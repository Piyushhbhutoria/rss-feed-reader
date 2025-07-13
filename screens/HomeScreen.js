import * as WebBrowser from 'expo-web-browser';
import { XMLParser } from 'fast-xml-parser';
import React, { Component } from 'react';
import { ActivityIndicator, Alert, AppState, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
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
        feed: null,
    }

    componentDidMount() {
        this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);

        // Get the feed from navigation params
        const { route } = this.props;
        const feed = route.params?.feed;

        if (feed && feed.url) {
            this.setState({ feed });
            this.fetchData(feed.url);
        } else {
            Alert.alert('Error', 'No RSS feed selected or invalid feed data', [
                { text: 'Go Back', onPress: () => this.props.navigation.goBack() }
            ]);
            this.setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
        }
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            if (this.state.feed) {
                this.fetchData(this.state.feed.url)
                    .catch((error) => {
                        Alert.alert('Error', error.message);
                        this.setState({ isLoading: false })
                    });
            }
        }
        this.setState({ appState: nextAppState });
    }

    fetchData = (URL) => {
        // Don't modify URL if it's already complete
        const fullURL = URL;

        return fetch(fullURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(async response => {
                try {
                    const result = this.parser.parse(response);

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
                    } else if (result && result.feed && result.feed.entry) {
                        // Handle Atom feeds
                        items = result.feed.entry || [];
                    }

                    // Ensure items is an array
                    if (!Array.isArray(items)) {
                        items = items ? [items] : [];
                    }

                    this.setState({
                        isLoading: false,
                        dataSource: items,
                    });

                    if (items.length === 0) {
                        Alert.alert('Info', 'No articles found in this RSS feed');
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to parse RSS feed: ' + error.message);
                    this.setState({ isLoading: false });
                }
            })
            .catch((err) => {
                Alert.alert('Error', 'Failed to fetch RSS feed: ' + err.message);
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
        if (this.state.feed) {
            this.fetchData(this.state.feed.url)
                .then(() => {
                    this.setState({ refreshing: false });
                })
                .catch(error => {
                    Alert.alert('Error', error.message);
                    this.setState({ isLoading: false })
                });
        }
    }

    onRefresh = () => {
        this.setState({ refreshing: true });
        if (this.state.feed) {
            this.fetchData(this.state.feed.url)
                .then(() => {
                    this.setState({ refreshing: false });
                })
                .catch((error) => {
                    Alert.alert('Error', error.message);
                    this.setState({ isLoading: false })
                });
        }
    }

    renderItem = ({ item }) => {
        // Handle different data structures from RSS and Atom feeds
        let title, description, pubDate, link, author;

        if (item.title) {
            title = typeof item.title === 'string' ? item.title :
                (item.title['#text'] || item.title._text || item.title._ || 'No title');
        } else {
            title = 'No title';
        }

        if (item.description) {
            description = typeof item.description === 'string' ? item.description :
                (item.description['#text'] || item.description._text || item.description._ || 'No description');
        } else if (item.summary) {
            description = typeof item.summary === 'string' ? item.summary :
                (item.summary['#text'] || item.summary._text || item.summary._ || 'No description');
        } else {
            description = 'No description';
        }

        if (item.pubDate) {
            pubDate = typeof item.pubDate === 'string' ? item.pubDate :
                (item.pubDate['#text'] || item.pubDate._text || item.pubDate._ || '');
        } else if (item.published) {
            pubDate = typeof item.published === 'string' ? item.published :
                (item.published['#text'] || item.published._text || item.published._ || '');
        } else {
            pubDate = '';
        }

        if (item.link) {
            if (typeof item.link === 'string') {
                link = item.link;
            } else if (item.link.href) {
                link = item.link.href;
            } else if (item.link['#text']) {
                link = item.link['#text'];
            } else {
                link = '';
            }
        } else {
            link = '';
        }

        if (item.author) {
            author = typeof item.author === 'string' ? item.author :
                (item.author.name || item.author['#text'] || item.author._text || 'Unknown');
        } else {
            author = 'Unknown';
        }

        return (
            <TouchableOpacity onPress={() => {
                Alert.alert(title, description,
                    [
                        { text: 'OK' },
                        { text: 'View', onPress: () => link ? WebBrowser.openBrowserAsync(link) : Alert.alert('Error', 'No link available') },
                    ])
            }}>
                <View style={{
                    backgroundColor: '#fff',
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee'
                }}>
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Mali', fontSize: 16, marginBottom: 5 }}>
                        {title}
                    </Text>
                    <Text style={{ fontFamily: 'Mali', fontSize: 14, color: '#666' }}>
                        {pubDate}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        const { feed } = this.state;
        const data = [
            { key: '20', label: 'Recent 20', value: '20' },
            { key: '50', label: 'Recent 50', value: '50' },
            { key: '100', label: 'Recent 100', value: '100' },
            { key: '200', label: 'Recent 200', value: '200' },
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
                    placeholder={`Search in ${feed?.name || 'RSS Feed'}...`}
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
