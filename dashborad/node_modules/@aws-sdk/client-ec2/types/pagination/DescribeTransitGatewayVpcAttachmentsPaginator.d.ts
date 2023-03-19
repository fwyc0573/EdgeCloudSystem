import { DescribeTransitGatewayVpcAttachmentsCommandInput, DescribeTransitGatewayVpcAttachmentsCommandOutput } from "../commands/DescribeTransitGatewayVpcAttachmentsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayVpcAttachments(config: EC2PaginationConfiguration, input: DescribeTransitGatewayVpcAttachmentsCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayVpcAttachmentsCommandOutput>;
