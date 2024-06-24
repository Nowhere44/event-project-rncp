'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var image_1 = require("next/image");
var link_1 = require("next/link");
var event_list_1 = require("./events/_components/event-list");
var search_filter_1 = require("./events/_components/search-filter");
var event_map_1 = require("./events/_components/event-map");
function Home() {
    var _this = this;
    var _a = react_1.useState([]), events = _a[0], setEvents = _a[1];
    var _b = react_1.useState(1), totalPages = _b[0], setTotalPages = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var fetchEvents = react_1.useCallback(function (filters) {
        if (filters === void 0) { filters = {}; }
        return __awaiter(_this, void 0, void 0, function () {
            var queryParams, response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        queryParams = new URLSearchParams(filters).toString();
                        return [4 /*yield*/, fetch("/api/events?" + queryParams)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status: " + response.status);
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setEvents(data.events);
                        setTotalPages(data.totalPages);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error fetching events:', error_1);
                        setEvents([]);
                        setTotalPages(1);
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, []);
    react_1.useEffect(function () {
        fetchEvents();
    }, [fetchEvents]);
    return (React.createElement(React.Fragment, null,
        React.createElement("section", { className: "bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10" },
            React.createElement("div", { className: "wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-12 items-center" },
                React.createElement("div", { className: "flex flex-col justify-center gap-8" },
                    React.createElement("h1", { className: "h1-bold" }, "Organisez, Connectez, C\u00E9l\u00E9brez: Vos \u00C9v\u00E9nements, Notre Plateforme!"),
                    React.createElement("p", { className: "p-regular-20 md:p-regular-24" }, "R\u00E9servez et d\u00E9couvrez des conseils utiles de plus de 3 168 mentors dans des entreprises de classe mondiale avec notre communaut\u00E9 globale."),
                    React.createElement("p", { className: "p-regular-20 md:p-regular-24" }, "Notre application vous permet de cr\u00E9er, g\u00E9rer et participer \u00E0 divers \u00E9v\u00E9nements. Que ce soit pour des soir\u00E9es, des s\u00E9minaires, des jeux, ou des ateliers, nous facilitons l'organisation et la participation \u00E0 vos \u00E9v\u00E9nements pr\u00E9f\u00E9r\u00E9s."),
                    React.createElement(button_1.Button, { size: "lg", asChild: true, className: "button w-full sm:w-fit" },
                        React.createElement(link_1["default"], { href: "#events" }, "Explorez Maintenant"))),
                React.createElement(image_1["default"], { src: "/assets/images/10821625.jpg", alt: "h\u00E9ros", width: 1000, height: 1000, className: "max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]" }))),
        React.createElement("section", { id: "events", className: "wrapper my-8 flex flex-col gap-8 md:gap-12" },
            React.createElement("h2", { className: "h2-bold" }, "D\u00E9couvrez les \u00E9v\u00E9nements pr\u00E8s de chez vous"),
            React.createElement(event_map_1["default"], { events: events }),
            React.createElement("h2", { className: "h2-bold" },
                "Faites Confiance \u00E0 des ", "Milliers d'\u00C9v\u00E9nements"),
            React.createElement("p", { className: "p-regular-20 md:p-regular-24" }, "Notre plateforme est utilis\u00E9e par des milliers d'organisateurs d'\u00E9v\u00E9nements pour planifier et ex\u00E9cuter leurs \u00E9v\u00E9nements avec succ\u00E8s. Rejoignez-nous pour une exp\u00E9rience unique et enrichissante."),
            React.createElement(search_filter_1["default"], { onFilterChange: fetchEvents }),
            isLoading ? (React.createElement("p", null, "Chargement des \u00E9v\u00E9nements...")) : (React.createElement(event_list_1["default"], { data: events, emptyTitle: "Aucun \u00E9v\u00E9nement trouv\u00E9", emptyStateSubtext: "Revenez plus tard pour voir de nouveaux \u00E9v\u00E9nements", collectionType: "All_Events", limit: 6, page: 1, totalPages: 1, urlParamName: "page" })),
            events.length > 0 && (React.createElement(button_1.Button, { size: "lg", asChild: true, className: "button w-full sm:w-fit mx-auto" },
                React.createElement(link_1["default"], { href: "/events" }, "Voir tous les \u00E9v\u00E9nements"))))));
}
exports["default"] = Home;
