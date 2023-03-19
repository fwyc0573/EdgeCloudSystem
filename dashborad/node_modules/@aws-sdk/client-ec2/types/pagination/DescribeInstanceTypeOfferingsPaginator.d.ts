import { DescribeInstanceTypeOfferingsCommandInput, DescribeInstanceTypeOfferingsCommandOutput } from "../commands/DescribeInstanceTypeOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeInstanceTypeOfferings(config: EC2PaginationConfiguration, input: DescribeInstanceTypeOfferingsCommandInput, ...additionalArguments: any): Paginator<DescribeInstanceTypeOfferingsCommandOutput>;
