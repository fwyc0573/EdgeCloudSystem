import { DescribeLocalGatewayRouteTablesCommandInput, DescribeLocalGatewayRouteTablesCommandOutput } from "../commands/DescribeLocalGatewayRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeLocalGatewayRouteTables(config: EC2PaginationConfiguration, input: DescribeLocalGatewayRouteTablesCommandInput, ...additionalArguments: any): Paginator<DescribeLocalGatewayRouteTablesCommandOutput>;
