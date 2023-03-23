import { DescribeTransitGatewayPeeringAttachmentsCommandInput, DescribeTransitGatewayPeeringAttachmentsCommandOutput } from "../commands/DescribeTransitGatewayPeeringAttachmentsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeTransitGatewayPeeringAttachments(config: EC2PaginationConfiguration, input: DescribeTransitGatewayPeeringAttachmentsCommandInput, ...additionalArguments: any): Paginator<DescribeTransitGatewayPeeringAttachmentsCommandOutput>;
