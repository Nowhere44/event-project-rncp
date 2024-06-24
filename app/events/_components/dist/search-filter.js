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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var react_datepicker_1 = require("react-datepicker");
require("react-datepicker/dist/react-datepicker.css");
var checkbox_1 = require("@/components/ui/checkbox");
var lodash_1 = require("lodash");
var SearchFilter = function (_a) {
    var onFilterChange = _a.onFilterChange;
    var _b = react_1.useState(''), query = _b[0], setQuery = _b[1];
    var _c = react_1.useState([]), tags = _c[0], setTags = _c[1];
    var _d = react_1.useState(null), date = _d[0], setDate = _d[1];
    var _e = react_1.useState(null), isPaid = _e[0], setIsPaid = _e[1];
    var _f = react_1.useState([]), availableTags = _f[0], setAvailableTags = _f[1];
    var router = navigation_1.useRouter();
    var searchParams = navigation_1.useSearchParams();
    react_1.useEffect(function () {
        var fetchTags = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch('/api/tags')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setAvailableTags(data);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error fetching tags:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchTags();
    }, []);
    var debouncedFilterChange = react_1.useCallback(lodash_1.debounce(function (filters) {
        onFilterChange(filters);
    }, 300), [onFilterChange]);
    react_1.useEffect(function () {
        var filters = {};
        if (query)
            filters.search = query;
        if (tags.length > 0)
            filters.category = tags.join(',');
        if (date)
            filters.date = date.toISOString();
        if (isPaid !== null)
            filters.isPaid = isPaid.toString();
        debouncedFilterChange(filters);
        // Mise à jour de l'URL
        var params = new URLSearchParams(searchParams);
        Object.entries(filters).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value) {
                params.set(key, value);
            }
            else {
                params["delete"](key);
            }
        });
        router.push("?" + params.toString(), { scroll: false });
    }, [query, tags, date, isPaid, debouncedFilterChange, router, searchParams]);
    var handleTagChange = function (tagName) {
        setTags(function (prev) {
            return prev.includes(tagName)
                ? prev.filter(function (t) { return t !== tagName; })
                : __spreadArrays(prev, [tagName]);
        });
    };
    return (React.createElement("div", { className: "flex flex-col md:flex-row gap-4" },
        React.createElement(input_1.Input, { type: "text", placeholder: "Rechercher un \u00E9v\u00E9nement...", value: query, onChange: function (e) { return setQuery(e.target.value); }, className: "w-full md:w-[300px]" }),
        React.createElement(select_1.Select, { onValueChange: handleTagChange },
            React.createElement(select_1.SelectTrigger, { className: "w-full md:w-[200px]" },
                React.createElement(select_1.SelectValue, { placeholder: "Tags" })),
            React.createElement(select_1.SelectContent, null, availableTags.map(function (tag) { return (React.createElement(select_1.SelectItem, { key: tag.id, value: tag.name }, tag.name)); }))),
        React.createElement(react_datepicker_1["default"], { selected: date, onChange: function (date) { return setDate(date); }, placeholderText: "S\u00E9lectionner une date", className: "w-full md:w-[200px] p-2 border rounded" }),
        React.createElement("div", { className: "flex items-center space-x-2" },
            React.createElement(checkbox_1.Checkbox, { id: "isPaid", checked: isPaid === true, onCheckedChange: function (checked) { return setIsPaid(checked ? true : null); } }),
            React.createElement("label", { htmlFor: "isPaid" }, "Payant")),
        React.createElement("div", { className: "flex items-center space-x-2" },
            React.createElement(checkbox_1.Checkbox, { id: "isFree", checked: isPaid === false, onCheckedChange: function (checked) { return setIsPaid(checked ? false : null); } }),
            React.createElement("label", { htmlFor: "isFree" }, "Gratuit"))));
};
exports["default"] = SearchFilter;
