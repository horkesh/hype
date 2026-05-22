export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const DEFAULT_MAP_REGION: MapRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildMarkerScript(markers: MapMarker[]): string {
  return markers
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
}

export function buildLeafletMapHtml(markers: MapMarker[], initialRegion: MapRegion): string {
  const markerScript = buildMarkerScript(markers);

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
