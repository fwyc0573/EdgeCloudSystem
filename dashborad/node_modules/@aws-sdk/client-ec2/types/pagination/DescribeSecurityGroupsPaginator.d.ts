import { DescribeSecurityGroupsCommandInput, DescribeSecurityGroupsCommandOutput } from "../commands/DescribeSecurityGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeSecurityGroups(config: EC2PaginationConfiguration, input: DescribeSecurityGroupsCommandInput, ...additionalArguments: any): Paginator<DescribeSecurityGroupsCommandOutput>;
