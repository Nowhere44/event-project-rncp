"use strict";
// app/events/_components/event-card.tsx
exports.__esModule = true;
var utils_1 = require("@/lib/utils");
var image_1 = require("next/image");
var link_1 = require("next/link");
var react_1 = require("react");
var react_2 = require("next-auth/react");
var EventCard = function (_a) {
    var _b, _c, _d, _e;
    var event = _a.event, hasOrderLink = _a.hasOrderLink, hidePrice = _a.hidePrice;
    var _f = react_2.useSession(), session = _f.data, status = _f.status;
    var isOwner = ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) === event.userId;
    return (react_1["default"].createElement("div", { className: "group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]" },
        react_1["default"].createElement(link_1["default"], { href: "/events/" + event.id, style: { backgroundImage: event.imageUrl ? "url(" + event.imageUrl + ")" : 'none' }, className: "flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500" }),
        react_1["default"].createElement("div", { className: "flex min-h-[230px] flex-col gap-3 p-5 md:gap-4" },
            !hidePrice && (react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement("span", { className: "p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-60" }, event.is_paid ? event.price + " \u20AC" : 'GRATUIT'),
                react_1["default"].createElement("p", { className: "p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1" }, (event === null || event === void 0 ? void 0 : event.tags) && event.tags.length > 0
                    ? (((_c = event.tags[0].tag) === null || _c === void 0 ? void 0 : _c.name) || 'Tag sans nom')
                    : 'Non catégorisé'))),
            react_1["default"].createElement("p", { className: "p-medium-16 p-medium-18 text-grey-500" }, utils_1.formatDateTime(event.start_time).dateTime),
            react_1["default"].createElement("p", { className: "" },
                "Nombre de place : ",
                event.capacity),
            react_1["default"].createElement("p", { className: "p-medium-16 p-medium-18 text-grey-500" }, isOwner && 'Vous êtes l\'organisateur'),
            react_1["default"].createElement(link_1["default"], { href: "/events/" + event.id },
                react_1["default"].createElement("p", { className: "p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black" }, event.title)),
            react_1["default"].createElement("div", { className: "flex-between w-full" },
                react_1["default"].createElement("p", { className: "p-medium-14 md:p-medium-16 text-grey-600" }, (_d = event.user) === null || _d === void 0 ? void 0 :
                    _d.first_name,
                    " ", (_e = event.user) === null || _e === void 0 ? void 0 :
                    _e.last_name),
                hasOrderLink && (react_1["default"].createElement(link_1["default"], { href: "/orders?eventId=" + event.id, className: "flex gap-2" },
                    react_1["default"].createElement("p", { className: "text-primary-500" }, "D\u00E9tails de la commande"),
                    react_1["default"].createElement(image_1["default"], { src: "/assets/icons/arrow.svg", alt: "search", width: 10, height: 10 })))))));
};
exports["default"] = EventCard;
