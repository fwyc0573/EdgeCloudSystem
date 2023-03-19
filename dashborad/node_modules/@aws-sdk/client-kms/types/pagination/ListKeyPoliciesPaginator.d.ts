import { ListKeyPoliciesCommandInput, ListKeyPoliciesCommandOutput } from "../commands/ListKeyPoliciesCommand";
import { KMSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListKeyPolicies(config: KMSPaginationConfiguration, input: ListKeyPoliciesCommandInput, ...additionalArguments: any): Paginator<ListKeyPoliciesCommandOutput>;
