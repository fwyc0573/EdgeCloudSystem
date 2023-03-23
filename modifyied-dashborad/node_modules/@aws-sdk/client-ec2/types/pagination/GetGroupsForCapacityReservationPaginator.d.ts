import { GetGroupsForCapacityReservationCommandInput, GetGroupsForCapacityReservationCommandOutput } from "../commands/GetGroupsForCapacityReservationCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateGetGroupsForCapacityReservation(config: EC2PaginationConfiguration, input: GetGroupsForCapacityReservationCommandInput, ...additionalArguments: any): Paginator<GetGroupsForCapacityReservationCommandOutput>;
