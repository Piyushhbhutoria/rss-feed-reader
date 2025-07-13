import AsyncStorage from '@react-native-async-storage/async-storage';

const RSS_FEEDS_KEY = 'rss_feeds';

export const RSSStorage = {
  // Get all RSS feeds
  async getFeeds() {
    try {
      const feeds = await AsyncStorage.getItem(RSS_FEEDS_KEY);
      return feeds ? JSON.parse(feeds) : [];
    } catch (error) {
      console.error('Error getting RSS feeds:', error);
      return [];
    }
  },

  // Add a new RSS feed
  async addFeed(feed) {
    try {
      const feeds = await this.getFeeds();
      const newFeed = {
        id: Date.now().toString(),
        name: feed.name,
        url: feed.url,
        createdAt: new Date().toISOString(),
      };
      feeds.push(newFeed);
      await AsyncStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));
      return newFeed;
    } catch (error) {
      console.error('Error adding RSS feed:', error);
      throw error;
    }
  },

  // Delete an RSS feed
  async deleteFeed(feedId) {
    try {
      const feeds = await this.getFeeds();
      const updatedFeeds = feeds.filter(feed => feed.id !== feedId);
      await AsyncStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(updatedFeeds));
      return updatedFeeds;
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      throw error;
    }
  },

  // Update an RSS feed
  async updateFeed(feedId, updatedFeed) {
    try {
      const feeds = await this.getFeeds();
      const feedIndex = feeds.findIndex(feed => feed.id === feedId);
      if (feedIndex !== -1) {
        feeds[feedIndex] = { ...feeds[feedIndex], ...updatedFeed };
        await AsyncStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));
        return feeds[feedIndex];
      }
      throw new Error('Feed not found');
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      throw error;
    }
  },
}; 
