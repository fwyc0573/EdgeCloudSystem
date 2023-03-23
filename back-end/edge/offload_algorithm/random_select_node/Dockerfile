FROM python:3.6
WORKDIR /home
COPY requirements.txt /home
RUN apt-get update
RUN pip install --default-timeout=1000 -r ./requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
COPY app.py /home
EXPOSE 4000
CMD ["python", "app.py"]
