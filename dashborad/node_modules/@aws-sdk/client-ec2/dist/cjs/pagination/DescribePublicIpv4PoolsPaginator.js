"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateDescribePublicIpv4Pools = void 0;
const EC2_1 = require("../EC2");
const EC2Client_1 = require("../EC2Client");
const DescribePublicIpv4PoolsCommand_1 = require("../commands/DescribePublicIpv4PoolsCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new DescribePublicIpv4PoolsCommand_1.DescribePublicIpv4PoolsCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.describePublicIpv4Pools(input, ...args);
};
async function* paginateDescribePublicIpv4Pools(config, input, ...additionalArguments) {
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
exports.paginateDescribePublicIpv4Pools = paginateDescribePublicIpv4Pools;
//# sourceMappingURL=DescribePublicIpv4PoolsPaginator.js.map