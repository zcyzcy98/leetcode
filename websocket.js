let socket;
let reconnectInterval = 1000; // 初始重连间隔（1秒）
const maxReconnectInterval = 30000; // 最大重连间隔（30秒）
const reconnectAttempts = 10; // 最大重连尝试次数
let reconnectAttemptsCount = 0;

const pingInterval = 30000; // 每30秒发送一次心跳（ping）
const pongTimeout = 10000; // 如果10秒内没有收到 pong，则认为连接断开

let lastPongTime = Date.now(); // 记录最后一次收到 pong 消息的时间

function connectWebSocket() {
    socket = new WebSocket('ws://your-websocket-server-url');

    socket.onopen = function() {
        console.log("WebSocket连接成功！");
        reconnectAttemptsCount = 0; // 重置重连次数
        startHeartbeat(); // 启动心跳机制
    };

    socket.onmessage = function(event) {
        console.log("收到消息: ", event.data);
        if (event.data === "pong") {
            // 收到服务器返回的 pong 消息
            lastPongTime = Date.now();
        }
    };

    socket.onerror = function(event) {
        console.log("WebSocket发生错误：", event);
    };

    socket.onclose = function(event) {
        console.log("WebSocket连接关闭！", event);
        stopHeartbeat(); // 停止心跳
        handleReconnect();
    };
}

function handleReconnect() {
    if (reconnectAttemptsCount < reconnectAttempts) {
        setTimeout(() => {
            console.log(`正在尝试重新连接 WebSocket...第 ${reconnectAttemptsCount + 1} 次`);
            reconnectAttemptsCount++;
            reconnectInterval = Math.min(reconnectInterval * 2, maxReconnectInterval); // 指数回退
            connectWebSocket();
        }, reconnectInterval);
    } else {
        console.log("已达到最大重连尝试次数，停止重连");
    }
}

// 启动心跳机制
function startHeartbeat() {
    setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send("ping"); // 发送心跳（ping）消息
            console.log("发送ping消息");
        }
    }, pingInterval);
    
    // 检查是否超时
    setInterval(() => {
        if (Date.now() - lastPongTime > pongTimeout) {
            console.log("没有收到pong消息，尝试重连");
            socket.close(); // 关闭连接并触发重连
        }
    }, pongTimeout);
}

// 停止心跳机制
function stopHeartbeat() {
    // 如果有心跳机制的 interval 需要清除的话，可以在这里清除
    console.log("停止心跳机制");
}

// 初始连接
connectWebSocket();
