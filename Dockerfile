
FROM ubuntu:22.04

RUN apt-get update
RUN apt-get update --fix-missing

# Install:
#   - Curl
#   - Pip3
#   - Git
#   - Nano
#   - zip
#   - jq
#   - aws-shell
RUN apt-get update \
    && apt-get install -y git nano curl zip jq python3-pip \
    && update-alternatives --install /usr/bin/python python /usr/bin/python3 10 \
    && update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 10 \
    && pip install aws-shell

# Download and run files needed to install latest version of Node
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -

RUN apt-get update
RUN apt-get update --fix-missing

# Install node and npm
RUN apt-get install -y nodejs

# Install Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install yarn
