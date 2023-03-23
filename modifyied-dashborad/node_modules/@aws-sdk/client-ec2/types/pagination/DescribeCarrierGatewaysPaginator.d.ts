import { DescribeCarrierGatewaysCommandInput, DescribeCarrierGatewaysCommandOutput } from "../commands/DescribeCarrierGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeCarrierGateways(config: EC2PaginationConfiguration, input: DescribeCarrierGatewaysCommandInput, ...additionalArguments: any): Paginator<DescribeCarrierGatewaysCommandOutput>;
