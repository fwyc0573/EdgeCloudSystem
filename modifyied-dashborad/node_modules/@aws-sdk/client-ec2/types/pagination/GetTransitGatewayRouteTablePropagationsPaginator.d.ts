import { GetTransitGatewayRouteTablePropagationsCommandInput, GetTransitGatewayRouteTablePropagationsCommandOutput } from "../commands/GetTransitGatewayRouteTablePropagationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetTransitGatewayRouteTablePropagations(config: EC2PaginationConfiguration, input: GetTransitGatewayRouteTablePropagationsCommandInput, ...additionalArguments: any): Paginator<GetTransitGatewayRouteTablePropagationsCommandOutput>;
