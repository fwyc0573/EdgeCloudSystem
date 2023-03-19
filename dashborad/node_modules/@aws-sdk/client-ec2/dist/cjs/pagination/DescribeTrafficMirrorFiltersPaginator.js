"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateDescribeTrafficMirrorFilters = void 0;
const EC2_1 = require("../EC2");
const EC2Client_1 = require("../EC2Client");
const DescribeTrafficMirrorFiltersCommand_1 = require("../commands/DescribeTrafficMirrorFiltersCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new DescribeTrafficMirrorFiltersCommand_1.DescribeTrafficMirrorFiltersCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.describeTrafficMirrorFilters(input, ...args);
};
async function* paginateDescribeTrafficMirrorFilters(config, input, ...additionalArguments) {
    // ToDo: replace with actual type instead of typeof input.NextToken
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
        input.NextToken = token;
        input["MaxResults"] = config.pageSize;
        if (config.client instanceof EC2_1.EC2) {
            page = await makePagedRequest(config.client, input, ...additionalArguments);
        }
        else if (config.client instanceof EC2Client_1.EC2Client) {
            page = await makePagedClientRequest(config.client, input, ...additionalArguments);
        }
        else {
            throw new Error("Invalid client, expected EC2 | EC2Client");
        }
        yield page;
        token = page.NextToken;
        hasNext = !!token;
    }
    // @ts-ignore
    return undefined;
}
exports.paginateDescribeTrafficMirrorFilters = paginateDescribeTrafficMirrorFilters;
//# sourceMappingURL=DescribeTrafficMirrorFiltersPaginator.js.map