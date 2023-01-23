var {PythonShell} = require('python-shell');

var httpRequest = "http://inventory-v1.local/?API_attendance";

var today = new Date();
var dd = today.getDate();

var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
// today = mm+'-'+dd+'-'+yyyy;
today = yyyy+'-'+mm+'-'+dd;
// console.log(today); //09-11-2021 =>2021-09-11

function currentTime() {
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    if (h === 0) {
        h = 12;
    }
    if (h > 12) {
        h = h - 12;
        session = "PM";
    }
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    setTimeout(currentTime, 1000);
}

function realTimeData(pyLinkerFile, displayID, deviceTitle,deviceIP) {

    if (cancelled) {
        return false;
    }

    var connection = false;

    var options = {
        scriptPath: path.join(__dirname, '../engine/'),
        args: [deviceIP]
    };


    var realAtD = new PythonShell(pyLinkerFile, options);
    realAtD.on('message', function (message) {
        if (message !== "error") {
            var messageSplite = message.split(":");
            if (messageSplite[0] === "deviceName")
                $("" + deviceTitle + "").html(messageSplite[1]);
            //console.log(message);
            connection = true;
            try {
                var attendanceData = JSON.stringify('' + message + '');
                var obj = JSON.parse('' + message + '');
                //console.log(obj);
                var statusType = (obj[0].punch === 0 || obj[0].punch === 4 )?("in"):("out");
                var colorZill = (obj[0].punch === 0 || obj[0].punch === 4 )?("greenyellow"):("white");

                $("" + displayID + "").prepend("<p style='color: "+colorZill+"'>- ID: " + obj[0].id + " Time: " + obj[0].adt +
                " Punch: " + statusType + 
                 "</p>");
     
                try {
                    if (attendanceData != null) {
                        $.post(httpRequest, {employeecode: obj[0].id, dateTime: obj[0].adt,typeOption: statusType})
                            .done(function (data) {
                                console.log("Data Loaded: " + data);
                            });
                    }

                } catch (e) {
                        console.log(e);
                }


            } catch (e) {

            }
        } else {
            connection = false;
            $("" + displayID + "").prepend("<p style='color: #f69e9e'>- check device connection</p>");
            setTimeout(function () {
                // window.location.reload(1);
                if (connection === false) {
                    if (cancelled) {
                        return;
                    }
                    realTimeData(pyLinkerFile, displayID, deviceTitle)
                }
            }, 9000);


        }

    });


}


function getAttendenceThisData(deviceIP, fDate, tDate) {

    var options = {
        scriptPath: path.join(__dirname, '../engine/'),
        args: [deviceIP, fDate, tDate]
    };
    var getAtdData = new PythonShell('getAttendThisDate.py', options);
    getAtdData.on('message', function (message) {
        try {
           // var attendanceData = JSON.stringify('' + message + '');
            var obj = JSON.parse('' + message + '');
            jQuery.each(obj, function(index, item) {
                try {
                    var statusType = (item.punch === 0 || item.punch === 4 )?("in"):("out");

                    if (obj != null) {
                        $.post(httpRequest, {employeecode: item.id, dateTime: item.adt,typeOption: statusType})
                            .done(function (data) {
                              //  console.log("Data Loaded: " + index+ " == "+ item.adt+" == "+ item.id);
                            });
                    }

                } catch (e) {
                  //  console.log(e);
                }

            });
           
        } catch (e) {
            //todo 
        }
    });
}



function reload() {
    window.location.reload(1);
}
