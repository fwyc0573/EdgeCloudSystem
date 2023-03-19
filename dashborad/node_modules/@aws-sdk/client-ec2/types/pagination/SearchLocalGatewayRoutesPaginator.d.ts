import { SearchLocalGatewayRoutesCommandInput, SearchLocalGatewayRoutesCommandOutput } from "../commands/SearchLocalGatewayRoutesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateSearchLocalGatewayRoutes(config: EC2PaginationConfiguration, input: SearchLocalGatewayRoutesCommandInput, ...additionalArguments: any): Paginator<SearchLocalGatewayRoutesCommandOutput>;
