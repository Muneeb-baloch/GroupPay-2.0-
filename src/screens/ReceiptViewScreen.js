import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReceiptViewScreen = ({ navigation, route }) => {
  const { deposit } = route?.params || {};
  const [imageLoading, setImageLoading] = useState(true);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  // Dummy receipt images - actual mobile payment screenshots
  const dummyReceipts = {
    1: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&h=800&fit=crop&q=80', // Mobile banking app
    2: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=800&fit=crop&q=80', // Payment success screen
    3: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=800&fit=crop&q=80', // Digital wallet
    4: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=800&fit=crop&q=80', // Transfer confirmation
  };

  const receiptUrl = deposit?.receipt || dummyReceipts[deposit?.id] || dummyReceipts[1];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Payment Receipt - ${deposit?.note || 'Transaction'}`,
        title: 'Payment Receipt'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const openFullScreen = () => {
    setFullScreenVisible(true);
  };

  const closeFullScreen = () => {
    setFullScreenVisible(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Receipt</Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Receipt Image Container */}
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imageWrapper}
            onPress={openFullScreen}
            activeOpacity={0.95}
          >
            {imageLoading && (
              <View style={styles.imageLoader}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
            
            <Image
              source={{ uri: receiptUrl }}
              style={styles.receiptImage}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                Alert.alert('Error', 'Failed to load receipt image');
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Full Screen Modal */}
      <Modal
        visible={fullScreenVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={closeFullScreen}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.fullScreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          {/* Full Screen Header */}
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity 
              style={styles.fullScreenBackButton}
              onPress={closeFullScreen}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            
            <Text style={styles.fullScreenTitle}>Receipt</Text>
            
            <TouchableOpacity 
              style={styles.fullScreenShareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Full Screen Image */}
          <View style={styles.fullScreenImageContainer}>
            <Image
              source={{ uri: receiptUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Image Container
  imageContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderTopColor: '#06b6d4',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },

  // Full Screen Modal Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fullScreenBackButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenShareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 200,
  },
});

export default ReceiptViewScreen;