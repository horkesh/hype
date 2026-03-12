import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

interface MapProps {
  markers?: MapMarker[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: ViewStyle;
  showsUserLocation?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildMapHtml(markers: MapMarker[], initialRegion: NonNullable<MapProps['initialRegion']>): string {
  const markerScript = markers
    .map((marker) => {
      const title = marker.title ? escapeHtml(marker.title) : '';
      const description = marker.description ? escapeHtml(marker.description) : '';
      const popup = title || description
        ? `marker.bindPopup(${JSON.stringify(`<strong>${title}</strong>${description ? `<br/>${description}` : ''}`)});`
        : '';

      return `
        marker = L.marker([${marker.latitude}, ${marker.longitude}]).addTo(map);
        ${popup}
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        overflow: hidden;
        background: #e5e7eb;
      }

      .leaflet-control-zoom,
      .leaflet-control-attribution {
        box-shadow: none;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      let marker;
      ${markerScript}
    </script>
  </body>
</html>`;
}

export const Map = ({
  markers = [],
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  style,
}: MapProps) => {
  const mapHtml = useMemo(
    () => buildMapHtml(markers, initialRegion),
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
