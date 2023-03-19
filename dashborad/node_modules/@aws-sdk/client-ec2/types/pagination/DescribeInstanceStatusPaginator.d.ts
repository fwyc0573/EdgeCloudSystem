import { DescribeInstanceStatusCommandInput, DescribeInstanceStatusCommandOutput } from "../commands/DescribeInstanceStatusCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeInstanceStatus(config: EC2PaginationConfiguration, input: DescribeInstanceStatusCommandInput, ...additionalArguments: any): Paginator<DescribeInstanceStatusCommandOutput>;
