import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface LandingScreenProps {
    topInset: number;
    onAddExhibition: () => void;
}

interface Exhibition {
    _id: string;
    name: string;
    location?: string;
    date?: string;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ topInset, onAddExhibition }) => {
    const router = useRouter();
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExhibitions = async () => {
        try {
            setLoading(true);
            const baseUrl = API_URL.replace(/\/customers$/, '');
            const response = await fetch(`${baseUrl}/exhibitions`);
            const data = await response.json();
            if (data.success) {
                setExhibitions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch exhibitions:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExhibitions();
        }, [])
    );

    return (
        <ThemedView style={[styles.landingContainer, { paddingTop: topInset }]}>
            <View style={styles.landingHeader}>
                <View style={styles.splashLogoContainer}>
                    <Image
                        source={require('../assets/images/logo/Screenshot_2026-02-04_164909-Picsart-AiImageEnhancer-removebg-preview.png')}
                        style={styles.landingLogo}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/images/logo/IMG-20260205-WA0001-removebg-preview.png')}
                        style={styles.landingLogo}
                        resizeMode="contain"
                    />
                </View>
                <ThemedText type="title" style={styles.landingTitle}>Exhibitions</ThemedText>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <ThemedText style={styles.statsLabel}>Active Exhibitions</ThemedText>
                        <ThemedText
                            style={styles.statsValue}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {loading ? '...' : exhibitions.length}
                        </ThemedText>
                    </View>
                    <View style={styles.statsIcon}>
                        <Ionicons name="business" size={32} color="#6366f1" />
                    </View>
                </View>

                {/* Quick Action */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAddExhibition}
                >
                    <View style={styles.actionIconContainer}>
                        <Ionicons name="add-circle-outline" size={24} color="white" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <ThemedText style={styles.actionTitle}>Add New Exhibition</ThemedText>
                        <ThemedText style={styles.actionDesc}>Create a new event folder</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                {/* Exhibition Cards */}
                <View style={styles.recentSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Select Exhibition</ThemedText>
                    {loading ? (
                        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
                    ) : exhibitions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="journal-outline" size={48} color="#cbd5e1" />
                            <ThemedText style={styles.emptyText}>No exhibitions added yet</ThemedText>
                        </View>
                    ) : (
                        exhibitions.map((exhibition) => (
                            <TouchableOpacity
                                key={exhibition._id}
                                style={styles.customerCard}
                                onPress={() => router.push({
                                    pathname: '/exhibition/[name]',
                                    params: { name: exhibition.name }
                                })}
                            >
                                <View style={styles.customerInfo}>
                                    <ThemedText style={styles.customerName}>{exhibition.name}</ThemedText>
                                    <View style={styles.exhibitionMeta}>
                                        <Ionicons name="location-outline" size={12} color="#64748b" />
                                        <ThemedText style={styles.customerCompany}>
                                            {exhibition.location || 'Not specified'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6366f1" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    landingContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
    },
    landingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    splashLogoContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    landingLogo: {
        width: 80,
        height: 40,
    },
    landingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    content: {
        flex: 1,
    },
    statsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statsLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    statsValue: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '800',
        color: '#1e293b',
    },
    statsIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#6366f1',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 16,
    },
    recentSection: {
        flex: 1,
    },
    customerCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    customerInfo: {
        flex: 1,
    },
    exhibitionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    customerCompany: {
        fontSize: 14,
        color: '#64748b',
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});
