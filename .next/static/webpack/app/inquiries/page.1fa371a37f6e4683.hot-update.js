"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/inquiries/page",{

/***/ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js ***!
  \**************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval(__webpack_require__.ts("// This file must be bundled in the app's client layer, it shouldn't be directly\n// imported by the server.\n\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nObject.defineProperty(exports, \"createServerReference\", ({\n    enumerable: true,\n    get: function() {\n        return createServerReference;\n    }\n}));\nconst _appcallserver = __webpack_require__(/*! next/dist/client/app-call-server */ \"(app-pages-browser)/./node_modules/next/dist/client/app-call-server.js\");\nfunction createServerReference(id) {\n    // Since we're using the Edge build of Flight client for SSR [1], here we need to\n    // also use the same Edge build to create the reference. For the client bundle,\n    // we use the default and let Webpack to resolve it to the correct version.\n    // 1: https://github.com/vercel/next.js/blob/16eb80b0b0be13f04a6407943664b5efd8f3d7d0/packages/next/src/server/app-render/use-flight-response.tsx#L24-L26\n    const { createServerReference: createServerReferenceImpl } =  false ? 0 : __webpack_require__(/*! react-server-dom-webpack/client */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react-server-dom-webpack/client.js\");\n    return createServerReferenceImpl(id, _appcallserver.callServer);\n} //# sourceMappingURL=action-client-wrapper.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtZmxpZ2h0LWxvYWRlci9hY3Rpb24tY2xpZW50LXdyYXBwZXIuanMiLCJtYXBwaW5ncyI6IkFBQUEsZ0ZBQWdGO0FBQ2hGLDBCQUEwQjtBQUNiO0FBQ2JBLDhDQUE2QztJQUN6Q0csT0FBTztBQUNYLENBQUMsRUFBQztBQUNGSCx5REFBd0Q7SUFDcERJLFlBQVk7SUFDWkMsS0FBSztRQUNELE9BQU9DO0lBQ1g7QUFDSixDQUFDLEVBQUM7QUFDRixNQUFNQyxpQkFBaUJDLG1CQUFPQSxDQUFDLGdIQUFrQztBQUNqRSxTQUFTRixzQkFBc0JHLEVBQUU7SUFDN0IsaUZBQWlGO0lBQ2pGLCtFQUErRTtJQUMvRSwyRUFBMkU7SUFDM0UseUpBQXlKO0lBQ3pKLE1BQU0sRUFBRUgsdUJBQXVCSSx5QkFBeUIsRUFBRSxHQUFHLE1BQTBCLEdBQUdGLENBQStDLEdBQUdBLG1CQUFPQSxDQUFDLGlJQUFpQztJQUNyTCxPQUFPRSwwQkFBMEJELElBQUlGLGVBQWVPLFVBQVU7QUFDbEUsRUFFQSxpREFBaUQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1mbGlnaHQtbG9hZGVyL2FjdGlvbi1jbGllbnQtd3JhcHBlci5qcz9hZGEwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSBtdXN0IGJlIGJ1bmRsZWQgaW4gdGhlIGFwcCdzIGNsaWVudCBsYXllciwgaXQgc2hvdWxkbid0IGJlIGRpcmVjdGx5XG4vLyBpbXBvcnRlZCBieSB0aGUgc2VydmVyLlxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJjcmVhdGVTZXJ2ZXJSZWZlcmVuY2VcIiwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVNlcnZlclJlZmVyZW5jZTtcbiAgICB9XG59KTtcbmNvbnN0IF9hcHBjYWxsc2VydmVyID0gcmVxdWlyZShcIm5leHQvZGlzdC9jbGllbnQvYXBwLWNhbGwtc2VydmVyXCIpO1xuZnVuY3Rpb24gY3JlYXRlU2VydmVyUmVmZXJlbmNlKGlkKSB7XG4gICAgLy8gU2luY2Ugd2UncmUgdXNpbmcgdGhlIEVkZ2UgYnVpbGQgb2YgRmxpZ2h0IGNsaWVudCBmb3IgU1NSIFsxXSwgaGVyZSB3ZSBuZWVkIHRvXG4gICAgLy8gYWxzbyB1c2UgdGhlIHNhbWUgRWRnZSBidWlsZCB0byBjcmVhdGUgdGhlIHJlZmVyZW5jZS4gRm9yIHRoZSBjbGllbnQgYnVuZGxlLFxuICAgIC8vIHdlIHVzZSB0aGUgZGVmYXVsdCBhbmQgbGV0IFdlYnBhY2sgdG8gcmVzb2x2ZSBpdCB0byB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIC8vIDE6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZXJjZWwvbmV4dC5qcy9ibG9iLzE2ZWI4MGIwYjBiZTEzZjA0YTY0MDc5NDM2NjRiNWVmZDhmM2Q3ZDAvcGFja2FnZXMvbmV4dC9zcmMvc2VydmVyL2FwcC1yZW5kZXIvdXNlLWZsaWdodC1yZXNwb25zZS50c3gjTDI0LUwyNlxuICAgIGNvbnN0IHsgY3JlYXRlU2VydmVyUmVmZXJlbmNlOiBjcmVhdGVTZXJ2ZXJSZWZlcmVuY2VJbXBsIH0gPSAhIXByb2Nlc3MuZW52Lk5FWFRfUlVOVElNRSA/IHJlcXVpcmUoXCJyZWFjdC1zZXJ2ZXItZG9tLXdlYnBhY2svY2xpZW50LmVkZ2VcIikgOiByZXF1aXJlKFwicmVhY3Qtc2VydmVyLWRvbS13ZWJwYWNrL2NsaWVudFwiKTtcbiAgICByZXR1cm4gY3JlYXRlU2VydmVyUmVmZXJlbmNlSW1wbChpZCwgX2FwcGNhbGxzZXJ2ZXIuY2FsbFNlcnZlcik7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFjdGlvbi1jbGllbnQtd3JhcHBlci5qcy5tYXAiXSwibmFtZXMiOlsiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJleHBvcnRzIiwidmFsdWUiLCJlbnVtZXJhYmxlIiwiZ2V0IiwiY3JlYXRlU2VydmVyUmVmZXJlbmNlIiwiX2FwcGNhbGxzZXJ2ZXIiLCJyZXF1aXJlIiwiaWQiLCJjcmVhdGVTZXJ2ZXJSZWZlcmVuY2VJbXBsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUlVOVElNRSIsImNhbGxTZXJ2ZXIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js\n"));

/***/ }),

/***/ "(app-pages-browser)/./src/lib/actions.ts":
/*!****************************!*\
  !*** ./src/lib/actions.ts ***!
  \****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCustomer: function() { return /* binding */ createCustomer; },
/* harmony export */   createEstimate: function() { return /* binding */ createEstimate; },
/* harmony export */   getCustomerStats: function() { return /* binding */ getCustomerStats; },
/* harmony export */   getCustomers: function() { return /* binding */ getCustomers; },
/* harmony export */   getDailyStats: function() { return /* binding */ getDailyStats; },
/* harmony export */   getDashboardStats: function() { return /* binding */ getDashboardStats; },
/* harmony export */   getEstimateStats: function() { return /* binding */ getEstimateStats; },
/* harmony export */   getEstimates: function() { return /* binding */ getEstimates; },
/* harmony export */   getInquiries: function() { return /* binding */ getInquiries; },
/* harmony export */   getInquiryStats: function() { return /* binding */ getInquiryStats; },
/* harmony export */   getSalesStats: function() { return /* binding */ getSalesStats; },
/* harmony export */   getTransactions: function() { return /* binding */ getTransactions; },
/* harmony export */   syncAllStats: function() { return /* binding */ syncAllStats; }
/* harmony export */ });
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/client/app-call-server */ "(app-pages-browser)/./node_modules/next/dist/client/app-call-server.js");
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js");



function __build_action__(action, args) {
  return (0,next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__.callServer)(action.$$id, args)
}

/* __next_internal_action_entry_do_not_use__ {"0f4defeb27ee0e15941425474ded84575dd0659a":"getInquiryStats","1744388a9e5f0342f73d4148b9f0e42a0b07a97b":"getEstimates","18fa1190ebd521b9af11c3758ec5e124d6a8c64a":"getInquiries","30a55eb45f4f7899baf56c60a01c8104e02196a4":"syncAllStats","46328708d3c1522a3ff60cd955350ae2d3dfb601":"getDashboardStats","673e688f955bcfbc361cd85dcd5425e1ce207eb0":"getEstimateStats","6df5beef1c6fc6dfc492f2f712aa1bfc49dd3a18":"createCustomer","8a878ccd6c036b49b11fcfefe2ae595c96ba4724":"createEstimate","aba351605f60d9359d0cba066c1150ba6aba1b05":"getSalesStats","af5e79d166aed1b07e9db9cf77b2d3351df0e41c":"getCustomers","d1209867ed373881de34a1fefb5ebe783f20dcf4":"getTransactions","e21fc2f07ad5c776a0bf9f8150c94bb22fc5aa70":"getDailyStats","f3f324386db648e2db3fb1a2c885d3cc47b70ab7":"getCustomerStats"} */ var syncAllStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("30a55eb45f4f7899baf56c60a01c8104e02196a4");

var createCustomer = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("6df5beef1c6fc6dfc492f2f712aa1bfc49dd3a18");
var createEstimate = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("8a878ccd6c036b49b11fcfefe2ae595c96ba4724");
var getCustomers = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("af5e79d166aed1b07e9db9cf77b2d3351df0e41c");
var getInquiries = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("18fa1190ebd521b9af11c3758ec5e124d6a8c64a");
var getEstimates = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("1744388a9e5f0342f73d4148b9f0e42a0b07a97b");
var getTransactions = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("d1209867ed373881de34a1fefb5ebe783f20dcf4");
var getDailyStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("e21fc2f07ad5c776a0bf9f8150c94bb22fc5aa70");
var getDashboardStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("46328708d3c1522a3ff60cd955350ae2d3dfb601");
var getCustomerStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("f3f324386db648e2db3fb1a2c885d3cc47b70ab7");
var getInquiryStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("0f4defeb27ee0e15941425474ded84575dd0659a");
var getEstimateStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("673e688f955bcfbc361cd85dcd5425e1ce207eb0");
var getSalesStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("aba351605f60d9359d0cba066c1150ba6aba1b05");



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ })

});