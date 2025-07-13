import {
    makeQR
    , emptyId
    , sendMessage
    , registerSelf
    , unregisterSelf
    , connect
    , disconnect
    , reconnect
} from './connection/connection.js';

const players = JSON.parse(window.localStorage.getItem('players')) || [];

//bindings
let myIdInput, remoteIdInput, logDiv;

//Functions
function log(msg) {
    logDiv.innerHTML += msg + '<br>';
    logDiv.scrollTop = logDiv.scrollHeight;
}

function addPlayer(playerID) {
    if (players.includes(playerID)) {
        return;
    }
    players.push(playerID);
    window.localStorage.setItem('players', JSON.stringify(players));
    window.localStorage.setItem('players', JSON.stringify(null));
}


//on load
window.onload = () => {
    myIdInput = document.getElementById('my-id');
    remoteIdInput = document.getElementById('remote-id');
    logDiv = document.getElementById('log');
    
    registerSelf();
    
    remoteIdInput.value = hostId || '';
    if (hostId) {
        registerSelf();
        connect();
        document.getElementById('hostInfo').style.display = 'none';
    } 

    document.getElementById('connect').onclick = connect;
    document.getElementById('send').onclick = sendMessage;
    document.getElementById('register').onclick = registerSelf;
    document.getElementById('resetId').onclick = emptyId;
    document.getElementById('disconnect').onclick = disconnect;
    document.getElementById('reconnect').onclick = reconnect;
    document.getElementById('unregister').onclick = unregisterSelf;
}