import { DescribeTransitGatewayConnectPeersCommandInput, DescribeTransitGatewayConnectPeersCommandOutput } from "../commands/DescribeTransitGatewayConnectPeersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayConnectPeers(config: EC2PaginationConfiguration, input: DescribeTransitGatewayConnectPeersCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayConnectPeersCommandOutput>;
