import { ListFargateProfilesCommandInput, ListFargateProfilesCommandOutput } from "../commands/ListFargateProfilesCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListFargateProfiles(config: EKSPaginationConfiguration, input: ListFargateProfilesCommandInput, ...additionalArguments: any): Paginator<ListFargateProfilesCommandOutput>;
