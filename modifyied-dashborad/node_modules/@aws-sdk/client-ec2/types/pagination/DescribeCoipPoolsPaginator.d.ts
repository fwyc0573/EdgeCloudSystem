import { DescribeCoipPoolsCommandInput, DescribeCoipPoolsCommandOutput } from "../commands/DescribeCoipPoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeCoipPools(config: EC2PaginationConfiguration, input: DescribeCoipPoolsCommandInput, ...additionalArguments: any): Paginator<DescribeCoipPoolsCommandOutput>;
