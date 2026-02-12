import { ThemedText } from '@/components/themed-text';
import { API_URL } from '@/constants/config';
import { LandingScreen } from '@/frontend/LandingScreen';
import { SplashScreen } from '@/frontend/SplashScreen';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [newExhibition, setNewExhibition] = useState({ name: '', city: 'Mumbai', date: new Date().toLocaleDateString('en-GB') });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen topInset={insets.top} />;
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewExhibition(prev => ({
        ...prev,
        date: selectedDate.toLocaleDateString('en-GB')
      }));
    }
  };

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
        setNewExhibition({ name: '', city: 'Mumbai', date: new Date().toLocaleDateString('en-GB') });
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

            <ThemedText style={styles.label}>City *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai"
              value={newExhibition.city}
              onChangeText={(text) => setNewExhibition(prev => ({ ...prev, city: text }))}
            />

            <ThemedText style={styles.label}>Date *</ThemedText>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#64748b" style={{ marginRight: 10 }} />
              <ThemedText style={styles.dateText}>
                {newExhibition.date}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={(() => {
                  const [day, month, year] = newExhibition.date.split('/');
                  return new Date(Number(year), Number(month) - 1, Number(day));
                })()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
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
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  cityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cityOptionActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  cityOptionText: {
    fontSize: 14,
    color: '#64748b',
  },
  cityOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
