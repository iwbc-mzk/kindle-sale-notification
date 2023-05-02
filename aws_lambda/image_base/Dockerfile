FROM public.ecr.aws/lambda/python:3.10 as chrome

RUN yum -y install unzip

RUN curl -Lo "/tmp/chromium.zip" "https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F800217%2Fchrome-linux.zip?generation=1597947119541943&alt=media"
RUN unzip /tmp/chromium.zip -d /opt

RUN curl -Lo "/tmp/chromedriver.zip" "https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F800217%2Fchromedriver_linux64.zip?generation=1597947123890096&alt=media"
RUN unzip -j /tmp/chromedriver.zip -d /opt


FROM public.ecr.aws/lambda/python:3.10 as base

COPY chrome_deps.txt /tmp/
RUN yum install -y $(cat /tmp/chrome_deps.txt)

COPY requirements.txt /tmp/
RUN python3 -m pip install --upgrade pip -q
RUN python3 -m pip install -r /tmp/requirements.txt --no-cache-dir

COPY --from=chrome /opt/chrome-linux /opt/chrome-linux
COPY --from=chrome /opt/chromedriver /opt/chromedriver
COPY app.py .
COPY amazon.py .

CMD ["app.lambda_handler"]
