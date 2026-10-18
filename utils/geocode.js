// Turns an address into a GeoJSON Point for the listing map.
// Uses Mapbox when MAP_TOKEN is set, otherwise falls back to OpenStreetMap's free Nominatim service.
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
// the mapbox client throws without a token, so only create it when one is configured
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

async function geocode(query) {
  if (geocodingClient) {
    const response = await geocodingClient
      .forwardGeocode({ query, limit: 1 })
      .send();
    const feature = response.body.features[0];
    return feature ? feature.geometry : null;
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "WandersHub/1.0 (hotel listings demo)" },
  });
  if (!response.ok) return null;
  const [place] = await response.json();
  return place
    ? { type: "Point", coordinates: [Number(place.lon), Number(place.lat)] }
    : null;
}

module.exports = geocode;
