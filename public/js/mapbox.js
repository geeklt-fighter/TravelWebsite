/* eslint-disable */
console.log('hello: from the client side')


export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGltbG8iLCJhIjoiY2s2YnFxcHd1MDJodTNtbXNvdnF3MDEyZyJ9.yuLUs1Dze7eOSwkDMbEEoQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/timlo/ck6bqv7wt2pyq1iruioq47c83',
        scrollZoom: false
        // center: [121.038269, 24.655387],
        // zoom: 8
    });

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div')
        el.className = 'marker'

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map)

        // Add popup
        new mapboxgl.Popup({
            offset: 15
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map)

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 250,
            left: 100,
            right: 100
        }
    })
}

