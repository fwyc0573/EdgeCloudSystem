import { DescribeStaleSecurityGroupsCommandInput, DescribeStaleSecurityGroupsCommandOutput } from "../commands/DescribeStaleSecurityGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeStaleSecurityGroups(config: EC2PaginationConfiguration, input: DescribeStaleSecurityGroupsCommandInput, ...additionalArguments: any): Paginator<DescribeStaleSecurityGroupsCommandOutput>;
