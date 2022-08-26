import * as express from 'express';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import 'dotenv/config';

const { APPID } = process.env;

// import Post from './weather.interface';

interface Weather{
    id:number,
    weatherDescription:string,
    temperature:number,
    name:string
}
 
class WeatherController {
  public cache = new NodeCache({stdTTL:300});
  public path = '/';
  public router = express.Router();
  
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getWeatherData);
    this.router.get('/callback', (request: express.Request, response: express.Response)=>{
        response.send("Try again, maybe your email isn't verified")
    });
  }
 
  getWeather = async() =>{
    const readFile = util.promisify(fs.readFile);
    const p = path.join(__dirname, './cities.json');
    const  cities = await readFile(p, {encoding:'utf-8'});
    const ncities = JSON.parse(cities).List;
    console.log("not cached");
    
    const arr:Weather[] = await Promise.all( ncities.map(async (city:any) =>{
        const code = city["CityCode"];
        const response = await fetch(`http://api.openweathermap.org/data/2.5/group?id=${code}&appid=${APPID}`);
        const res = await response.json();
        // console.log(res);
        return({
            id:res.list[0].id,
            weatherDescription: res.list[0].weather[0].description,
            temperature:res.list[0].main.temp,
            name:res.list[0].name,

        });
    }));
    return arr;
    
  }

  getWeatherData = async(request: express.Request, response: express.Response) => {
    try{
        if(!request.oidc.isAuthenticated()){
            response.render('pages/index.ejs',{
                isAuth:false,
                weather:[]
            })
            return;
        }
        let weather = this.cache.get('weatherData');
        if(weather == null){
            weather = await this.getWeather();
            this.cache.set('weatherData',weather,300);
        }
        
        response.render('pages/index.ejs',{
            isAuth:true,
            weather
        });
    }
    catch(err){
        console.log(err);
        response.sendStatus(500);
    } 
  }
 
}
 
export default WeatherController;