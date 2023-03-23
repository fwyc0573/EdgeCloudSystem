import { DescribeClientVpnTargetNetworksCommandInput, DescribeClientVpnTargetNetworksCommandOutput } from "../commands/DescribeClientVpnTargetNetworksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeClientVpnTargetNetworks(config: EC2PaginationConfiguration, input: DescribeClientVpnTargetNetworksCommandInput, ...additionalArguments: any): Paginator<DescribeClientVpnTargetNetworksCommandOutput>;
