import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Updated Interface for Lead
interface Lead {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
    photoUrl?: string; // Optional now
    cardFront?: string; // Optional fallback
    createdAt: string;
}

interface LeadsListScreenProps {
    topInset: number;
}

export const LeadsListScreen: React.FC<LeadsListScreenProps> = ({ topInset }) => {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [selectedPriority, setSelectedPriority] = useState('All');
    const priorities = ['All', 'Normal', 'Imp', 'Most Imp', 'Urgent'];

    const fetchLeads = async (priority = selectedPriority) => {
        try {
            setLoading(true);

            // Construct URL: Replace /customers with /leads if needed, or use a new constant
            // Assuming API_URL is still .../api/customers, we strip it.
            const baseUrl = API_URL.replace(/\/customers$/, '');
            let leadsUrl = `${baseUrl}/leads`;

            if (priority && priority !== 'All') {
                leadsUrl += `?priority=${encodeURIComponent(priority)}`;
            }

            console.log('Fetching leads from:', leadsUrl);

            const response = await fetch(leadsUrl);
            const data = await response.json();

            if (data.success) {
                setLeads(data.data);
            } else {
                console.error('Fetch failed:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLeads();
        }, [selectedPriority])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    const handlePrioritySelect = (priority: string) => {
        setSelectedPriority(priority);
        // fetchLeads(priority); // useFocusEffect will trigger
    };

    // Filter leads based on search query
    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.mobileNumber.includes(searchQuery) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Lead }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/lead/[id]', params: { id: item._id } })}
        >
            <View style={styles.cardContent}>
                {/* Photo */}
                <Image
                    source={item.photoUrl ? { uri: item.photoUrl } : (item.cardFront ? { uri: item.cardFront } : { uri: 'https://via.placeholder.com/100' })}
                    style={styles.avatar}
                />

                <View style={styles.infoContainer}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={14} color="#64748b" />
                        <ThemedText style={styles.infoText}>{item.email}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={14} color="#64748b" />
                        <ThemedText style={styles.infoText}>{item.mobileNumber}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <ThemedText style={styles.infoText}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </ThemedText>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={[styles.container, { paddingTop: topInset }]}>
            <View style={styles.header}>
                <ThemedText type="title">Leads</ThemedText>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name, email..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            {/* Priority Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContainer}
            >
                {priorities.map((priority) => (
                    <TouchableOpacity
                        key={priority}
                        style={[
                            styles.filterButton,
                            selectedPriority === priority && styles.filterButtonActive
                        ]}
                        onPress={() => handlePrioritySelect(priority)}
                    >
                        <ThemedText
                            style={[
                                styles.filterText,
                                selectedPriority === priority && styles.filterTextActive
                            ]}
                        >
                            {priority}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Leads List */}
            <FlatList
                data={filteredLeads}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                            <ThemedText style={styles.emptyText}>No leads found</ThemedText>
                        </View>
                    ) : null
                }
            />

            {loading && !refreshing && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    listContent: {
        padding: 20,
        gap: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f1f5f9',
    },
    infoContainer: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 12,
        fontSize: 16,
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    filterContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    filterText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
});
