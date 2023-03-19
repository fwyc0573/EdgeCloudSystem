import { DescribeNetworkInterfacesCommandInput, DescribeNetworkInterfacesCommandOutput } from "../commands/DescribeNetworkInterfacesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeNetworkInterfaces(config: EC2PaginationConfiguration, input: DescribeNetworkInterfacesCommandInput, ...additionalArguments: any): Paginator<DescribeNetworkInterfacesCommandOutput>;
