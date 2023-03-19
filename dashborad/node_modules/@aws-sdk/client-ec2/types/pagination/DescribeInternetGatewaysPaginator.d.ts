import { DescribeInternetGatewaysCommandInput, DescribeInternetGatewaysCommandOutput } from "../commands/DescribeInternetGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeInternetGateways(config: EC2PaginationConfiguration, input: DescribeInternetGatewaysCommandInput, ...additionalArguments: any): Paginator<DescribeInternetGatewaysCommandOutput>;
