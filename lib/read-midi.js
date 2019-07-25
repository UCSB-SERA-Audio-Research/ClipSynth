//https://github.com/colxi/midi-parser-js/wiki/MIDI-File-Format-Specifications

var trackLength;
function readMIDI(raw) {
    // console.log(raw);
    var midi = {
        meta: {
            signature: ((() => {
                for (var i = 0; i < raw.track.length; i++) {
                    var track = raw.track[i];
                    return track.event.find(item => {
                        return item.metaType == 88;
                    });
                }
            })() || { data: undefined }).data,
            bpm: 60000000 / ((() => {
                for (var i = 0; i < raw.track.length; i++) {
                    var track = raw.track[i];
                    return track.event.find(item => {
                        return item.metaType == 81;
                    });
                }
            })() || { data: 500000 }).data,
            division: raw.timeDivision
        },
        notes: (() => {
            var timeline = raw.track[raw.track.length - 1].event;
            var sequence = [];
            timeline.filter(item => {
                return true;//item.type<=0x9;
            }).forEach(item => {
                sequence.push({
                    time: item.deltaTime,
                    type: item.type,
                    data: item.data
                });
            });
            return sequence;
        })()
    };
    // console.log(midi);
    var tickLength;
    if ((midi.meta.division & 0x8000) == 0) {
        var ticksPerBeat = midi.meta.division & 0x7FFF;
        tickLength = 1 / ((midi.meta.bpm * ticksPerBeat) / 60);
    } else {
        var SMPTE = ((midi.meta.division & 0x7F00) / 0xFF);
        SMPTE = (SMPTE == 29 ? 29.97 : SMPTE);
        var ticksPerFrame = midi.meta.division & 0x00FF;
        tickLength = 1 / (SMPTE * ticksPerFrame);
    }
    var total = 0;
    sequence = [];
    midi.notes.forEach(note => {
        total += tickLength * note.time;
        //setTimeout(()=>{
        if (note.type <= 0x9) {
            //// console.log(total, notes[note.data[0] - 21], (note.type == 9 ? "on" : "off"));
            sequence.push({ time: total, note: notes[note.data[0] - 21], type: (note.type == 9 ? "on" : "off") });
        } else {
        }
        //},total);
    });
    trackLength=total+1;
    // console.log(sequence);
    return sequence;
}
