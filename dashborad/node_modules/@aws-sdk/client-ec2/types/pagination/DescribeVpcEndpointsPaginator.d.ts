import { DescribeVpcEndpointsCommandInput, DescribeVpcEndpointsCommandOutput } from "../commands/DescribeVpcEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVpcEndpoints(config: EC2PaginationConfiguration, input: DescribeVpcEndpointsCommandInput, ...additionalArguments: any): Paginator<DescribeVpcEndpointsCommandOutput>;
