"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'peopledatalabs/5.0 (api/6.1.3)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * /person/enrich
     *
     */
    SDK.prototype.getV5PersonEnrich = function (metadata) {
        return this.core.fetch('/v5/person/enrich', 'get', metadata);
    };
    /**
     * /person/identify
     *
     */
    SDK.prototype.getV5PersonIdentify = function (metadata) {
        return this.core.fetch('/v5/person/identify', 'get', metadata);
    };
    /**
     * /person/search
     *
     */
    SDK.prototype.getV5PersonSearch = function (metadata) {
        return this.core.fetch('/v5/person/search', 'get', metadata);
    };
    /**
     * /person/search
     *
     */
    SDK.prototype.postV5PersonSearch = function (body) {
        return this.core.fetch('/v5/person/search', 'post', body);
    };
    /**
     * /person/retrieve
     *
     */
    SDK.prototype.getV5PersonRetrievePerson_id = function (metadata) {
        return this.core.fetch('/v5/person/retrieve/{person_id}', 'get', metadata);
    };
    /**
     * /person/retrieve/bulk
     *
     */
    SDK.prototype.postV5PersonRetrieveBulk = function (body, metadata) {
        return this.core.fetch('/v5/person/retrieve/bulk', 'post', body, metadata);
    };
    /**
     * /company/clean
     *
     */
    SDK.prototype.getV5CompanyClean = function (metadata) {
        return this.core.fetch('/v5/company/clean', 'get', metadata);
    };
    /**
     * /company/clean
     *
     */
    SDK.prototype.postV5CompanyClean = function (body) {
        return this.core.fetch('/v5/company/clean', 'post', body);
    };
    /**
     * /school/clean
     *
     */
    SDK.prototype.getV5SchoolClean = function (metadata) {
        return this.core.fetch('/v5/school/clean', 'get', metadata);
    };
    /**
     * /school/clean
     *
     */
    SDK.prototype.postV5SchoolClean = function (body) {
        return this.core.fetch('/v5/school/clean', 'post', body);
    };
    /**
     * /location/clean
     *
     */
    SDK.prototype.getV5LocationClean = function (metadata) {
        return this.core.fetch('/v5/location/clean', 'get', metadata);
    };
    /**
     * /location/clean
     *
     */
    SDK.prototype.postV5LocationClean = function (body) {
        return this.core.fetch('/v5/location/clean', 'post', body);
    };
    /**
     * /company/enrich
     *
     */
    SDK.prototype.getV5CompanyEnrich = function (metadata) {
        return this.core.fetch('/v5/company/enrich', 'get', metadata);
    };
    /**
     * /company/search
     *
     */
    SDK.prototype.getV5CompanySearch = function (metadata) {
        return this.core.fetch('/v5/company/search', 'get', metadata);
    };
    /**
     * /company/search
     *
     */
    SDK.prototype.postV5CompanySearch = function (body) {
        return this.core.fetch('/v5/company/search', 'post', body);
    };
    /**
     * Autocompletes a limited amount of fields.
     *
     * @summary /autocomplete
     */
    SDK.prototype.getV5Autocomplete = function (metadata) {
        return this.core.fetch('/v5/autocomplete', 'get', metadata);
    };
    /**
     * /autocomplete
     *
     */
    SDK.prototype.postV5Autocomplete = function (body) {
        return this.core.fetch('/v5/autocomplete', 'post', body);
    };
    /**
     * /ip/enrich
     *
     */
    SDK.prototype.getV5IpEnrich = function (metadata) {
        return this.core.fetch('/v5/ip/enrich', 'get', metadata);
    };
    /**
     * /job_title/enrich
     *
     */
    SDK.prototype.getV5Job_titleEnrich = function (metadata) {
        return this.core.fetch('/v5/job_title/enrich', 'get', metadata);
    };
    /**
     * /job_title/enrich
     *
     */
    SDK.prototype.postV5Job_titleEnrich = function (body) {
        return this.core.fetch('/v5/job_title/enrich', 'post', body);
    };
    /**
     * /skill/enrich
     *
     */
    SDK.prototype.getV5SkillEnrich = function (metadata) {
        return this.core.fetch('/v5/skill/enrich', 'get', metadata);
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;
