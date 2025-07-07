//constants
const urlName = window.location.href;
const url = new URL(urlName);
let hostId = url.searchParams.get("hostId");
const players = JSON.parse(window.localStorage.getItem('players')) || [];

//Globals
let savedId = window.localStorage.getItem('myPeerId');
let isConnected = window.localStorage.getItem('isConnected') || false;
let peer, conn;

//bindings
let myIdInput, remoteIdInput, logDiv;

//Functions
function setupConnection() {
    conn.on('data', data => {
        log('Peer: ' + data);
    });
    conn.on('close', () => {
        log('Connection closed.');
        window.localStorage.setItem('isConnected', false);
        isConnected = false;
    });
    window.localStorage.setItem('isConnected', true);
    isConnected = true;
}

function log(msg) {
    logDiv.innerHTML += msg + '<br>';
    logDiv.scrollTop = logDiv.scrollHeight;
}

function connect() {
    if (!peer) {
        log('Generate your ID first!');
        return;
    }
    const remoteId = remoteIdInput.value;
    conn = peer.connect(remoteId);
    conn.on('open', setupConnection);
}

function sendMessage() {
    if (conn && conn.open) {
        const msg = document.getElementById('message').value;
        conn.send(msg);
        log('You: ' + msg);
    } else {
        log('Not connected!');
    }
}

function generateId() {
    if (!savedId) {
        savedId = 
            "FriendsGame" + 
            "-" +
            (!hostId ? "Host" : "Player") +
            "-" +
            Math.random().toString(36).substring(2, 10);
        window.localStorage.setItem('myPeerId', savedId);
    } 
    document.getElementById('my-id').value = savedId;
    document.getElementById('host-url').innerText = urlName + '?hostId=' + savedId;
}

function emptyId(){
    savedId = null;
    window.localStorage.setItem('myPeerId', savedId);
    document.getElementById('my-id').value = savedId || '';
    unregisterSelf();
}

function registerSelf() {
    generateId();
    if (!peer) {
        peer = new Peer(savedId, {
            host: "localhost",
            port: 9000,
            path: "/peerServer",
        });
        //peer = new Peer(randomId); //Cloud based / Public
        peer.on('connection', connection => {
            conn = connection;
            setupConnection();
            log('Connected to peer: ' + conn.peer);
            addPlayer(conn.peer);
        });
    }
}

function addPlayer(playerID) {
    if (players.includes(playerID)) {
        return;
    }
    players.push(playerID);
    window.localStorage.setItem('players', JSON.stringify(players));
    window.localStorage.setItem('players', JSON.stringify(null));
}

function disconnect() {
    if (conn) {
        conn.close();
    }
}

function unregisterSelf() {
    if (peer) {
        peer.destroy();
        peer = null;
        conn = null;
    }
}

function reconnect(){
    if (peer) {
        for (player of players) {
            peer.connect(player);
        }
    } else {
        log('No peer to reconnect!');
    }
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