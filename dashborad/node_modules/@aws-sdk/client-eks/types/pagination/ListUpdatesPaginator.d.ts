import { ListUpdatesCommandInput, ListUpdatesCommandOutput } from "../commands/ListUpdatesCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListUpdates(config: EKSPaginationConfiguration, input: ListUpdatesCommandInput, ...additionalArguments: any): Paginator<ListUpdatesCommandOutput>;
