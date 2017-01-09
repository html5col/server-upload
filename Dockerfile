# start from base
FROM centos

MAINTAINER wmt 'wangmt@firstgrid.cn'

#指定一个环境变量，会被后续run指令使用，并在容器运行时保持
ENV NODE_VERSION 6.9.2
ENV NODE_ENV production
ENV PORT 8000


# install system-wide deps for node
RUN yum -y update
RUN yum install -y  nodejs
RUN yum install -y nodejs npm
RUN ln -s /usr/bin/nodejs /usr/bin/node 
#create a symbolic link for the node binary to deal with backward compatibility issues.

# copy our application code
#use the copy command to copy our application into a new volume in the container - /opt/flask-app. This is where our code will reside. We also set this as our working directory, so that the following commands will be run in the context of this location
COPY group /opt/group
WORKDIR /opt/group

# fetch app specific deps
RUN npm install
#RUN npm run build

# specify the port number the container should expose , replace this with your application's default port
#The next step usually is to write the commands of copying the files and installing the dependencies. Luckily for us, the onbuild version of the image takes care of that. The
EXPOSE 8000
# run the application
CMD ["node", "./app.js"]