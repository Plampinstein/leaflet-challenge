// Creating the map object
let myMap = L.map("map", {
    center: [39.8097, -98.555183],
    zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data.
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Determine marker by earthquake magnitude
function getMarkerSize(magnitude) {
    return magnitude * 5;
}

// Determine marker color by earthquake depth
function getMarkerColor(depth) {
    if (depth < 10) {
        return 'green';
    } else if (depth < 30) {
        return 'yellow';
    } else if (depth < 50) {
        return 'orange';
    } else {
        return 'red';
    }
}

// Define a function to create popups for earthquake markers
function createPopup(feature) {
    return `<h3>${feature.properties.place}</h3><hr>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km`;
}

// Get the data with d3.
d3.json(url).then(function (response) {
    if (response && response.features) {
        let features = response.features;
        console.log(features);

        let marker_limit = features.length;

        for (let i = 0; i < marker_limit && i < features.length; i++) {
            let feature = features[i];
            if (feature.geometry) {
                let location = feature.geometry.coordinates;
                let magnitude = feature.properties.mag;
                let depth = location[2];
                let markerSize = getMarkerSize(magnitude);
                let markerColor = getMarkerColor(depth);

                // Adding custom markers with popups
                L.circleMarker([location[1], location[0]], {
                    radius: markerSize,
                    color: 'black',
                    weight: 1,
                    fillColor: markerColor,
                    fillOpacity: 0.8
                })
                .bindPopup(createPopup(feature))
                .addTo(myMap);
            }
        }

        // Create a legend
        let legend = L.control({ position: "bottomright" });
        legend.onAdd = function (myMap) {
            let div = L.DomUtil.create("div", "info legend");
            let colors = ['green', 'yellow', 'orange', 'red'];
            let depths = [0, 10, 30, 50];

            div.innerHTML = '<h4>Earthquake Depth (km)</h4>';
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML += `<i style="background: ${colors[i]}"></i>${depths[i] + (i === depths.length - 1 ? '+' : '')}<br>`;
            }

            return div;
        };
        legend.addTo(myMap);
    }
});