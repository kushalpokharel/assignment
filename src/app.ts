import express from 'express';
import * as bodyParser from 'body-parser';
import {auth} from 'express-openid-connect';

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: '48B7KZxyePPO6RdYO8mRS8VNtY-WbGw8EgEuQ9lBHQe8DQ_Ss7_15J1LKighXENF',
  baseURL: 'http://localhost:5000',
  clientID: 'G08i74Kf1g4BzzIDvAo75l2l6NS5ypAN',
  issuerBaseURL: 'https://dev-0xa4dy7d.us.auth0.com'

};
 
class App {
  public app: express.Application;
  public port: number;
 
  constructor(controllers:any, port:number) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(auth(config));
    this.app.set('view engine', 'ejs');
    this.app.use(express.static(__dirname + '/public'));
  }
 
  private initializeControllers(controllers:Array<any>[]) {
    controllers.forEach((controller:any) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
 
export default App;