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
exports.__esModule = true;
var react_1 = require("react");
var react_2 = require("next-auth/react");
var navigation_1 = require("next/navigation");
function ProfileComponent(_a) {
    var _this = this;
    var userId = _a.userId;
    var _b = react_2.useSession(), session = _b.data, update = _b.update, status = _b.status;
    var router = navigation_1.useRouter();
    var _c = react_1.useState(false), isEditing = _c[0], setIsEditing = _c[1];
    var _d = react_1.useState({
        firstName: '',
        lastName: '',
        email: '',
        image: ''
    }), userData = _d[0], setUserData = _d[1];
    react_1.useEffect(function () {
        if (session === null || session === void 0 ? void 0 : session.user) {
            setUserData({
                firstName: session.user.firstName || '',
                lastName: session.user.lastName || '',
                email: session.user.email || '',
                image: session.user.image || ''
            });
        }
    }, [session]);
    if (status === 'loading') {
        return React.createElement("div", { className: "flex justify-center items-center h-screen" }, "Chargement...");
    }
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }
    if (!(session === null || session === void 0 ? void 0 : session.user)) {
        return null;
    }
    var handleEdit = function () {
        setIsEditing(true);
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, updatedUser, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/user/" + userId, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                firstName: userData.firstName,
                                lastName: userData.lastName,
                                email: userData.email,
                                image: userData.image
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 2:
                    updatedUser = _a.sent();
                    return [4 /*yield*/, update(__assign(__assign({}, session), { user: __assign(__assign({}, session.user), { firstName: updatedUser.first_name, lastName: updatedUser.last_name, email: updatedUser.email, image: updatedUser.profile_picture }) }))];
                case 3:
                    _a.sent();
                    setIsEditing(false);
                    router.refresh();
                    return [3 /*break*/, 5];
                case 4:
                    console.error('Failed to update profile');
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error updating profile:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/user/" + userId, {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, react_2.signOut({ callbackUrl: '/' })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.error('Failed to delete account');
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error deleting account:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg" },
        React.createElement("h1", { className: "text-4xl font-bold mb-6 text-center text-gray-800" },
            "Profil de ",
            session.user.firstName),
        isEditing ? (React.createElement("div", { className: "space-y-6" },
            React.createElement("input", { type: "text", value: userData.firstName, onChange: function (e) { return setUserData(__assign(__assign({}, userData), { firstName: e.target.value })); }, className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Pr\u00E9nom" }),
            React.createElement("input", { type: "text", value: userData.lastName, onChange: function (e) { return setUserData(__assign(__assign({}, userData), { lastName: e.target.value })); }, className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Nom" }),
            React.createElement("input", { type: "email", value: userData.email, onChange: function (e) { return setUserData(__assign(__assign({}, userData), { email: e.target.value })); }, className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Email" }),
            React.createElement("input", { type: "text", value: userData.image || '', onChange: function (e) { return setUserData(__assign(__assign({}, userData), { image: e.target.value })); }, className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "URL de l'image de profil" }),
            React.createElement("button", { onClick: handleSave, className: "w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300" }, "Sauvegarder"))) : (React.createElement("div", { className: "space-y-4 text-center" },
            React.createElement("div", { className: "flex justify-center" }, session.user.image && (React.createElement("img", { src: session.user.image, alt: "Profile", className: "w-32 h-32 rounded-full mb-4" }))),
            React.createElement("p", { className: "text-xl" },
                React.createElement("strong", null, "Nom:"),
                " ",
                session.user.lastName),
            React.createElement("p", { className: "text-xl" },
                React.createElement("strong", null, "Pr\u00E9nom:"),
                " ",
                session.user.firstName),
            React.createElement("p", { className: "text-xl" },
                React.createElement("strong", null, "Email:"),
                " ",
                session.user.email),
            React.createElement("p", { className: "text-xl" },
                React.createElement("strong", null, "Role:"),
                " ",
                session.user.role))),
        React.createElement("div", { className: "mt-8 flex justify-center space-x-4" },
            !isEditing && (React.createElement("button", { onClick: handleEdit, className: "py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300" }, "Modifier le profil")),
            React.createElement("button", { onClick: handleDelete, className: "py-3 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300" }, "Supprimer le compte"))));
}
exports["default"] = ProfileComponent;
