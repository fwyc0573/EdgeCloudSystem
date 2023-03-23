import { DescribeNetworkInsightsAnalysesCommandInput, DescribeNetworkInsightsAnalysesCommandOutput } from "../commands/DescribeNetworkInsightsAnalysesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeNetworkInsightsAnalyses(config: EC2PaginationConfiguration, input: DescribeNetworkInsightsAnalysesCommandInput, ...additionalArguments: any): Paginator<DescribeNetworkInsightsAnalysesCommandOutput>;
