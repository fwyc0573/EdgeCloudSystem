import { DescribeClassicLinkInstancesCommandInput, DescribeClassicLinkInstancesCommandOutput } from "../commands/DescribeClassicLinkInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeClassicLinkInstances(config: EC2PaginationConfiguration, input: DescribeClassicLinkInstancesCommandInput, ...additionalArguments: any): Paginator<DescribeClassicLinkInstancesCommandOutput>;
