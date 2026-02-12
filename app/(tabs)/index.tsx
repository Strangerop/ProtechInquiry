import { ThemedText } from '@/components/themed-text';
import { API_URL } from '@/constants/config';
import { LandingScreen } from '@/frontend/LandingScreen';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [newExhibition, setNewExhibition] = useState({ name: '', location: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddExhibition = async () => {
    if (!newExhibition.name) {
      Alert.alert('Error', 'Please enter exhibition name');
      return;
    }

    try {
      const baseUrl = API_URL.replace(/\/customers$/, '');
      const response = await fetch(`${baseUrl}/exhibitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExhibition)
      });
      const data = await response.json();
      if (data.success) {
        setModalVisible(false);
        setNewExhibition({ name: '', location: '' });
        setRefreshKey(prev => prev + 1); // Trigger refresh
      } else {
        Alert.alert('Error', data.message || 'Failed to add exhibition');
      }
    } catch (error) {
      console.error('Failed to add exhibition:', error);
      Alert.alert('Error', 'Connection failed');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LandingScreen
        key={refreshKey}
        topInset={insets.top}
        onAddExhibition={() => setModalVisible(true)}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Add New Exhibition</ThemedText>

            <ThemedText style={styles.label}>Exhibition Name *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai Tech Expo"
              value={newExhibition.name}
              onChangeText={(text) => setNewExhibition(prev => ({ ...prev, name: text }))}
            />

            <ThemedText style={styles.label}>Location</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="e.g. BEC, Goregaon"
              value={newExhibition.location}
              onChangeText={(text) => setNewExhibition(prev => ({ ...prev, location: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddExhibition}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
