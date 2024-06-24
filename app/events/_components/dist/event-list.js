"use strict";
// app/events/_components/event-list.tsx
exports.__esModule = true;
var react_1 = require("react");
var event_card_1 = require("./event-card");
var Pagination_1 = require("@/components/shared/Pagination");
var EventList = function (_a) {
    var data = _a.data, emptyTitle = _a.emptyTitle, emptyStateSubtext = _a.emptyStateSubtext, page = _a.page, totalPages = _a.totalPages, collectionType = _a.collectionType, urlParamName = _a.urlParamName;
    return (react_1["default"].createElement(react_1["default"].Fragment, null, data.length > 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center gap-10" },
        react_1["default"].createElement("ul", { className: "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10" }, data.map(function (event) {
            var hasOrderLink = collectionType === 'Events_Organized';
            var hidePrice = collectionType === 'My_Tickets';
            return (react_1["default"].createElement("li", { key: event.id, className: "flex justify-center" },
                react_1["default"].createElement(event_card_1["default"], { event: event, hasOrderLink: hasOrderLink, hidePrice: hidePrice })));
        })),
        totalPages > 1 && (react_1["default"].createElement(Pagination_1["default"], { urlParamName: urlParamName, page: page, totalPages: totalPages })))) : (react_1["default"].createElement("div", { className: "flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center" },
        react_1["default"].createElement("h3", { className: "p-bold-20 md:h5-bold" }, emptyTitle),
        react_1["default"].createElement("p", { className: "p-regular-14" }, emptyStateSubtext)))));
};
exports["default"] = EventList;
