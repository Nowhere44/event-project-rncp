'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var leaflet_1 = require("leaflet");
require("leaflet/dist/leaflet.css");
var navigation_1 = require("next/navigation");
var EventMap = function (_a) {
    var events = _a.events;
    var mapRef = react_1.useRef(null);
    var router = navigation_1.useRouter();
    var _b = react_1.useState(null), userLocation = _b[0], setUserLocation = _b[1];
    console.log('events:', events);
    react_1.useEffect(function () {
        if (typeof window !== 'undefined' && !mapRef.current) {
            mapRef.current = leaflet_1["default"].map('map').setView([46.603354, 1.888334], 6);
            leaflet_1["default"].tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var _a = position.coords, latitude = _a.latitude, longitude = _a.longitude;
                    setUserLocation([latitude, longitude]);
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude], 14);
                        leaflet_1["default"].marker([latitude, longitude], {
                            icon: leaflet_1["default"].divIcon({
                                className: 'user-location-marker',
                                html: '📍',
                                iconSize: [25, 25],
                                iconAnchor: [12, 24]
                            })
                        }).addTo(mapRef.current).bindPopup("Vous êtes ici");
                    }
                }, function (error) {
                    console.error("Erreur de géolocalisation:", error);
                });
            }
        }
        if (mapRef.current) {
            events.forEach(function (event) {
                console.log('Event:', event);
                if (event.latitude && event.longitude) {
                    var marker = leaflet_1["default"].marker([event.latitude, event.longitude])
                        .addTo(mapRef.current)
                        .bindPopup("<div>\n            <h3>" + event.title + "</h3>\n            <img src=\"" + (event === null || event === void 0 ? void 0 : event.imageUrl) + "\" alt=\"" + event.title + "\" style=\"width:100%;max-width:200px;\"/>\n            <p>" + event.description.substring(0, 100) + "...</p>\n            <button onclick=\"window.location.href='/events/" + event.id + "'\">Voir l'\u00E9v\u00E9nement</button>\n        </div>\n    ");
                    marker.on('click', function () {
                        router.push("/events/" + event.id);
                    });
                }
            });
        }
        return function () {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [events, router]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "map", style: { height: '400px', width: '100%' } }),
        React.createElement("style", { jsx: true, global: true }, "\n                .user-location-marker {\n                    font-size: 25px;\n                    text-align: center;\n                }\n            ")));
};
exports["default"] = EventMap;
