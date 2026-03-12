import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
import { SearchResult } from '@/utils/exploreScreen';

interface ExploreSearchSectionProps {
  accentColor: string;
  borderColor: string;
  cardColor: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onResultPress: (result: SearchResult) => void;
  placeholder: string;
  results: SearchResult[];
  searchLoading: boolean;
  showResults: boolean;
  textColor: string;
  textSecondaryColor: string;
  value: string;
}

function getSearchResultIcon(result: SearchResult) {
  if (result.type === 'venue') {
    return {
      android: 'place',
      ios: 'mappin.and.ellipse',
      label: 'Venue',
    };
  }

  return {
    android: 'event',
    ios: 'calendar',
    label: 'Event',
  };
}

export function ExploreSearchSection({
  accentColor,
  borderColor,
  cardColor,
  onChangeText,
  onFocus,
  onResultPress,
  placeholder,
  results,
  searchLoading,
  showResults,
  textColor,
  textSecondaryColor,
  value,
}: ExploreSearchSectionProps) {
  return (
    <View style={styles.section}>
      <View style={[styles.searchBar, { backgroundColor: cardColor, borderColor }]}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={textSecondaryColor}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={textSecondaryColor}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
        {searchLoading ? <ActivityIndicator size="small" color={accentColor} /> : null}
      </View>

      {showResults && results.length > 0 ? (
        <View style={[styles.searchResults, { backgroundColor: cardColor, borderColor }]}>
          {results.map((result) => {
            const icon = getSearchResultIcon(result);

            return (
              <TouchableOpacity
                key={result.id}
                style={[styles.searchResultItem, { borderBottomColor: borderColor }]}
                onPress={() => onResultPress(result)}
              >
                <Text style={[styles.searchResultText, { color: textColor }]}>{result.name}</Text>
                <View style={styles.searchResultMeta}>
                  <IconSymbol
                    ios_icon_name={icon.ios}
                    android_material_icon_name={icon.android}
                    size={16}
                    color={textSecondaryColor}
                  />
                  <Text style={[styles.searchResultType, { color: textSecondaryColor }]}>
                    {icon.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    position: 'relative',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchResultText: {
    fontSize: 16,
    flex: 1,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchResultType: {
    fontSize: 12,
    fontWeight: '600',
  },
});
