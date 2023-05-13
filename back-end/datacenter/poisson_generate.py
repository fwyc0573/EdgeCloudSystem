import pandas as pd
import random


def poisson_arrival(total_time, lamb):
    time = 0
    result = []
    while True:
        time += random.expovariate(lamb)
        if time > total_time:
            break
        result.append(round(time))
    return result


if __name__ == "__main__":
    data_frame = pd.DataFrame()
    for i in range(1, 21):
        start_list = poisson_arrival(100000, 1 / (i * 30))
        length = len(start_list)
        end_list = []
        type_list = [i for _ in range(length)]
        for j in start_list:
            end_list.append(j + i + 1)
        this_data_frame = pd.DataFrame(
            [*zip(type_list, start_list, end_list)],
            columns=["type", "start_time", "end_time"],
        )
        data_frame = pd.concat([data_frame, this_data_frame], ignore_index=True)
    data_frame = data_frame.sort_values(
        by="start_time", ascending=True, ignore_index=True
    )
    data_frame.to_csv("request/poisson_data.csv")
