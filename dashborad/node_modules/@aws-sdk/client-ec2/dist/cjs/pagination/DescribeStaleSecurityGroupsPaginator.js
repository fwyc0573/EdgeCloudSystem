"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateDescribeStaleSecurityGroups = void 0;
const EC2_1 = require("../EC2");
const EC2Client_1 = require("../EC2Client");
const DescribeStaleSecurityGroupsCommand_1 = require("../commands/DescribeStaleSecurityGroupsCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new DescribeStaleSecurityGroupsCommand_1.DescribeStaleSecurityGroupsCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.describeStaleSecurityGroups(input, ...args);
};
async function* paginateDescribeStaleSecurityGroups(config, input, ...additionalArguments) {
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
exports.paginateDescribeStaleSecurityGroups = paginateDescribeStaleSecurityGroups;
//# sourceMappingURL=DescribeStaleSecurityGroupsPaginator.js.map