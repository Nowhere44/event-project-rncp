"use strict";
exports.__esModule = true;
var registration_form_1 = require("./_components/registration-form");
function RegisterPage() {
    return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" },
        React.createElement("div", { className: "max-w-md w-full space-y-8" },
            React.createElement("div", null,
                React.createElement("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900" }, "Cr\u00E9er un compte")),
            React.createElement(registration_form_1["default"], null))));
}
exports["default"] = RegisterPage;
