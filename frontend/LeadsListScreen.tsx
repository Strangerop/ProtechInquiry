import { CitySelector } from '@/components/city-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { useCityFilter } from '@/hooks/use-city-filter';
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

interface Exhibition {
    _id: string;
    name: string;
    city?: string;
    location?: string;
    date?: string;
    customerCount?: number;
}

// Updated Interface for Lead
interface Lead {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
    photoUrl?: string; // Optional now
    cardFront?: string; // Optional fallback
    createdAt: string;
    exhibitionName: string;
    city?: string;
    priority: string; // Added priority
}

interface LeadsListScreenProps {
    topInset: number;
}

export const LeadsListScreen: React.FC<LeadsListScreenProps> = ({ topInset }) => {
    const router = useRouter();
    const { selectedCity, setSelectedCity } = useCityFilter();

    // State management
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedExhibition, setSelectedExhibition] = useState<string | null>(null);
    const [selectedPriority, setSelectedPriority] = useState('All');

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const priorities = ['All', 'Normal', 'Imp', 'Most Imp', 'Urgent'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const baseUrl = API_URL.replace(/\/customers$/, '');

            if (!selectedExhibition) {
                // Fetch Exhibitions for the selected city
                let url = `${baseUrl}/exhibitions?city=${selectedCity}`;
                console.log('Fetching exhibitions from:', url);
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setExhibitions(data.data);
                } else {
                    console.error('Fetch exhibitions failed:', data.message);
                }
            } else {
                // Fetch Leads for the selected exhibition and priority
                let url = `${baseUrl}/leads?exhibitionName=${encodeURIComponent(selectedExhibition)}`;
                if (selectedPriority !== 'All') {
                    url += `&priority=${selectedPriority}`;
                }
                if (selectedCity !== 'All') {
                    url += `&city=${encodeURIComponent(selectedCity)}`;
                }
                console.log('Fetching leads from:', url);
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setLeads(data.data);
                } else {
                    console.error('Fetch leads failed:', data.message);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedCity, selectedExhibition, selectedPriority])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Filter logic for search bar
    const filteredExhibitions = exhibitions.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.location && ex.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ex.city && ex.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.mobileNumber.includes(searchQuery) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderExhibitionItem = ({ item }: { item: Exhibition }) => (
        <TouchableOpacity
            style={styles.exhibitionCard}
            onPress={() => {
                setSelectedExhibition(item.name);
                setSearchQuery(''); // Clear search when navigating to leads
                setSelectedPriority('All'); // Reset priority filter
            }}
        >
            <View style={styles.exhibitionInfo}>
                <Ionicons name="folder-outline" size={32} color="#6366f1" />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <ThemedText style={styles.exhibitionName}>{item.name}</ThemedText>
                    </View>
                    <View style={styles.exhibitionMetaRow}>
                        <View style={styles.exhibitionMeta}>
                            <Ionicons name="business-outline" size={12} color="#64748b" />
                            <ThemedText style={styles.exhibitionCity}>
                                {item.city || 'Not specified'}
                            </ThemedText>
                        </View>
                        {item.date && (
                            <View style={styles.exhibitionMeta}>
                                <Ionicons name="calendar-outline" size={12} color="#64748b" />
                                <ThemedText style={styles.exhibitionCity}>
                                    {item.date}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    const renderLeadItem = ({ item }: { item: Lead }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/lead/[id]', params: { id: item._id } })}
        >
            <View style={styles.cardContent}>
                <Image
                    source={item.photoUrl ? { uri: item.photoUrl } : (item.cardFront ? { uri: item.cardFront } : { uri: 'https://via.placeholder.com/100' })}
                    style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={12} color="#64748b" />
                        <ThemedText style={styles.infoText}>{item.mobileNumber}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={12} color="#64748b" />
                        <ThemedText style={styles.infoText}>{item.email}</ThemedText>
                    </View>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <ThemedText style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                        {item.priority}
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
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
        <ThemedView style={[styles.container, { paddingTop: topInset }]}>
            {/* Header */}
            <View style={styles.header}>
                {selectedExhibition ? (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            setSelectedExhibition(null);
                            setSearchQuery(''); // Clear search when going back
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                ) : null}
                <ThemedText type="title" style={styles.headerTitle}>
                    {selectedExhibition || 'Exhibitions'}
                </ThemedText>
            </View>

            {/* View-specific Filters */}
            {!selectedExhibition ? (
                <CitySelector selectedCity={selectedCity} onSelectCity={(city) => {
                    setSelectedCity(city);
                    setSearchQuery('');
                }} />
            ) : (
                <View>
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
                                onPress={() => setSelectedPriority(priority)}
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
                </View>
            )}

            {/* Shared Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={selectedExhibition ? "Search leads..." : "Search exhibitions..."}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            {/* List Content */}
            <FlatList
                data={(selectedExhibition ? filteredLeads : filteredExhibitions) as any[]}
                renderItem={(selectedExhibition ? renderLeadItem : renderExhibitionItem) as any}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name={selectedExhibition ? "people-outline" : "business-outline"}
                                size={48}
                                color="#cbd5e1"
                            />
                            <ThemedText style={styles.emptyText}>
                                {selectedExhibition ? "No leads found" : "No exhibitions found"}
                            </ThemedText>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 20,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: '#1e293b',
        fontWeight: 'bold',
        flex: 1,
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
        paddingTop: 0,
    },
    exhibitionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    exhibitionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    exhibitionName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    exhibitionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exhibitionMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 4,
    },
    exhibitionCity: {
        fontSize: 14,
        color: '#64748b',
    },
    countBadge: {
        backgroundColor: '#eef2ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e7ff',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366f1',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
    },
    infoContainer: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#64748b',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
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
        paddingVertical: 8,
        borderRadius: 20,
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
