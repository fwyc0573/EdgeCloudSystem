import { DescribeClientVpnEndpointsCommandInput, DescribeClientVpnEndpointsCommandOutput } from "../commands/DescribeClientVpnEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeClientVpnEndpoints(config: EC2PaginationConfiguration, input: DescribeClientVpnEndpointsCommandInput, ...additionalArguments: any): Paginator<DescribeClientVpnEndpointsCommandOutput>;
