import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CustomerFormScreenProps {
    topInset: number;
    onBack: () => void;
    customerId?: string; // Optional ID for editing
    readOnly?: boolean; // Optional flag for read-only view
    isLead?: boolean; // Optional flag to indicate Lead vs Customer
    initialExhibition?: string; // Initial exhibition from navigation
}

export const CustomerFormScreen: React.FC<CustomerFormScreenProps> = ({ topInset, onBack, customerId, readOnly, isLead, initialExhibition }) => {
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [formData, setFormData] = useState({
        cardFront: '',
        cardBack: '',
        name: '',
        companyName: '',
        mobileNumber: '',
        whatsappNumber: '',
        sameAsWhatsapp: true,
        email: '',
        requirement: [] as string[],
        requirementDescription: '',
        otherRequirement: '',
        priority: 'Normal',
        exhibitionName: initialExhibition || 'Tech Expo Mumbai',
        visitDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }), // Default to today DD/MM/YYYY
    });

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                visitDate: selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })
            }));
        }
    };

    // Helper to get correct URL based on isLead prop
    const getApiUrl = (id?: string) => {
        let url = isLead ? API_URL.replace('customers', 'leads') : API_URL;
        if (id) {
            url += `/${id}`;
        }
        return url;
    }

    // Fetch details if editing
    React.useEffect(() => {
        if (customerId) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const url = getApiUrl(customerId);
                    console.log('Fetching detail from:', url);

                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.success) {
                        const item = data.data;
                        // Map fields for both Lead and Customer
                        setFormData({
                            cardFront: item.cardFront || item.photoUrl || '',
                            cardBack: item.cardBack || '',
                            name: item.name || '',
                            companyName: item.companyName || '',
                            mobileNumber: item.mobileNumber || '',
                            whatsappNumber: item.whatsappNumber || '',
                            sameAsWhatsapp: item.mobileNumber === (item.whatsappNumber || item.mobileNumber),
                            email: item.email || '',
                            requirement: Array.isArray(item.requirement) ? item.requirement : (item.requirement ? [item.requirement] : []),
                            requirementDescription: item.requirementDescription || '',
                            otherRequirement: item.otherRequirement || '',
                            priority: item.priority || 'Normal',
                            exhibitionName: item.exhibitionName || 'Tech Expo Mumbai',
                            visitDate: item.visitDate ? new Date(item.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                        });
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    Alert.alert('Error', 'Failed to load details');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [customerId, isLead]);

    const pickImage = async (side: 'cardFront' | 'cardBack') => {
        Alert.alert(
            'Select Image Source',
            'Would you like to take a new photo or choose from gallery?',
            [
                { text: 'Camera', onPress: () => openCamera(side) },
                { text: 'Gallery', onPress: () => openGallery(side) },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const openCamera = async (side: 'cardFront' | 'cardBack') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0].uri) {
            setFormData(prev => ({ ...prev, [side]: result.assets[0].uri }));
        }
    };

    const openGallery = async (side: 'cardFront' | 'cardBack') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need gallery permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0].uri) {
            setFormData(prev => ({ ...prev, [side]: result.assets[0].uri }));
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (isLead) {
            if (!formData.name || !formData.email || !formData.mobileNumber) {
                Alert.alert('Error', 'Name, Email and Mobile are required.');
                return;
            }
        } else {
            // Customer validation
            if (!formData.cardFront || !formData.name || !formData.email || !formData.mobileNumber || !formData.companyName) {
                Alert.alert('Error', 'Please fill in all required fields.');
                return;
            }
        }

        setLoading(true);
        try {
            const url = getApiUrl(customerId);
            const method = customerId ? 'PUT' : 'POST';

            console.log(`Submitting to ${url} with ${method} (FormData)`);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('mobileNumber', formData.mobileNumber);
            data.append('priority', formData.priority || 'Normal');
            data.append('visitDate', formData.visitDate);
            data.append('companyName', formData.companyName);
            data.append('whatsappNumber', formData.whatsappNumber);
            data.append('requirement', formData.requirement.join(',')); // Send as comma-separated for simple backend parsing if needed, but we handle array in backend
            data.append('requirementDescription', formData.requirementDescription);
            data.append('otherRequirement', formData.otherRequirement);
            data.append('exhibitionName', formData.exhibitionName);

            // Helper check for local URI (file:// or content://) vs remote URL (http:// or https://)
            const isLocalUri = (uri: string) => !uri.startsWith('http://') && !uri.startsWith('https://');

            if (formData.cardFront && isLocalUri(formData.cardFront)) {
                const localUri = formData.cardFront;
                const filename = localUri.split('/').pop() || 'front.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                data.append('cardFront', { uri: localUri, name: filename, type: type } as any);
                console.log('Appended cardFront:', filename);
            }

            if (formData.cardBack && isLocalUri(formData.cardBack)) {
                const localUri = formData.cardBack;
                const filename = localUri.split('/').pop() || 'back.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                data.append('cardBack', { uri: localUri, name: filename, type: type } as any);
                console.log('Appended cardBack:', filename);
            }

            const response = await fetch(url, {
                method: method,
                // Do NOT manually set Content-Type for FormData
                body: data,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Alert.alert('Success', `Details ${customerId ? 'updated' : 'submitted'} successfully!`);
                if (!customerId) {
                    // Reset form
                    setFormData({
                        cardFront: '',
                        cardBack: '',
                        name: '',
                        companyName: '',
                        mobileNumber: '',
                        whatsappNumber: '',
                        sameAsWhatsapp: true,
                        email: '',
                        requirement: [] as string[],
                        requirementDescription: '',
                        otherRequirement: '',
                        priority: 'Normal',
                        exhibitionName: initialExhibition || 'Tech Expo Mumbai',
                        visitDate: new Date().toLocaleDateString('en-GB'),
                    });
                }
                onBack(); // Go back
            } else {
                throw new Error(result.message || `Server error: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert('Error', error.message || 'Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { paddingTop: topInset }]}
            contentContainerStyle={styles.contentContainer}
        >
            <ThemedView style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#6366f1" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>
                    {readOnly ? 'View Details' : (customerId ? (isLead ? 'Edit Lead' : 'Edit Customer') : (isLead ? 'New Lead' : 'Customer Details'))}
                </ThemedText>
            </ThemedView>

            {/* Date - Show for both Customer and Lead (especially for follow-ups) */}
            <View style={styles.section}>
                <ThemedText style={styles.label}>Date</ThemedText>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: readOnly ? '#f1f5f9' : '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 }}
                    onPress={() => !readOnly && setShowDatePicker(true)}
                    disabled={readOnly}
                >
                    <Ionicons name="calendar-outline" size={20} color="#64748b" style={{ marginRight: 10 }} />
                    <ThemedText style={{ flex: 1, fontSize: 16, color: readOnly ? '#64748b' : '#1e293b' }}>
                        {formData.visitDate}
                    </ThemedText>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={(() => {
                            const [day, month, year] = formData.visitDate.split('/');
                            return new Date(`${year}-${month}-${day}`);
                        })()}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    📸 Visiting Card Photos *
                </ThemedText>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <ThemedText style={styles.label}>Front Side</ThemedText>
                        <TouchableOpacity
                            style={styles.imagePlaceholder}
                            onPress={() => !readOnly && pickImage('cardFront')}
                            disabled={readOnly}
                        >
                            {formData.cardFront ? (
                                <Image source={{ uri: formData.cardFront }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholderContent}>
                                    <Ionicons name="camera-outline" size={32} color="#6366f1" />
                                    <ThemedText style={styles.placeholderText}>Tap to Capture</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gridItem}>
                        <ThemedText style={styles.label}>Back Side</ThemedText>
                        <TouchableOpacity
                            style={styles.imagePlaceholder}
                            onPress={() => !readOnly && pickImage('cardBack')}
                            disabled={readOnly}
                        >
                            {formData.cardBack ? (
                                <Image source={{ uri: formData.cardBack }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholderContent}>
                                    <Ionicons name="camera-outline" size={32} color="#6366f1" />
                                    <ThemedText style={styles.placeholderText}>Tap to Capture</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>👤 Personal Information</ThemedText>

                <ThemedText style={styles.label}>Full Name *</ThemedText>
                <TextInput
                    style={[styles.input, readOnly && styles.inputDisabled]}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    editable={!readOnly}
                />

                <ThemedText style={styles.label}>Company Name</ThemedText>
                <TextInput
                    style={[styles.input, readOnly && styles.inputDisabled]}
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
                    editable={!readOnly}
                />

                <ThemedText style={styles.label}>Mobile Number *</ThemedText>
                <TextInput
                    style={[styles.input, readOnly && styles.inputDisabled]}
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, mobileNumber: text }))}
                    keyboardType="phone-pad"
                    editable={!readOnly}
                />

                <View style={styles.switchRow}>
                    <Switch
                        value={formData.sameAsWhatsapp}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sameAsWhatsapp: value }))}
                        trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                        disabled={readOnly}
                    />
                    <ThemedText style={styles.switchLabel}>WhatsApp number is same as mobile</ThemedText>
                </View>

                {!formData.sameAsWhatsapp && (
                    <>
                        <ThemedText style={styles.label}>WhatsApp Number</ThemedText>
                        <TextInput
                            style={[styles.input, readOnly && styles.inputDisabled]}
                            placeholder="Enter WhatsApp number"
                            value={formData.whatsappNumber}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, whatsappNumber: text }))}
                            keyboardType="phone-pad"
                            editable={!readOnly}
                        />
                    </>
                )}

                <ThemedText style={styles.label}>Email Address *</ThemedText>
                <TextInput
                    style={[styles.input, readOnly && styles.inputDisabled]}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase() }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!readOnly}
                />
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>📋 Requirement</ThemedText>
                <View style={styles.radioGroup}>
                    {['EMS', 'BMS', 'Other'].map((option) => {
                        const isSelected = formData.requirement.includes(option);
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.radioButton,
                                    isSelected && styles.radioActive,
                                    readOnly && { opacity: 0.6 }
                                ]}
                                onPress={() => {
                                    if (readOnly) return;
                                    setFormData(prev => {
                                        const newRequirement = isSelected
                                            ? prev.requirement.filter(r => r !== option)
                                            : [...prev.requirement, option];
                                        return { ...prev, requirement: newRequirement };
                                    });
                                }}
                                disabled={readOnly}
                            >
                                <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={isSelected ? "#6366f1" : "#64748b"}
                                />
                                <ThemedText style={styles.radioLabel}>{option}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {formData.requirement.includes('Other') && (
                    <View style={{ marginTop: 16 }}>
                        <ThemedText style={styles.label}>Please specify other requirement *</ThemedText>
                        <TextInput
                            style={[styles.input, readOnly && styles.inputDisabled]}
                            placeholder="Please specify..."
                            value={formData.otherRequirement}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, otherRequirement: text }))}
                            editable={!readOnly}
                        />
                    </View>
                )}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Description</ThemedText>
                <TextInput
                    style={[styles.input, styles.textArea, readOnly && styles.inputDisabled]}
                    placeholder="Please provide more details about your requirement..."
                    value={formData.requirementDescription}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, requirementDescription: text }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!readOnly}
                />
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>⚠️ Priority</ThemedText>
                <View style={styles.radioGroup}>
                    {['Normal', 'Imp', 'Most Imp', 'Urgent'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.radioButton,
                                formData.priority === option && styles.radioActive,
                                readOnly && { opacity: 0.6 }
                            ]}
                            onPress={() => !readOnly && setFormData(prev => ({ ...prev, priority: option }))}
                            disabled={readOnly}
                        >
                            <Ionicons
                                name={formData.priority === option ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={formData.priority === option ? "#6366f1" : "#64748b"}
                            />
                            <ThemedText style={styles.radioLabel}>{option}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {
                !readOnly && (
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                                <ThemedText style={styles.submitText}>{customerId ? 'Update Details' : 'Submit'}</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                )
            }

            <View style={{ height: 40 }} />
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
        backgroundColor: 'transparent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 5,
        padding: 8,
        zIndex: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 10,
    },
    logo: {
        width: 120,
        height: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
    },
    subtitle: {
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#334155',
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
    },
    gridItem: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        marginBottom: 8,
    },
    imagePlaceholder: {
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContent: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    switchLabel: {
        fontSize: 14,
        color: '#475569',
    },
    radioGroup: {
        gap: 8,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 10,
    },
    radioActive: {
        borderColor: '#6366f1',
        backgroundColor: '#eef2ff',
    },
    radioLabel: {
        fontSize: 16,
        color: '#1e293b',
    },
    submitButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        borderColor: '#e2e8f0',
    },
});
