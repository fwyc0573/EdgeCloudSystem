import { DescribeHostReservationsCommandInput, DescribeHostReservationsCommandOutput } from "../commands/DescribeHostReservationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeHostReservations(config: EC2PaginationConfiguration, input: DescribeHostReservationsCommandInput, ...additionalArguments: any): Paginator<DescribeHostReservationsCommandOutput>;
