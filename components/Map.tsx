import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  buildLeafletMapHtml,
  DEFAULT_MAP_REGION,
  MapMarker,
  MapRegion,
} from '@/utils/mapEmbed';

interface MapProps {
  markers?: MapMarker[];
  initialRegion?: MapRegion;
  style?: ViewStyle;
  showsUserLocation?: boolean;
}

export const Map = ({
  markers = [],
  initialRegion = DEFAULT_MAP_REGION,
  style,
}: MapProps) => {
  const mapHtml = useMemo(
    () => buildLeafletMapHtml(markers, initialRegion),
    [initialRegion, markers]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        scrollEnabled={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    width: '100%',
    minHeight: 200,
    backgroundColor: '#e5e7eb',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
