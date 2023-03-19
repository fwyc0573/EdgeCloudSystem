import { GetManagedPrefixListEntriesCommandInput, GetManagedPrefixListEntriesCommandOutput } from "../commands/GetManagedPrefixListEntriesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetManagedPrefixListEntries(config: EC2PaginationConfiguration, input: GetManagedPrefixListEntriesCommandInput, ...additionalArguments: any): Paginator<GetManagedPrefixListEntriesCommandOutput>;
