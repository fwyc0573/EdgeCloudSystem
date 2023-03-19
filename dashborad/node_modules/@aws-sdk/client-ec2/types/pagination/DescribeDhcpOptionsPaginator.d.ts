import { DescribeDhcpOptionsCommandInput, DescribeDhcpOptionsCommandOutput } from "../commands/DescribeDhcpOptionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeDhcpOptions(config: EC2PaginationConfiguration, input: DescribeDhcpOptionsCommandInput, ...additionalArguments: any): Paginator<DescribeDhcpOptionsCommandOutput>;
