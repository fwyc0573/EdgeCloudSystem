import { ListAliasesCommandInput, ListAliasesCommandOutput } from "../commands/ListAliasesCommand";
import { KMSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListAliases(config: KMSPaginationConfiguration, input: ListAliasesCommandInput, ...additionalArguments: any): Paginator<ListAliasesCommandOutput>;
