import { DescribeTransitGatewayMulticastDomainsCommandInput, DescribeTransitGatewayMulticastDomainsCommandOutput } from "../commands/DescribeTransitGatewayMulticastDomainsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayMulticastDomains(config: EC2PaginationConfiguration, input: DescribeTransitGatewayMulticastDomainsCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayMulticastDomainsCommandOutput>;
