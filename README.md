
# Prerequisites
1. [Node.js](https://nodejs.org/en/)
2. [Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)

# Setup
```
npm install
cp scripts/server.template.sh scripts/server.sh
```
Optionally update the paths in scripts/server.sh

# Run Unit Tests
```
npm test
```

# Run App Locally
```
# Run the server in the background
npm start
open http://localhost:8125
```

To stop the server
```
npm run stop
```

# Deploy
```
npm run deploy
```
