import { DescribeTransitGatewayRouteTablesCommandInput, DescribeTransitGatewayRouteTablesCommandOutput } from "../commands/DescribeTransitGatewayRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayRouteTables(config: EC2PaginationConfiguration, input: DescribeTransitGatewayRouteTablesCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayRouteTablesCommandOutput>;
