"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/customers/page/[page]/page",{

/***/ "(app-pages-browser)/./src/lib/actions.ts":
/*!****************************!*\
  !*** ./src/lib/actions.ts ***!
  \****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCustomer: function() { return /* binding */ createCustomer; },
/* harmony export */   createEstimate: function() { return /* binding */ createEstimate; },
/* harmony export */   deleteCustomer: function() { return /* binding */ deleteCustomer; },
/* harmony export */   getCustomerStats: function() { return /* binding */ getCustomerStats; },
/* harmony export */   getCustomers: function() { return /* binding */ getCustomers; },
/* harmony export */   getDashboardStats: function() { return /* binding */ getDashboardStats; },
/* harmony export */   getEstimateStats: function() { return /* binding */ getEstimateStats; },
/* harmony export */   getEstimates: function() { return /* binding */ getEstimates; },
/* harmony export */   getInquiries: function() { return /* binding */ getInquiries; },
/* harmony export */   getInquiryStats: function() { return /* binding */ getInquiryStats; },
/* harmony export */   getSalesStats: function() { return /* binding */ getSalesStats; },
/* harmony export */   getTransactions: function() { return /* binding */ getTransactions; }
/* harmony export */ });
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/client/app-call-server */ "(app-pages-browser)/./node_modules/next/dist/client/app-call-server.js");
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js");



function __build_action__(action, args) {
  return (0,next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__.callServer)(action.$$id, args)
}

/* __next_internal_action_entry_do_not_use__ {"0f4defeb27ee0e15941425474ded84575dd0659a":"getInquiryStats","1744388a9e5f0342f73d4148b9f0e42a0b07a97b":"getEstimates","18fa1190ebd521b9af11c3758ec5e124d6a8c64a":"getInquiries","46328708d3c1522a3ff60cd955350ae2d3dfb601":"getDashboardStats","673e688f955bcfbc361cd85dcd5425e1ce207eb0":"getEstimateStats","6df5beef1c6fc6dfc492f2f712aa1bfc49dd3a18":"createCustomer","8a878ccd6c036b49b11fcfefe2ae595c96ba4724":"createEstimate","a4fbd362fd6b5918058ac5e32e5cce7fe9fe36da":"deleteCustomer","aba351605f60d9359d0cba066c1150ba6aba1b05":"getSalesStats","af5e79d166aed1b07e9db9cf77b2d3351df0e41c":"getCustomers","d1209867ed373881de34a1fefb5ebe783f20dcf4":"getTransactions","f3f324386db648e2db3fb1a2c885d3cc47b70ab7":"getCustomerStats"} */ var getTransactions = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("d1209867ed373881de34a1fefb5ebe783f20dcf4");

var createCustomer = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("6df5beef1c6fc6dfc492f2f712aa1bfc49dd3a18");
var deleteCustomer = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a4fbd362fd6b5918058ac5e32e5cce7fe9fe36da");
var getCustomers = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("af5e79d166aed1b07e9db9cf77b2d3351df0e41c");
var createEstimate = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("8a878ccd6c036b49b11fcfefe2ae595c96ba4724");
var getEstimates = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("1744388a9e5f0342f73d4148b9f0e42a0b07a97b");
var getInquiries = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("18fa1190ebd521b9af11c3758ec5e124d6a8c64a");
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