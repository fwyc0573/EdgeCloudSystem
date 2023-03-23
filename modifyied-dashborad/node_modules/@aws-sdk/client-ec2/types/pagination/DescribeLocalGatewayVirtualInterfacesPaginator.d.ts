import { DescribeLocalGatewayVirtualInterfacesCommandInput, DescribeLocalGatewayVirtualInterfacesCommandOutput } from "../commands/DescribeLocalGatewayVirtualInterfacesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeLocalGatewayVirtualInterfaces(config: EC2PaginationConfiguration, input: DescribeLocalGatewayVirtualInterfacesCommandInput, ...additionalArguments: any): Paginator<DescribeLocalGatewayVirtualInterfacesCommandOutput>;
