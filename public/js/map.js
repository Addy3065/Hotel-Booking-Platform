// mapToken and coordinates come from the #map element's data attributes in views/listings/show.ejs
const mapEl = document.getElementById("map");
const mapToken = mapEl.dataset.mapToken;
const coordinates = JSON.parse(mapEl.dataset.coordinates); // [lng, lat]

if (mapToken) {
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9, // starting zoom
  });

  const marker1 = new mapboxgl.Marker({ color: "#ff385c" })
    .setLngLat(coordinates)
    .addTo(map);
} else {
  // no Mapbox token: Leaflet + OpenStreetMap (Leaflet takes [lat, lng])
  const latLng = [coordinates[1], coordinates[0]];
  const map = L.map("map").setView(latLng, 9);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  L.marker(latLng).addTo(map);
}
