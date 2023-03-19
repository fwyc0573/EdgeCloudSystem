import { DescribeFleetsCommandInput, DescribeFleetsCommandOutput } from "../commands/DescribeFleetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeFleets(config: EC2PaginationConfiguration, input: DescribeFleetsCommandInput, ...additionalArguments: any): Paginator<DescribeFleetsCommandOutput>;
