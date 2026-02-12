import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Customer {
    _id: string;
    name: string;
    companyName: string;
    priority: string;
}

export default function ExhibitionDetailScreen() {
    const { name } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExhibitionCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}?exhibitionName=${encodeURIComponent(name as string)}`);
            const data = await response.json();
            if (data.success) {
                setCustomers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch exhibition customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExhibitionCustomers();
        }, [name])
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#ef4444';
            case 'Most Imp': return '#f97316';
            case 'Imp': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const renderCustomer = ({ item }: { item: Customer }) => (
        <TouchableOpacity
            style={styles.customerCard}
            onPress={() => router.push({ pathname: '/customer/[id]', params: { id: item._id, readOnly: 'true' } })}
        >
            <View style={styles.customerInfo}>
                <ThemedText style={styles.customerName}>{item.name}</ThemedText>
                <ThemedText style={styles.customerCompany}>{item.companyName}</ThemedText>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                <ThemedText style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                    {item.priority}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: name as string }} />

            <View style={[styles.headerActions, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>{name}</ThemedText>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push({
                        pathname: '/customer/new',
                        params: { initialExhibition: name }
                    })}
                >
                    <Ionicons name="person-add" size={20} color="white" />
                    <ThemedText style={styles.addButtonText}>Add New Customer</ThemedText>
                </TouchableOpacity>

                <View style={styles.listHeader}>
                    <ThemedText style={styles.listTitle}>Registered Customers</ThemedText>
                    <ThemedText style={styles.countText}>{customers.length} total</ThemedText>
                </View>

                {loading ? (
                    <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} />
                ) : customers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <ThemedText style={styles.emptyText}>No customers registered for this event yet.</ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={customers}
                        renderItem={renderCustomer}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 24,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
    },
    countText: {
        fontSize: 14,
        color: '#64748b',
    },
    listContent: {
        paddingBottom: 20,
    },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    customerCompany: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
