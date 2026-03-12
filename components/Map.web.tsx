import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
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
    [initialRegion, markers],
  );

  return (
    <View style={[styles.container, style]}>
      <iframe
        srcDoc={mapHtml}
        style={styles.iframe}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups"
        title="Venue map"
      />
      <View pointerEvents="none" style={styles.loadingOverlay}>
        <ActivityIndicator />
      </View>
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
    position: 'relative',
  },
  iframe: {
    borderWidth: 0,
    flex: 1,
    width: '100%',
    minHeight: 200,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
