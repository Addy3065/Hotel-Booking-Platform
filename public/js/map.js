// mapToken and coordinates come from the #map element's data attributes in views/listings/show.ejs
const mapEl = document.getElementById("map");
const mapToken = mapEl.dataset.mapToken;
const coordinates = JSON.parse(mapEl.dataset.coordinates);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});

const marker1 = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
