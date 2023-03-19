import { DescribeSpotPriceHistoryCommandInput, DescribeSpotPriceHistoryCommandOutput } from "../commands/DescribeSpotPriceHistoryCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeSpotPriceHistory(config: EC2PaginationConfiguration, input: DescribeSpotPriceHistoryCommandInput, ...additionalArguments: any): Paginator<DescribeSpotPriceHistoryCommandOutput>;
