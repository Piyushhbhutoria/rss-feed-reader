import React, { Component } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RSSStorage } from '../utils/RSSStorage';

export default class RSSFeedManager extends Component {
  state = {
    feeds: [],
    loading: true,
    showAddForm: false,
    newFeedName: '',
    newFeedUrl: '',
    adding: false,
  };

  componentDidMount() {
    this.loadFeeds();
  }

  loadFeeds = async () => {
    try {
      const feeds = await RSSStorage.getFeeds();
      this.setState({ feeds, loading: false });
    } catch (error) {
      console.error('Error loading feeds:', error);
      Alert.alert('Error', 'Failed to load RSS feeds');
      this.setState({ loading: false });
    }
  };

  addFeed = async () => {
    const { newFeedName, newFeedUrl } = this.state;

    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      Alert.alert('Error', 'Please enter both name and URL');
      return;
    }

    this.setState({ adding: true });
    try {
      const newFeed = await RSSStorage.addFeed({
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
      });

      this.setState({
        feeds: [...this.state.feeds, newFeed],
        showAddForm: false,
        newFeedName: '',
        newFeedUrl: '',
        adding: false,
      });

      Alert.alert('Success', 'RSS feed added successfully!');
    } catch (error) {
      console.error('Error adding feed:', error);
      Alert.alert('Error', 'Failed to add RSS feed');
      this.setState({ adding: false });
    }
  };

  deleteFeed = async (feedId) => {
    Alert.alert(
      'Delete Feed',
      'Are you sure you want to delete this RSS feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await RSSStorage.deleteFeed(feedId);
              this.setState({
                feeds: this.state.feeds.filter(feed => feed.id !== feedId),
              });
              Alert.alert('Success', 'RSS feed deleted successfully!');
            } catch (error) {
              console.error('Error deleting feed:', error);
              Alert.alert('Error', 'Failed to delete RSS feed');
            }
          },
        },
      ]
    );
  };

  openFeed = (feed) => {
    this.props.navigation.navigate('FeedContent', { feed });
  };

  renderFeed = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>
          {item.name}
        </Text>
        <Text style={styles.listItemSubtitle}>
          {item.url}
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => this.openFeed(item)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => this.deleteFeed(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    const { feeds, loading, showAddForm, newFeedName, newFeedUrl, adding } = this.state;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading RSS feeds...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {showAddForm && (
          <View key="add-form" style={styles.addFormCard}>
            <Text style={styles.addFormTitle}>Add New RSS Feed</Text>
            <TextInput
              key="newFeedNameInput"
              style={styles.input}
              placeholder="Feed Name"
              placeholderTextColor="#999"
              value={newFeedName}
              onChangeText={(text) => this.setState({ newFeedName: text })}
            />
            <TextInput
              key="newFeedUrlInput"
              style={styles.input}
              placeholder="RSS Feed URL"
              placeholderTextColor="#999"
              value={newFeedUrl}
              onChangeText={(text) => this.setState({ newFeedUrl: text })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                key="cancel"
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showAddForm: false, newFeedName: '', newFeedUrl: '' })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                key="add"
                style={[styles.button, styles.addButton]}
                onPress={this.addFeed}
                disabled={adding}
              >
                <Text style={styles.buttonText}>{adding ? "Adding..." : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View key="header" style={styles.header}>
          <Text style={styles.headerTitle}>RSS Feeds</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => this.setState({ showAddForm: true })}
          >
            <Text style={styles.buttonText}>+ Add Feed</Text>
          </TouchableOpacity>
        </View>

        {feeds.length === 0 ? (
          <View key="empty" style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No RSS feeds added yet.</Text>
            <Text style={styles.emptySubtext}>Tap "Add Feed" to get started!</Text>
          </View>
        ) : (
          <FlatList
            key="feed-list"
            data={feeds}
            renderItem={this.renderFeed}
            keyExtractor={(item) => item.id}
            style={styles.feedList}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Mali',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Mali',
  },
  addFormCard: {
    margin: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Mali',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontFamily: 'Mali',
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  viewButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Mali',
    fontSize: 14,
    textAlign: 'center',
  },
  feedList: {
    flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Mali',
  },
  listItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Mali',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Mali',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Mali',
    color: '#999',
    textAlign: 'center',
  },
}); 
