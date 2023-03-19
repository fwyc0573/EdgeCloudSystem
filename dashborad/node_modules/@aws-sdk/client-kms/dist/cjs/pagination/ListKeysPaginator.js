"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListKeys = void 0;
const KMS_1 = require("../KMS");
const KMSClient_1 = require("../KMSClient");
const ListKeysCommand_1 = require("../commands/ListKeysCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new ListKeysCommand_1.ListKeysCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.listKeys(input, ...args);
};
async function* paginateListKeys(config, input, ...additionalArguments) {
    // ToDo: replace with actual type instead of typeof input.Marker
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
        input.Marker = token;
        input["Limit"] = config.pageSize;
        if (config.client instanceof KMS_1.KMS) {
            page = await makePagedRequest(config.client, input, ...additionalArguments);
        }
        else if (config.client instanceof KMSClient_1.KMSClient) {
            page = await makePagedClientRequest(config.client, input, ...additionalArguments);
        }
        else {
            throw new Error("Invalid client, expected KMS | KMSClient");
        }
        yield page;
        token = page.NextMarker;
        hasNext = !!token;
    }
    // @ts-ignore
    return undefined;
}
exports.paginateListKeys = paginateListKeys;
//# sourceMappingURL=ListKeysPaginator.js.map