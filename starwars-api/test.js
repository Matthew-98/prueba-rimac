const axios = require('axios');
const chai = require("chai");
const expect = require('chai').expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = "https://v8j21vmsfh.execute-api.us-east-2.amazonaws.com/dev"

describe('Insert a many planets ', () =>{

    let planets = [
        {
            "nombre": "Tierra",
            "diametro": "10465",
            "periodoRotacion": "23",
            "periodoOrbital": "304",
            "gravedad": "1",
            "poblacion": "120000",
            "clima": "Arid",
            "terreno": "Dessert",
            "aguaSuperficial": "1",
            "residentes": [
                "https://swapi.py4e.com/api/people/1/"
            ],
            "peliculas": [
                "https://swapi.py4e.com/api/films/1/"
            ],
            "url": "https://swapi.py4e.com/api/planets/1/"
        }   
    ]
    it("Should add Planets in DB", (done) => {
        for (planet in planets) {
            chai.request(server)
                .post("/planet")
                .send(planets[planet])
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    console.log("Response Body:", res.body); 
                })
        }
        done()
    })  
      
})


describe('Get All Planets ', () =>{

    it("Should get Information about a planet in DB", (done) => {
            chai.request(server)
                .get("/planet")
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    console.log("Response Body:", res.body); 
                })
                done()
    })    
})