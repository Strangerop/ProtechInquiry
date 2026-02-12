import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';

export const CITIES = ['All', 'Mumbai', 'Ahmedabad', 'Delhi', 'Bangalore'] as const;
export type City = (typeof CITIES)[number];

interface CitySelectorProps {
    selectedCity: City;
    onSelectCity: (city: City) => void;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onSelectCity }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {CITIES.map((city) => (
                <TouchableOpacity
                    key={city}
                    style={[
                        styles.cityButton,
                        selectedCity === city && styles.cityButtonActive,
                    ]}
                    onPress={() => onSelectCity(city)}
                >
                    <ThemedText
                        style={[
                            styles.cityText,
                            selectedCity === city && styles.cityTextActive,
                        ]}
                    >
                        {city}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        marginBottom: 16,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    cityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cityButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    cityText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    cityTextActive: {
        color: '#fff',
    },
});
