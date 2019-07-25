// https://trusting-ritchie-7760ae.netlify.com/
var sequence = [];
var tunedNotes = [];
var audioSequence = [];
var recording = null;
var inputFrequency;
var noteSequence = [];
var live;
var device;
var sensorValue;
var sensorElement;

function customLog(text) {
    console.log(text);
}

function copy(src) {
    var dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}

function deniedSensor(){
    sensorElement=undefined;
    document.querySelectorAll(".sensorInfo")[0].hidden = true;
    document.querySelectorAll(".sensorControllable").forEach(element=>{
        element.onmouseover=undefined;
        element.onmouseleave=undefined;
        element.oncontextmenu=undefined;
        element.style.border="";
    });
}

window.onload = () => {
    MidiParser.parse(document.getElementById('MIDI'), function (obj) {
        readMIDI(obj);
    });
    document.querySelectorAll("#AUDIO")[0].onchange = function () {
        readFile(document.querySelectorAll("#AUDIO")[0].files[0]).then(localBuffer => {
            audioArray = copy(localBuffer);
            audioContext.decodeAudioData(localBuffer).then(rec => {
                recording = rec;
            });
        });
    }
    document.querySelectorAll("#effect")[0].onchange = function () {
        if (document.querySelectorAll("#effect")[0].value == "delay") {
            document.querySelectorAll(".delayControl")[0].hidden = false;
            document.querySelectorAll(".reverbFile")[0].hidden = true;
            document.querySelectorAll(".distortionControl")[0].hidden = true;
        } else if (document.querySelectorAll("#effect")[0].value == "reverb") {
            document.querySelectorAll(".delayControl")[0].hidden = true;
            document.querySelectorAll(".reverbFile")[0].hidden = false;
            document.querySelectorAll(".distortionControl")[0].hidden = true;
        } else if (document.querySelectorAll("#effect")[0].value == "distortion") {
            document.querySelectorAll(".delayControl")[0].hidden = true;
            document.querySelectorAll(".reverbFile")[0].hidden = true;
            document.querySelectorAll(".distortionControl")[0].hidden = false;
        } else {
            document.querySelectorAll(".delayControl")[0].hidden = true;
            document.querySelectorAll(".reverbFile")[0].hidden = true;
            document.querySelectorAll(".distortionControl")[0].hidden = true;
        }
    }
    document.querySelectorAll(".sensor")[0].onclick = function () {
        if (document.querySelectorAll(".sensor")[0].checked) {
            navigator.usb.requestDevice({ filters: [{ vendorId: 0x2341 }] })
                .then(selectedDevice => {
                    device = selectedDevice;
                    return device.open(); // Begin a session.
                }).then(() => device.selectConfiguration(1)) // Select configuration #1 for the device.
                .then(() => device.claimInterface(2)) // Request exclusive control over interface #2.
                .then(() => device.controlTransferOut({
                    requestType: 'class',
                    recipient: 'interface',
                    request: 0x22,
                    value: 0x01,
                    index: 0x02
                })).then(() => {
                    document.querySelectorAll(".sensorInfo")[0].hidden = false;
                    document.querySelectorAll(".sensorControllable").forEach(element=>{
                        element.onmouseover=function(){
                            element.style.background="#2196F3";
                        }
                        element.onmouseleave=function(){
                            element.style.background="transparent";
                        }
                        element.oncontextmenu=function(){
                            if(sensorElement!=null){
                                sensorElement.style.border="";
                            }
                            sensorElement=element;
                            element.style.border="5px solid #e91e63";
                            return false;
                        }
                    });
                    
                }).catch(error => {
                    deniedSensor();
                });

        } else {
            deniedSensor();
        }
    };
}

function getInputFrequency() {
    if (device != null) {
        device.transferIn(5, 64)
    }
    // console.log(audioArray);
    var fileByteArray = new Uint8Array(audioArray);
    var filename = "audio.wav";
    var results = ffmpeg_run({
        // -i <input> -af asetrate=44100*0.5,aresample=44100||,atempo=1/2 <output>
        arguments: ("-i " + filename + " -ss 0 -t 0.05 -ac 1 out.wav").split(" "),
        files: [
            {
                data: fileByteArray,
                name: filename
            }
        ]
    });
    var file = results[0];
    const float32Array = recording.getChannelData(0); // get a single channel of sound
    const pitch = detectPitch(float32Array); // null if pitch cannot be identified
    // console.log("Pitch:", pitch);
    return pitch || 440;
}

