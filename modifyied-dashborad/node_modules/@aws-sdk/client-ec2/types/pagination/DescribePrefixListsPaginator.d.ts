import { DescribePrefixListsCommandInput, DescribePrefixListsCommandOutput } from "../commands/DescribePrefixListsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribePrefixLists(config: EC2PaginationConfiguration, input: DescribePrefixListsCommandInput, ...additionalArguments: any): Paginator<DescribePrefixListsCommandOutput>;
