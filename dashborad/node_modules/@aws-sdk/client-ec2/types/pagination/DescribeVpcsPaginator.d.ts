import { DescribeVpcsCommandInput, DescribeVpcsCommandOutput } from "../commands/DescribeVpcsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVpcs(config: EC2PaginationConfiguration, input: DescribeVpcsCommandInput, ...additionalArguments: any): Paginator<DescribeVpcsCommandOutput>;
