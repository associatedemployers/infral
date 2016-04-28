# infral
Node Load Balancer

### Prequisites
- Redis
- Node 6.x

### Install
```
$ git clone https://github.com/associatedemployers/infral
$ cd infral
$ npm install
```

### Run
PROTIP: Use a node proccess manager.
```
$ INFRAL_PORT=4555 node index.js
```

### Targets
Infral uses redis to store worker targets. Add, delete and get targets with HTTP requests.
```
$ curl localhost:4555/targets -X "POST" --data "protocol=https&host=localhost&port=3000"
201
$ curl localhost:4555/targets
200
["https://localhost:3000"]
$ curl localhost:4555/targets -X "DELETE" --data "protocol=https&host=localhost&port=3000"
204
```
