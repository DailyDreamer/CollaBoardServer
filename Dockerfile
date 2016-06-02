FROM centos:7
# Install Node.js
RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
RUN yum -y install nodejs
# Bundle app source
ADD . /collaboard
# Install app dependencies
RUN cd /collaboard; npm install
RUN npm install -g pm2

EXPOSE  3000
CMD ["pm2", "start", "/collaboard/index.js"]