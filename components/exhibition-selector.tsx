import { EXHIBITIONS } from '@/hooks/use-exhibition-filter';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';

interface ExhibitionSelectorProps {
    selectedExhibition: string;
    onSelectExhibition: (exhibition: string) => void;
}

export const ExhibitionSelector: React.FC<ExhibitionSelectorProps> = ({
    selectedExhibition,
    onSelectExhibition
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {EXHIBITIONS.map((exhibition) => (
                <TouchableOpacity
                    key={exhibition}
                    style={[
                        styles.exhibitionButton,
                        selectedExhibition === exhibition && styles.exhibitionButtonActive,
                    ]}
                    onPress={() => onSelectExhibition(exhibition)}
                >
                    <ThemedText
                        style={[
                            styles.exhibitionText,
                            selectedExhibition === exhibition && styles.exhibitionTextActive,
                        ]}
                    >
                        {exhibition}
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
    exhibitionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    exhibitionButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    exhibitionText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    exhibitionTextActive: {
        color: '#fff',
    },
});
