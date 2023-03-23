import { DescribeReservedInstancesOfferingsCommandInput, DescribeReservedInstancesOfferingsCommandOutput } from "../commands/DescribeReservedInstancesOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeReservedInstancesOfferings(config: EC2PaginationConfiguration, input: DescribeReservedInstancesOfferingsCommandInput, ...additionalArguments: any): Paginator<DescribeReservedInstancesOfferingsCommandOutput>;
