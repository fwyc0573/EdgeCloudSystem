import { DescribeInstanceTypesCommandInput, DescribeInstanceTypesCommandOutput } from "../commands/DescribeInstanceTypesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeInstanceTypes(config: EC2PaginationConfiguration, input: DescribeInstanceTypesCommandInput, ...additionalArguments: any): Paginator<DescribeInstanceTypesCommandOutput>;
