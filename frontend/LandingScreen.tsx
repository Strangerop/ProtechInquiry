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
    onAddCustomer: () => void;
}

interface Customer {
    _id: string;
    name: string;
    companyName: string;
    priority: string;
    createdAt: string;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ topInset, onAddCustomer }) => {
    const router = useRouter();
    const [stats, setStats] = useState({ totalCustomers: 0 });
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}?limit=5`);
            const data = await response.json();
            if (data.success) {
                setStats({ totalCustomers: data.pagination.total });
                setRecentCustomers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#ef4444';
            case 'Most Imp': return '#f97316';
            case 'Imp': return '#3b82f6';
            default: return '#64748b';
        }
    };

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
                <ThemedText type="title" style={styles.landingTitle}>Dashboard</ThemedText>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <ThemedText style={styles.statsLabel}>Total Leads</ThemedText>
                        <ThemedText
                            style={styles.statsValue}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {loading ? '...' : stats.totalCustomers}
                        </ThemedText>
                    </View>
                    <View style={styles.statsIcon}>
                        <Ionicons name="people" size={32} color="#6366f1" />
                    </View>
                </View>

                {/* Quick Action */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAddCustomer}
                >
                    <View style={styles.actionIconContainer}>
                        <Ionicons name="person-add-outline" size={24} color="white" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <ThemedText style={styles.actionTitle}>Add New Customer</ThemedText>
                        <ThemedText style={styles.actionDesc}>Tap to open form</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                {/* Recent Leads */}
                <View style={styles.recentSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Leads</ThemedText>
                    {loading ? (
                        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
                    ) : recentCustomers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>No leads yet</ThemedText>
                        </View>
                    ) : (
                        recentCustomers.map((customer) => (
                            <TouchableOpacity
                                key={customer._id}
                                style={styles.customerCard}
                                onPress={() => router.push({ pathname: '/customer/[id]', params: { id: customer._id, readOnly: 'true' } })}
                            >
                                <View style={styles.customerInfo}>
                                    <ThemedText style={styles.customerName}>{customer.name}</ThemedText>
                                    <ThemedText style={styles.customerCompany}>{customer.companyName}</ThemedText>
                                </View>
                                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(customer.priority) + '20' }]}>
                                    <ThemedText style={[styles.priorityText, { color: getPriorityColor(customer.priority) }]}>
                                        {customer.priority}
                                    </ThemedText>
                                </View>
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
