import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
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
    auth(...values: string[] | number[]): this;
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
    server(url: string, variables?: {}): void;
    /**
     * /person/enrich
     *
     */
    getV5PersonEnrich(metadata?: types.GetV5PersonEnrichMetadataParam): Promise<FetchResponse<200, types.GetV5PersonEnrichResponse200>>;
    /**
     * /person/identify
     *
     */
    getV5PersonIdentify(metadata?: types.GetV5PersonIdentifyMetadataParam): Promise<FetchResponse<200, types.GetV5PersonIdentifyResponse200>>;
    /**
     * /person/search
     *
     */
    getV5PersonSearch(metadata?: types.GetV5PersonSearchMetadataParam): Promise<FetchResponse<200, types.GetV5PersonSearchResponse200>>;
    /**
     * /person/search
     *
     */
    postV5PersonSearch(body: types.PostV5PersonSearchBodyParam): Promise<FetchResponse<200, types.PostV5PersonSearchResponse200>>;
    /**
     * /person/retrieve
     *
     */
    getV5PersonRetrievePerson_id(metadata: types.GetV5PersonRetrievePersonIdMetadataParam): Promise<FetchResponse<200, types.GetV5PersonRetrievePersonIdResponse200>>;
    /**
     * /person/retrieve/bulk
     *
     */
    postV5PersonRetrieveBulk(body?: types.PostV5PersonRetrieveBulkBodyParam, metadata?: types.PostV5PersonRetrieveBulkMetadataParam): Promise<FetchResponse<200, types.PostV5PersonRetrieveBulkResponse200>>;
    /**
     * /company/clean
     *
     */
    getV5CompanyClean(metadata?: types.GetV5CompanyCleanMetadataParam): Promise<FetchResponse<200, types.GetV5CompanyCleanResponse200>>;
    /**
     * /company/clean
     *
     */
    postV5CompanyClean(body: types.PostV5CompanyCleanBodyParam): Promise<FetchResponse<200, types.PostV5CompanyCleanResponse200>>;
    /**
     * /school/clean
     *
     */
    getV5SchoolClean(metadata?: types.GetV5SchoolCleanMetadataParam): Promise<FetchResponse<200, types.GetV5SchoolCleanResponse200>>;
    /**
     * /school/clean
     *
     */
    postV5SchoolClean(body: types.PostV5SchoolCleanBodyParam): Promise<FetchResponse<200, types.PostV5SchoolCleanResponse200>>;
    /**
     * /location/clean
     *
     */
    getV5LocationClean(metadata: types.GetV5LocationCleanMetadataParam): Promise<FetchResponse<200, types.GetV5LocationCleanResponse200>>;
    /**
     * /location/clean
     *
     */
    postV5LocationClean(body: types.PostV5LocationCleanBodyParam): Promise<FetchResponse<200, types.PostV5LocationCleanResponse200>>;
    /**
     * /company/enrich
     *
     */
    getV5CompanyEnrich(metadata?: types.GetV5CompanyEnrichMetadataParam): Promise<FetchResponse<200, types.GetV5CompanyEnrichResponse200>>;
    /**
     * /company/search
     *
     */
    getV5CompanySearch(metadata?: types.GetV5CompanySearchMetadataParam): Promise<FetchResponse<200, types.GetV5CompanySearchResponse200>>;
    /**
     * /company/search
     *
     */
    postV5CompanySearch(body: types.PostV5CompanySearchBodyParam): Promise<FetchResponse<200, types.PostV5CompanySearchResponse200>>;
    /**
     * Autocompletes a limited amount of fields.
     *
     * @summary /autocomplete
     */
    getV5Autocomplete(metadata: types.GetV5AutocompleteMetadataParam): Promise<FetchResponse<number, unknown>>;
    /**
     * /autocomplete
     *
     */
    postV5Autocomplete(body: types.PostV5AutocompleteBodyParam): Promise<FetchResponse<number, unknown>>;
    /**
     * /ip/enrich
     *
     */
    getV5IpEnrich(metadata: types.GetV5IpEnrichMetadataParam): Promise<FetchResponse<200, types.GetV5IpEnrichResponse200>>;
    /**
     * /job_title/enrich
     *
     */
    getV5Job_titleEnrich(metadata: types.GetV5JobTitleEnrichMetadataParam): Promise<FetchResponse<200, types.GetV5JobTitleEnrichResponse200>>;
    /**
     * /job_title/enrich
     *
     */
    postV5Job_titleEnrich(body: types.PostV5JobTitleEnrichBodyParam): Promise<FetchResponse<200, types.PostV5JobTitleEnrichResponse200>>;
    /**
     * /skill/enrich
     *
     */
    getV5SkillEnrich(metadata: types.GetV5SkillEnrichMetadataParam): Promise<FetchResponse<200, types.GetV5SkillEnrichResponse200>>;
}
declare const createSDK: SDK;
export = createSDK;
