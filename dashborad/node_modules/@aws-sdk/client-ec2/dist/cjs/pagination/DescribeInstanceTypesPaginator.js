"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateDescribeInstanceTypes = void 0;
const EC2_1 = require("../EC2");
const EC2Client_1 = require("../EC2Client");
const DescribeInstanceTypesCommand_1 = require("../commands/DescribeInstanceTypesCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new DescribeInstanceTypesCommand_1.DescribeInstanceTypesCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.describeInstanceTypes(input, ...args);
};
async function* paginateDescribeInstanceTypes(config, input, ...additionalArguments) {
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
exports.paginateDescribeInstanceTypes = paginateDescribeInstanceTypes;
//# sourceMappingURL=DescribeInstanceTypesPaginator.js.map