import { ListKeysCommandInput, ListKeysCommandOutput } from "../commands/ListKeysCommand";
import { KMSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListKeys(config: KMSPaginationConfiguration, input: ListKeysCommandInput, ...additionalArguments: any): Paginator<ListKeysCommandOutput>;
