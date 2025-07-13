//Globals
export let savedId = window.localStorage.getItem('myPeerId');
export let isConnected = window.localStorage.getItem('isConnected') || false;
export let peer, conn;

//constants
export const urlName = window.location.href;
export const url = new URL(urlName);
export let hostId = url.searchParams.get("hostId");

export function makeQR(elementName, url){
    const qrcode = new QRCode(document.getElementById(elementName), {
        text: url,
        width: 128,
        height: 128,
        colorDark : '#000',
        colorLight : '#fff',
        correctLevel : QRCode.CorrectLevel.H
    });
}

export function setupConnection() {
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

export function connect() {
    if (!peer) {
        log('Generate your ID first!');
        return;
    }
    const remoteId = remoteIdInput.value;
    conn = peer.connect(remoteId);
    conn.on('open', setupConnection);
}

export function disconnect() {
    if (conn) {
        conn.close();
    }
}

export function reconnect(){
    if (peer) {
        for (player of players) {
            peer.connect(player);
        }
    } else {
        log('No peer to reconnect!');
    }
}

export function sendMessage() {
    if (conn && conn.open) {
        const msg = document.getElementById('message').value;
        conn.send(msg);
        log('You: ' + msg);
    } else {
        log('Not connected!');
    }
}

export function generateId() {
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
    makeQR('qrcode', urlName + '?hostId=' + savedId);
}

export function emptyId(){
    savedId = null;
    window.localStorage.setItem('myPeerId', savedId);
    document.getElementById('my-id').value = savedId || '';
    unregisterSelf();
}

export function registerSelf() {
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

export function unregisterSelf() {
    if (peer) {
        peer.destroy();
        peer = null;
        conn = null;
    }
}