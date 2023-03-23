import { DescribeVpcEndpointServiceConfigurationsCommandInput, DescribeVpcEndpointServiceConfigurationsCommandOutput } from "../commands/DescribeVpcEndpointServiceConfigurationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeVpcEndpointServiceConfigurations(config: EC2PaginationConfiguration, input: DescribeVpcEndpointServiceConfigurationsCommandInput, ...additionalArguments: any): Paginator<DescribeVpcEndpointServiceConfigurationsCommandOutput>;
