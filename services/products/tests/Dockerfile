# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the source code files to the container
COPY src/ /app/src/

# Copy the test files and configurations to the container
COPY tests/ /app/tests/

# Install any needed dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r tests/requirements.txt

ENV ENV=testing

# Run tests using pytest when the container launches
CMD ["pytest", "--color=yes"]
