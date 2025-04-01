FROM python:3.12-slim
WORKDIR /app
COPY server.py .
RUN pip install fastmcp
EXPOSE 8000
CMD ["python", "server.py"]