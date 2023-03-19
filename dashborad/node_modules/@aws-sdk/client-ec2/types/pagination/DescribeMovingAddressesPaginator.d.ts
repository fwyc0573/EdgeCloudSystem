import { DescribeMovingAddressesCommandInput, DescribeMovingAddressesCommandOutput } from "../commands/DescribeMovingAddressesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeMovingAddresses(config: EC2PaginationConfiguration, input: DescribeMovingAddressesCommandInput, ...additionalArguments: any): Paginator<DescribeMovingAddressesCommandOutput>;
