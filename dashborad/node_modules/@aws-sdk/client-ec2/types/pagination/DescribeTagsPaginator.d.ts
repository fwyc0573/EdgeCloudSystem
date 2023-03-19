import { DescribeTagsCommandInput, DescribeTagsCommandOutput } from "../commands/DescribeTagsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTags(config: EC2PaginationConfiguration, input: DescribeTagsCommandInput, ...additionalArguments: any): Paginator<DescribeTagsCommandOutput>;
