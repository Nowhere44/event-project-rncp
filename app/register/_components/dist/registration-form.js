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
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
function RegisterForm() {
    var _this = this;
    var _a = react_1.useState(''), firstName = _a[0], setFirstName = _a[1];
    var _b = react_1.useState(''), lastName = _b[0], setLastName = _b[1];
    var _c = react_1.useState(''), email = _c[0], setEmail = _c[1];
    var _d = react_1.useState(''), password = _d[0], setPassword = _d[1];
    var _e = react_1.useState(''), dateOfBirth = _e[0], setDateOfBirth = _e[1];
    var _f = react_1.useState(''), profilePictureUrl = _f[0], setProfilePictureUrl = _f[1];
    var _g = react_1.useState(''), error = _g[0], setError = _g[1];
    var router = navigation_1.useRouter();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/user', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                first_name: firstName,
                                last_name: lastName,
                                email: email,
                                password: password,
                                date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
                                profile_picture: profilePictureUrl
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    router.push('/login');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    setError(data.error || 'Une erreur est survenue lors de l\'inscription');
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    setError('Une erreur est survenue lors de l\'inscription');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "bg-white p-8 rounded-lg shadow-md space-y-6" },
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700" }, "Pr\u00E9nom"),
                React.createElement("input", { type: "text", id: "firstName", value: firstName, onChange: function (e) { return setFirstName(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" })),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700" }, "Nom"),
                React.createElement("input", { type: "text", id: "lastName", value: lastName, onChange: function (e) { return setLastName(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" })),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700" }, "Email"),
                React.createElement("input", { type: "email", id: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" })),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700" }, "Mot de passe"),
                React.createElement("input", { type: "password", id: "password", value: password, onChange: function (e) { return setPassword(e.target.value); }, required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" })),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "dateOfBirth", className: "block text-sm font-medium text-gray-700" }, "Date de naissance"),
                React.createElement("input", { type: "date", id: "dateOfBirth", value: dateOfBirth, onChange: function (e) { return setDateOfBirth(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" })),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "profilePictureUrl", className: "block text-sm font-medium text-gray-700" }, "URL de la photo de profil"),
                React.createElement("input", { type: "url", id: "profilePictureUrl", value: profilePictureUrl, onChange: function (e) { return setProfilePictureUrl(e.target.value); }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50", placeholder: "https://exemple.com/photo.jpg" })),
            error && React.createElement("p", { className: "text-red-500" }, error),
            React.createElement("button", { type: "submit", className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" }, "S'inscrire")),
        React.createElement("div", { className: "text-center" },
            React.createElement("p", { className: "text-sm text-gray-600" },
                "D\u00E9j\u00E0 un compte ?",
                ' ',
                React.createElement(link_1["default"], { href: "/login", className: "text-indigo-600 hover:text-indigo-500" }, "Connectez-vous")))));
}
exports["default"] = RegisterForm;
