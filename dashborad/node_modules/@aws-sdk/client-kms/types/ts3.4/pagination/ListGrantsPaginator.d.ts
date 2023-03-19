import { ListGrantsCommandInput, ListGrantsCommandOutput } from "../commands/ListGrantsCommand";
import { KMSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListGrants(config: KMSPaginationConfiguration, input: ListGrantsCommandInput, ...additionalArguments: any): Paginator<ListGrantsCommandOutput>;
