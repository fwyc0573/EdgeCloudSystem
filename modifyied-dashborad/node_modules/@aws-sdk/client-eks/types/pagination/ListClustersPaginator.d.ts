import { ListClustersCommandInput, ListClustersCommandOutput } from "../commands/ListClustersCommand";
import { EKSPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListClusters(config: EKSPaginationConfiguration, input: ListClustersCommandInput, ...additionalArguments: any): Paginator<ListClustersCommandOutput>;
