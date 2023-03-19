import { DescribeHostReservationOfferingsCommandInput, DescribeHostReservationOfferingsCommandOutput } from "../commands/DescribeHostReservationOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeHostReservationOfferings(config: EC2PaginationConfiguration, input: DescribeHostReservationOfferingsCommandInput, ...additionalArguments: any): Paginator<DescribeHostReservationOfferingsCommandOutput>;
