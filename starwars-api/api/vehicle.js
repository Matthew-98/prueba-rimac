'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const R = require('ramda');
const axios = require('axios');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {
    console.log("Receieved request submit vehicles details. Event is", event);
    const requestBody = JSON.parse(event.body);

    const nombre = requestBody.nombre;
    const modelo = requestBody.modelo;
    const fabricante = requestBody.fabricante;
    const costoCreditos = requestBody.costoCreditos;
    const longitud = requestBody.longitud;
    const velocidadMaximaAtmósfera = requestBody.velocidadMaximaAtmósfera;
    const tripulacion = requestBody.tripulacion;
    const pasajeros = requestBody.pasajeros;
    const cargaCapacidad = requestBody.cargaCapacidad;
    const consumibles = requestBody.consumibles;
    const claseVehiculo = requestBody.claseVehiculo;
    const pilotos = requestBody.pilotos;
    const peliculas = requestBody.peliculas;
    const creado = requestBody.creado;
    const editado = requestBody.editado;
    const url = requestBody.url;



    const vehicle = vehicleInfo(nombre, modelo, fabricante, costoCreditos, longitud, velocidadMaximaAtmósfera, tripulacion, pasajeros, cargaCapacidad, consumibles, claseVehiculo, pilotos, peliculas, creado, editado, url);

    submitVehicleP(vehicle)
        .then(res => {
            callback(null, {
                statusCode: 201,
                body: JSON.stringify({
                    message: `Sucessfully submitted vehicle with name ${nombre}`,
                    vehicleId: res.id
                })
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Unable to submit vehicle with name ${nombre}`
                })
            })
        });

};

module.exports.list = (event, context, callback) => {
    console.log("Receieved request to list all vehicle. Event is", event);
    var params = {
        TableName: process.env.VEHICLE_TABLE,
        ProjectionExpression: "id, nombre, modelo, fabricante, costoCreditos, longitud, velocidadMaximaAtmósfera, tripulacion, pasajeros, cargaCapacidad, consumibles, claseVehiculo, pilotos, peliculas, creado, editado, url"
    };
    const onScan = (err, data) => {
        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, successResponseBuilder(JSON.stringify({
                vehiculos: data.Items
            })
            ));
        }
    };
    dynamoDb.scan(params, onScan);
};


module.exports.get = (event, context, callback) => {
    const params = {
        TableName: process.env.VEHICLE_TABLE,
        Key: {
            id: event.pathParameters.id,
        },
    };
    dynamoDb.get(params)
        .promise()
        .then(result => {
            callback(null, successResponseBuilder(JSON.stringify(result.Item)));
        })
        .catch(error => {
            console.error(error);
            callback(new Error('Couldn\'t fetch vehicle.'));
            return;
        });
};


module.exports.getInfoVehicle = (event, context, callback) => {

    axios.get(`https://swapi.py4e.com/api/vehicles/${event.pathParameters.id}`)
        .then(function (response) {
            let data = response.data;
            let result = {

                "nombre": data.name,
                "modelo": data.model,
                "fabricante": data.manufacturer,
                "costoCreditos": data.cost_in_credits,
                "longitud": data.length,
                "velocidadMaximaAtmósfera": data.max_atmosphering_speed,
                "tripulacion": data.crew,
                "pasajeros": data.passengers,
                "cargaCapacidad": data.cargo_capacity,
                "consumibles": data.consumables,
                "claseVehiculo": data.vehicle_class,
                "pilotos": data.pilots,
                "peliculas": data.films,
                "creado": data.created,
                "editado": data.edited,
                "url": data.url,

            }
            return callback(null, successResponseBuilder(JSON.stringify({
                result
            })
            ));
        })
        .catch(function (error) {
            console.log(error);
            callback(new Error('Couldn\'t fetch vehicle.'));
            return;
        })
        .then(function () {
            console.log("Finish call");
        });

};


const checkVehicleExistsP = (vehicle) => {
    console.log('Checking if vehicle already exists...');
    const query = {
        TableName: process.env.VEHICLE_NAME_TABLE,
        Key: {
            "nombre": vehicle.nombre
        }
    };
    return dynamoDb.get(query)
        .promise()
        .then(res => {
            if (R.not(R.isEmpty(res))) {
                return Promise.reject(new Error('Vehicle already exists with name ' + nombre));
            }
            return vehicle;
        });
}

const submitVehicleP = vehicle => {
    console.log('submitVehicleP() Submitting vehicle to system');
    const vehicleItem = {
        TableName: process.env.VEHICLE_TABLE,
        Item: vehicle,
    };
    return dynamoDb.put(vehicleItem)
        .promise()
        .then(res => vehicle);
};


const successResponseBuilder = (body) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};

const failureResponseBuilder = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};


const submitVehicleNameP = vehicle => {
    console.log('Submitting vehicle name');
    const vehicleNameInfo = {
        TableName: process.env.VEHICLE_NAME_TABLE,
        Item: {
            vehicle_id: vehicle.id,
            nombre: vehicle.nombre
        },
    };
    return dynamoDb.put(vehicleNameInfo)
        .promise();
}

const planetInfo = (nombre, modelo, fabricante, costoCreditos, longitud, velocidadMaximaAtmósfera, tripulacion, pasajeros, cargaCapacidad, consumibles, claseVehiculo, pilotos, peliculas, creado, editado, url) => {
    const timestamp = new Date().getTime();
    return {
        id: uuid.v1(),
        nombre,
        modelo,
        fabricante,
        costoCreditos,
        longitud,
        velocidadMaximaAtmósfera,
        tripulacion,
        pasajeros,
        cargaCapacidad,
        consumibles,
        claseVehiculo,
        pilotos,
        peliculas,
        creado,
        editado,
        url,
        evaluated: false,
        submittedAt: timestamp,
        updatedAt: timestamp,
    };
};
