//Require Module
var log4js = require('log4js');
var logger = log4js.getLogger('Logging');
var moment = require('moment-timezone');
var fs = require('fs');

function checkTimeFormat(time){

/*
 * Check time format "hh:mm"
 * Receive a string of time,
 * If the time format is wrong, throw error,
 * else retun true.
 * */

    var checking = time.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);

    if(!checking){

        throw new Error('TIME_FORMAT_ERROR');
    }

    return true;
}


function getTimeMs(time){

/*
 * Convert time to ms
 * Receive a string of time,and call checkTimeFormat to make sure the format is right.
 * 
 * After that, split the time and convert it to a int, 
 * then convert it again to ms, add them together, and return it.
 * 
 * */

    checkTimeFormat(time);

    var splitedTime = time.split(':');

    var hour = splitedTime[0];

    var minute = splitedTime[1];

    var hourMs = hour * 60 * 60 * 1000;

    var minMs = minute * 60 *1000;

    var totalMs = hourMs + minMs;

    return totalMs;

}

function getInitTime(timeZone){

    if(timeZone == '' || timeZone == null){

        var currentDate = new Date();

        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);

        return currentDate;

    }

    var currentDate = new Date();

    var currentDateTz = new moment.tz(new Date(),timeZone);

    currentDateTz.month(currentDate.getMonth());
    currentDateTz.date(currentDate.getDate());
    currentDateTz.hours(0);
    currentDateTz.minutes(0);
    currentDateTz.seconds(0);
    currentDateTz.milliseconds(0);

    var currentDateMs = currentDateTz.valueOf();

    var newCurrentDate = new Date(currentDateMs)

    return newCurrentDate;
}

function checkKeepAliveTime(keepAliveTimes,lastAliveTime,lastSuccessTime,timeZone){

    var currentDateInited = getInitTime(timeZone).getTime();

    for(var i =0; i < keepAliveTimes.length; i++){
        var lastSuccessTimeMs = lastSuccessTime.getTime();
        var lastAliveTimeMs = null;

        try{
            lastAliveTimeMs = lastAliveTime.getTime();
        }catch(err){}
        var keepAliveTimeMs1 = keepAliveTimes[i];
        var keepAliveTimeMs2 = keepAliveTimes[i+1];

        var totalKeepAliveTimeMs1 = keepAliveTimeMs1 + currentDateInited;
        var totalKeepAliveTimeMs2 = keepAliveTimeMs2 + currentDateInited;

        logger.debug('keepAliveTimes: ', new Date(totalKeepAliveTimeMs1));
        logger.debug('lastSuccessTime: ', new Date(lastSuccessTimeMs));

        if(isNaN(keepAliveTimeMs2) && lastSuccessTimeMs >= totalKeepAliveTimeMs1){

            if(lastAliveTime == null){

                return new Date(totalKeepAliveTimeMs1);
            }


            if(lastAliveTimeMs >= totalKeepAliveTimeMs1){ 

                return undefined;

            }

            return new Date(totalKeepAliveTimeMs1);
        }

        if(lastSuccessTimeMs >= totalKeepAliveTimeMs1 && lastSuccessTimeMs < totalKeepAliveTimeMs2){
            if(lastAliveTime == null){

                return new Date(totalKeepAliveTimeMs1);

            }

            if(lastAliveTimeMs >= totalKeepAliveTimeMs1){ 

                continue;
            }

            return new Date(totalKeepAliveTimeMs1);
        }
    }
}

module.exports = {
    checkTimeFormat:checkTimeFormat,
    getTimeMs:getTimeMs,
    getInitTime:getInitTime,
    checkKeepAliveTime:checkKeepAliveTime
}
