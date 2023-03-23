import { DescribeLocalGatewaysCommandInput, DescribeLocalGatewaysCommandOutput } from "../commands/DescribeLocalGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeLocalGateways(config: EC2PaginationConfiguration, input: DescribeLocalGatewaysCommandInput, ...additionalArguments: any): Paginator<DescribeLocalGatewaysCommandOutput>;
