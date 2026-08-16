import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";
import {
    searchPlacesAutocomplete,
    getPlaceCoordinates,
    createSessionToken,
} from "../../services/locationService";

export default function PlaceSearchInput({
    placeholder = "Search address or landmark",
    onSelectLocation,
    initialValue = "",
}) {
    const { colors } = useTheme();
    const [query, setQuery] = useState(initialValue || "");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const sessionTokenRef = useRef(createSessionToken());
    const debounceTimerRef = useRef(null);

    // Synchronize query when initialValue prop updates (e.g. on navigation back/forward)
    useEffect(() => {
        setQuery(initialValue || "");
    }, [initialValue]);

    const performSearch = useCallback(async (text) => {
        if (!text || text.trim().length < 2) {
            setSuggestions([]);
            setLoading(false);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        const { data } = await searchPlacesAutocomplete(text, sessionTokenRef.current);
        setLoading(false);
        setSuggestions(data || []);
        setIsOpen((data || []).length > 0);
    }, []);

    const handleChangeText = (text) => {
        setQuery(text);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            performSearch(text);
        }, 350);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setIsOpen(false);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };

    const handleSelectPrediction = async (item) => {
        setLoading(true);
        setIsOpen(false);
        const addressText = item.fullText || item.primaryText;
        setQuery(addressText);

        const { data } = await getPlaceCoordinates(
            item.placeId,
            addressText
        );
        setLoading(false);

        // Renew session token after selection
        sessionTokenRef.current = createSessionToken();

        if (onSelectLocation && data && typeof data.latitude === "number" && typeof data.longitude === "number") {
            onSelectLocation({
                address: addressText,
                latitude: data.latitude,
                longitude: data.longitude,
            });
        }
    };

    const handleUseTyped = async () => {
        if (!query.trim()) return;
        setIsOpen(false);

        // If suggestions are currently available, pick the top suggestion for accurate coordinates
        if (suggestions && suggestions.length > 0) {
            await handleSelectPrediction(suggestions[0]);
            return;
        }

        // Otherwise perform a fast lookup on the typed text to resolve coordinates
        setLoading(true);
        const { data: searchResults } = await searchPlacesAutocomplete(query.trim(), sessionTokenRef.current);
        if (searchResults && searchResults.length > 0) {
            await handleSelectPrediction(searchResults[0]);
        }
        setLoading(false);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.card, borderColor: colors.border },
                ]}
            >
                <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={query}
                    onChangeText={handleChangeText}
                    returnKeyType="search"
                    onSubmitEditing={handleUseTyped}
                    accessibilityLabel={placeholder}
                />
                {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.rightIcon} />
                ) : query.length > 0 ? (
                    <Pressable
                        onPress={handleClear}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        style={styles.rightIcon}
                    >
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </Pressable>
                ) : null}
            </View>

            {isOpen && suggestions.length > 0 && (
                <View
                    style={[
                        styles.dropdown,
                        { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                >
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id || item.placeId || item.primaryText}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item, index }) => (
                            <Pressable
                                style={[
                                    styles.suggestionRow,
                                    { borderBottomColor: colors.border },
                                    index === suggestions.length - 1 && styles.noBorder,
                                ]}
                                onPress={() => handleSelectPrediction(item)}
                                accessibilityRole="button"
                                accessibilityLabel={`${item.primaryText}, ${item.secondaryText}`}
                            >
                                <View
                                    style={[
                                        styles.pinIconWrapper,
                                        { backgroundColor: colors.background },
                                    ]}
                                >
                                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={styles.suggestionTextWrapper}>
                                    <Text
                                        style={[styles.primaryText, { color: colors.text }]}
                                        numberOfLines={1}
                                    >
                                        {item.primaryText}
                                    </Text>
                                    {item.secondaryText ? (
                                        <Text
                                            style={[styles.secondaryText, { color: colors.textMuted }]}
                                            numberOfLines={1}
                                        >
                                            {item.secondaryText}
                                        </Text>
                                    ) : null}
                                </View>
                            </Pressable>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
        position: "relative",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: Spacing.borderRadius,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        height: 48,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: Fonts.body,
        paddingVertical: 0,
    },
    rightIcon: {
        marginLeft: Spacing.xs,
        padding: 4,
    },
    dropdown: {
        position: "absolute",
        top: 54,
        left: 0,
        right: 0,
        borderRadius: Spacing.borderRadius,
        borderWidth: 1,
        maxHeight: 220,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        zIndex: 100,
        overflow: "hidden",
    },
    suggestionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    pinIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.sm,
    },
    suggestionTextWrapper: {
        flex: 1,
    },
    primaryText: {
        fontSize: Fonts.body,
        fontWeight: Fonts.weight.semibold,
    },
    secondaryText: {
        fontSize: Fonts.caption,
        marginTop: 2,
    },
});
