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
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var event_1 = require("@/lib/validations/event");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var react_datepicker_1 = require("react-datepicker");
require("react-datepicker/dist/react-datepicker.css");
var navigation_1 = require("next/navigation");
var image_1 = require("next/image");
var api_1 = require("@react-google-maps/api");
var EventForm = function (_a) {
    var userId = _a.userId, eventId = _a.eventId, defaultValues = _a.defaultValues;
    var _b = react_1.useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = react_1.useState([]), availableTags = _c[0], setAvailableTags = _c[1];
    var _d = react_1.useState(''), newTag = _d[0], setNewTag = _d[1];
    var router = navigation_1.useRouter();
    var autocompleteRef = react_1.useRef(null);
    var _e = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(event_1.eventSchema),
        defaultValues: defaultValues ? __assign(__assign({}, defaultValues), { tags: defaultValues.simplifiedTags || [] }) : {
            title: '',
            description: '',
            imageUrl: '',
            event_date: new Date(),
            start_time: new Date(),
            end_time: new Date(),
            location: '',
            latitude: null,
            longitude: null,
            capacity: 1,
            is_paid: false,
            price: 0,
            tags: []
        }
    }), register = _e.register, handleSubmit = _e.handleSubmit, control = _e.control, watch = _e.watch, setValue = _e.setValue, errors = _e.formState.errors;
    var isPaid = watch('is_paid');
    var selectedTags = watch('tags');
    var isLoaded = api_1.useLoadScript({
        googleMapsApiKey: "AIzaSyBSn_yYew80D6BEGDN5vd37wZpmx4WAbsU",
        libraries: ["places"]
    }).isLoaded;
    react_1.useEffect(function () {
        var fetchTags = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, tags, error_1;
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
                        tags = _a.sent();
                        setAvailableTags(tags);
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
    var onSubmit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, event, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("/api/events" + (eventId ? "/" + eventId : ''), {
                            method: eventId ? 'PUT' : 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, data), { userId: userId }))
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || 'Failed to submit event');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    event = _a.sent();
                    router.push("/events/" + event.id);
                    return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error submitting event:', error_2);
                    return [3 /*break*/, 8];
                case 7:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleAddTag = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, createdTag, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(newTag.trim() !== '')) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/tags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newTag.trim() })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    createdTag = _a.sent();
                    setAvailableTags(__spreadArrays(availableTags, [createdTag]));
                    setValue('tags', __spreadArrays(selectedTags, [createdTag.name]));
                    setNewTag('');
                    return [3 /*break*/, 5];
                case 4: throw new Error('Failed to create tag');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error creating tag:', error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handlePlaceSelect = function () {
        var _a, _b, _c, _d;
        if (autocompleteRef.current) {
            var place = autocompleteRef.current.getPlace();
            setValue('location', place.formatted_address || '');
            setValue('latitude', ((_b = (_a = place.geometry) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.lat()) || null);
            setValue('longitude', ((_d = (_c = place.geometry) === null || _c === void 0 ? void 0 : _c.location) === null || _d === void 0 ? void 0 : _d.lng()) || null);
        }
    };
    return (React.createElement("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6" },
        React.createElement(input_1.Input, __assign({}, register('title'), { placeholder: "Titre de l'\u00E9v\u00E9nement" })),
        errors.title && React.createElement("p", { className: "text-red-500" }, errors.title.message),
        React.createElement(textarea_1.Textarea, __assign({}, register('description'), { placeholder: "Description de l'\u00E9v\u00E9nement" })),
        errors.description && React.createElement("p", { className: "text-red-500" }, errors.description.message),
        React.createElement(input_1.Input, __assign({}, register('imageUrl'), { placeholder: "URL de l'image de l'\u00E9v\u00E9nement" })),
        errors.imageUrl && React.createElement("p", { className: "text-red-500" }, errors.imageUrl.message),
        watch('imageUrl') && (React.createElement(image_1["default"], { src: watch('imageUrl'), alt: "Event image", width: 200, height: 200 })),
        React.createElement(react_hook_form_1.Controller, { name: "event_date", control: control, render: function (_a) {
                var field = _a.field;
                return (React.createElement(react_datepicker_1["default"], { selected: field.value, onChange: function (date) { return field.onChange(date); }, dateFormat: "dd/MM/yyyy", placeholderText: "Date de l'\u00E9v\u00E9nement", className: "w-full p-2 border rounded" }));
            } }),
        React.createElement(react_hook_form_1.Controller, { name: "start_time", control: control, render: function (_a) {
                var field = _a.field;
                return (React.createElement(react_datepicker_1["default"], { selected: field.value, onChange: function (date) { return field.onChange(date); }, showTimeSelect: true, showTimeSelectOnly: true, timeIntervals: 15, timeCaption: "Heure", dateFormat: "HH:mm", placeholderText: "Heure de d\u00E9but", className: "w-full p-2 border rounded" }));
            } }),
        React.createElement(react_hook_form_1.Controller, { name: "end_time", control: control, render: function (_a) {
                var field = _a.field;
                return (React.createElement(react_datepicker_1["default"], { selected: field.value, onChange: function (date) { return field.onChange(date); }, showTimeSelect: true, showTimeSelectOnly: true, timeIntervals: 15, timeCaption: "Heure", dateFormat: "HH:mm", placeholderText: "Heure de fin", className: "w-full p-2 border rounded" }));
            } }),
        isLoaded ? (React.createElement("div", null,
            React.createElement("input", __assign({}, register('location'), { placeholder: "Lieu de l'\u00E9v\u00E9nement", className: "w-full p-2 border rounded", ref: function (ref) {
                    if (ref) {
                        autocompleteRef.current = new google.maps.places.Autocomplete(ref);
                        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
                    }
                } })))) : (React.createElement("input", __assign({}, register('location'), { placeholder: "Lieu de l'\u00E9v\u00E9nement", className: "w-full p-2 border rounded" }))),
        errors.location && React.createElement("p", { className: "text-red-500" }, errors.location.message),
        React.createElement(input_1.Input, __assign({ type: "number" }, register('capacity', { valueAsNumber: true }), { placeholder: "Capacit\u00E9" })),
        errors.capacity && React.createElement("p", { className: "text-red-500" }, errors.capacity.message),
        React.createElement("div", { className: "flex items-center space-x-2" },
            React.createElement(react_hook_form_1.Controller, { name: "is_paid", control: control, render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange }));
                } }),
            React.createElement("label", { htmlFor: "is_paid" }, "\u00C9v\u00E9nement payant")),
        isPaid && (React.createElement(input_1.Input, __assign({ type: "number", step: "0.01" }, register('price', { valueAsNumber: true }), { placeholder: "Prix" }))),
        errors.price && React.createElement("p", { className: "text-red-500" }, errors.price.message),
        React.createElement("div", null,
            React.createElement("h3", { className: "text-lg font-semibold mb-2" }, "Tags"),
            React.createElement("div", { className: "flex flex-wrap gap-2 mb-2" }, availableTags.map(function (tag) { return (React.createElement("button", { key: tag.id, type: "button", onClick: function () {
                    var newTags = selectedTags.includes(tag.name)
                        ? selectedTags.filter(function (t) { return t !== tag.name; })
                        : __spreadArrays(selectedTags, [tag.name]);
                    setValue('tags', newTags);
                }, className: "px-3 py-1 rounded-full text-sm " + (selectedTags.includes(tag.name)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700') }, tag.name)); })),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(input_1.Input, { value: newTag, onChange: function (e) { return setNewTag(e.target.value); }, placeholder: "Nouveau tag" }),
                React.createElement(button_1.Button, { type: "button", onClick: handleAddTag }, "Ajouter"))),
        React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting }, isSubmitting ? 'Envoi en cours...' : eventId ? 'Mettre à jour' : 'Créer l\'événement')));
};
exports["default"] = EventForm;
