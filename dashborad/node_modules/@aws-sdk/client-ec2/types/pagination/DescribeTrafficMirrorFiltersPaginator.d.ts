import { DescribeTrafficMirrorFiltersCommandInput, DescribeTrafficMirrorFiltersCommandOutput } from "../commands/DescribeTrafficMirrorFiltersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTrafficMirrorFilters(config: EC2PaginationConfiguration, input: DescribeTrafficMirrorFiltersCommandInput, ...additionalArguments: any): Paginator<DescribeTrafficMirrorFiltersCommandOutput>;
