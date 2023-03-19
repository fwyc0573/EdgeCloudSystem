import { GetTransitGatewayRouteTableAssociationsCommandInput, GetTransitGatewayRouteTableAssociationsCommandOutput } from "../commands/GetTransitGatewayRouteTableAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetTransitGatewayRouteTableAssociations(config: EC2PaginationConfiguration, input: GetTransitGatewayRouteTableAssociationsCommandInput, ...additionalArguments: any): Paginator<GetTransitGatewayRouteTableAssociationsCommandOutput>;
