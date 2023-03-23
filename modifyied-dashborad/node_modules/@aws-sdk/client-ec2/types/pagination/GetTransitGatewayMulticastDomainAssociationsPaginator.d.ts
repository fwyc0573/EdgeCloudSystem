import { GetTransitGatewayMulticastDomainAssociationsCommandInput, GetTransitGatewayMulticastDomainAssociationsCommandOutput } from "../commands/GetTransitGatewayMulticastDomainAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetTransitGatewayMulticastDomainAssociations(config: EC2PaginationConfiguration, input: GetTransitGatewayMulticastDomainAssociationsCommandInput, ...additionalArguments: any): Paginator<GetTransitGatewayMulticastDomainAssociationsCommandOutput>;
