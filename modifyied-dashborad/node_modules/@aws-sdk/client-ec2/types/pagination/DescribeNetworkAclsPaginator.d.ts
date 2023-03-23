import { DescribeNetworkAclsCommandInput, DescribeNetworkAclsCommandOutput } from "../commands/DescribeNetworkAclsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeNetworkAcls(config: EC2PaginationConfiguration, input: DescribeNetworkAclsCommandInput, ...additionalArguments: any): Paginator<DescribeNetworkAclsCommandOutput>;
