'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_chartjs_2_1 = require("react-chartjs-2");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var EventStats = function (_a) {
    var events = _a.events;
    var eventPopularity = events.map(function (event) { return (__assign(__assign({}, event), { reservationCount: event.reservations.reduce(function (sum, res) { return sum + res.numberOfTickets; }, 0) })); }).sort(function (a, b) { return b.reservationCount - a.reservationCount; });
    var top5Events = eventPopularity.slice(0, 5);
    var data = {
        labels: top5Events.map(function (event) { return event.title; }),
        datasets: [
            {
                label: 'Nombre de réservations',
                data: top5Events.map(function (event) { return event.reservationCount; }),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
        ]
    };
    var options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Top 5 des événements les plus populaires'
            }
        }
    };
    return (React.createElement("div", { className: "mt-8" },
        React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "Statistiques des \u00E9v\u00E9nements"),
        React.createElement(react_chartjs_2_1.Bar, { options: options, data: data })));
};
exports["default"] = EventStats;
