import { ListAddonsCommandInput, ListAddonsCommandOutput } from "../commands/ListAddonsCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListAddons(config: EKSPaginationConfiguration, input: ListAddonsCommandInput, ...additionalArguments: any): Paginator<ListAddonsCommandOutput>;
