import { GetManagedPrefixListAssociationsCommandInput, GetManagedPrefixListAssociationsCommandOutput } from "../commands/GetManagedPrefixListAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetManagedPrefixListAssociations(config: EC2PaginationConfiguration, input: GetManagedPrefixListAssociationsCommandInput, ...additionalArguments: any): Paginator<GetManagedPrefixListAssociationsCommandOutput>;
