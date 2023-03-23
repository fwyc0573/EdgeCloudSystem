import { ListNodegroupsCommandInput, ListNodegroupsCommandOutput } from "../commands/ListNodegroupsCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListNodegroups(config: EKSPaginationConfiguration, input: ListNodegroupsCommandInput, ...additionalArguments: any): Paginator<ListNodegroupsCommandOutput>;
