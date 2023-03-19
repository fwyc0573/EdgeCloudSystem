import { DescribeTransitGatewayAttachmentsCommandInput, DescribeTransitGatewayAttachmentsCommandOutput } from "../commands/DescribeTransitGatewayAttachmentsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayAttachments(config: EC2PaginationConfiguration, input: DescribeTransitGatewayAttachmentsCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayAttachmentsCommandOutput>;
