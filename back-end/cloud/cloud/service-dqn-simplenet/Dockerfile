FROM python:3.6
WORKDIR /home
COPY requirements.txt /home
COPY torch-1.8.1-cp36-cp36m-manylinux1_x86_64.whl /home
RUN pip install /home/torch-1.8.1-cp36-cp36m-manylinux1_x86_64.whl
RUN apt-get update
RUN pip install --default-timeout=1000 -r ./requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
COPY app.py /home
EXPOSE 4002
CMD ["python", "app.py"]
