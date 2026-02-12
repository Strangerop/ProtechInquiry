import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

interface SplashScreenProps {
    topInset: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ topInset }) => {
    return (
        <ThemedView style={[styles.splashContainer, { paddingTop: topInset }]}>
            <View style={styles.splashLogoContainer}>
                <Image
                    source={require('../assets/images/logo/Screenshot_2026-02-04_164909-Picsart-AiImageEnhancer-removebg-preview.png')}
                    style={styles.splashLogo}
                    resizeMode="contain"
                />
                <Image
                    source={require('../assets/images/logo/IMG-20260205-WA0001-removebg-preview.png')}
                    style={styles.splashLogo}
                    resizeMode="contain"
                />
            </View>
            <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 20 }} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    splashLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    splashLogo: {
        width: 140,
        height: 70,
    },
});
