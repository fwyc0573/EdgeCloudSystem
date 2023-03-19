import { DescribeNatGatewaysCommandInput, DescribeNatGatewaysCommandOutput } from "../commands/DescribeNatGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeNatGateways(config: EC2PaginationConfiguration, input: DescribeNatGatewaysCommandInput, ...additionalArguments: any): Paginator<DescribeNatGatewaysCommandOutput>;