function run() {
    stop();
    if(document.querySelectorAll(".sensor")[0].checked){
        setInterval(()=>{
            if(sensorElement!=null){
                device.transferIn(5, 64).then(result => {
                    let decoder = new TextDecoder();
                    var val=parseFloat(decoder.decode(result.data))*parseFloat(sensorElement.querySelectorAll("input")[0].max);
    
                    if(val>0){
                        sensorElement.querySelectorAll("input")[0].value=val;
                    }
                });
            }
        },50);
    }
    live = document.querySelectorAll(".live")[0].checked;
    tunedNotes = {}
    audioSequence = [];
    noteSequence = [];
    offlineAudioContext = new (window.OfflineAudioContext)(2, 44100 * trackLength, 44100);
    if (sequence.length == 0 || recording == null) {
        return;
    }
    audioSequence = [];
    sequence.forEach(item => {
        if (item.type == "on") {
            audioSequence.push(undefined);
        }
    });
    window.promptBackup = window.prompt; //back up the prompt function.
    window.prompt = () => { }; // disable the prompt function.
    // use ffmpeg to separate audio from video.
    inputFrequency = getInputFrequency();

    var playing = [];
    var intervals = [];
    for (var i = 0; i < notes.length; i++) {
        playing.push([]);
        intervals.push([]);
    }
    var noteOrder = 0;
    sequence.forEach((note) => {
        var noteID = note.note.number - 21;
        if (playing[noteID].length > 0) {
            var lastEvent = playing[noteID][playing[noteID].length - 1];/*
            for(var i=playing[noteID].length - 1;i>=0;i--){
                lastEvent=playing[noteID][i];
                if(playing[noteID][i].time-note.time>0){
                    break;
                }
            }
            //
            */
            playing[noteID] = playing[noteID].slice(0, -1);
            intervals[noteID].push({ time: lastEvent.time, order: lastEvent.order });
            noteSequence.push({ time: lastEvent.time, duration: note.time - lastEvent.time, order: lastEvent.order, note: noteID });
        } else {
            playing[noteID].push({ time: note.time, order: noteOrder++ });
        }
    });
    //    var lengthArray = [];
    // console.log(intervals);
    /*
    intervals.forEach((note, i) => {
        if (note.length > 0) {
            lengthArray.push({ note: notes[i], lengths: note });
        }
    });*/
    // console.log(lengthArray);
    var toTune = [];
    intervals.forEach((item, i) => {
        if (item.length > 0) {
            var object = { frequency: notes[i].frequency, note: i };
            toTune.push(object);
        }
    });
    //    // console.log(toTune);
    // console.log("Started");
    var promises = [];
    (toTune.forEach(note => {
        promises.push(tuneToPitch(note.frequency, note.note, inputFrequency));
    }));
    return Promise.all(promises).then(values => {
        values.forEach(value => {
            tunedNotes[value.note] = (value.data);
        });
        processAudio().then(data => {
            data.forEach(item => {
                tunedNotes[item.note] = item.audio;
            });
            //audioSequence[lengthInfo.order]={buffer:stretchedBuffer,time:lengthInfo.time};
            noteSequence.forEach(noteEvent => {
                audioSequence[noteEvent.order] = ({ buffer: tunedNotes[noteEvent.note], time: noteEvent.time, duration: noteEvent.duration });
            });
            stretchToLengths(/*data,lengthArray*/).then(() => {
                renderAudio();
            });
        });
    });
}

function stop() {
    if(audioContext!=undefined){
        audioContext.close();
    }
    var highestTimeoutId = setTimeout(";");
    for (var i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }
}

function stretchToLengths(/*data,lengthArray*/) {/*
    var tunePromises=[];
    lengthArray.forEach(tune => {
        var decodePromises=[];
        var tunedLengths={};
        tune.lengths.forEach(lengthInfo => {
            var ratio = tune.note.frequency / inputFrequency;
            var atempo= Math.round((lengthInfo.length/(ratio*recording.duration))*1000)/1000;
            
            atempo=0.5;//(0.5/(ratio*recording.duration));
            
            var originalatempo=atempo;
            var atempoString=[];
            if(atempo>2){
                while(atempo>2){
                    atempoString.push("atempo=2");
                    atempo/=2;
                }
            }else if (atempo<0.5){
                while(atempo<0.5){
                    atempoString.push("atempo=0.5");
                    atempo*=2;
                }
            }
            atempoString.push("atempo="+atempo.toString());
            var results = ffmpeg_run({
                //!!!
                // -i <input> -af asetrate=44100*0.5,aresample=44100||,atempo=1/2 <output> atempoString.join(",")
                arguments: ("-i " + "audio.wav" + " -filter:a atempo="+atempo.toString()+" out.wav").split(" "),
                files: [
                    {
                        data: new Uint8Array(audioBufferToWav(tunedNotes[tune.note.number-21])),
                        name: "audio.wav"
                    }
                ]
            });
            var file = results[0];
            //file.data
            // console.log(lengthInfo);
            decodePromises.push(audioContext.decodeAudioData(file.data).then(stretchedBuffer=>{
                audioSequence[lengthInfo.order]={buffer:stretchedBuffer,time:lengthInfo.time};
            }));
        });
        tunePromises.push(Promise.all(decodePromises));
    });
    return Promise.all(tunePromises);*/
    return new Promise(resolve => {
        resolve();
    });
}

function readFile(inputFile) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsArrayBuffer(inputFile);
    });
};

function tuneToPitch(frequency, note, inputFrequency) {
    var fileByteArray = new Uint8Array(audioArray);
    var filename = "audio.wav";
    var ratio = frequency / inputFrequency;
    var results = ffmpeg_run({
        // -i <input> -af asetrate=44100*0.5,aresample=44100||,atempo=1/2 <output>
        arguments: ("-i " + filename + " -af asetrate=44100*" + ratio.toString() + ",aresample=44100 out.wav").split(" "),
        files: [
            {
                data: fileByteArray,
                name: filename
            }
        ]
    });
    var file = results[0];
    return { data: file.data, note: note };
}