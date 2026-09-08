const listing = JSON.parse(
    document.getElementById("listing-data").textContent
);

const coordinates = listing.geometry.coordinates;

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "map",
    center: coordinates,
    zoom: 9,
});

const marker = new mapboxgl.Marker({
    color: "red",
}
)
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 37 }).setHTML(
            `<h5>${listing.title}</h5><p>Exact Location will be provided after booking</p>`

        )

    )
    .addTo(map);