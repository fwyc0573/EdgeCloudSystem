import { DescribeInstancesCommandInput, DescribeInstancesCommandOutput } from "../commands/DescribeInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeInstances(config: EC2PaginationConfiguration, input: DescribeInstancesCommandInput, ...additionalArguments: any): Paginator<DescribeInstancesCommandOutput>;
