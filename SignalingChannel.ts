interface AntWebsocketResponse {
    command: "publish" | "start" | "takeConfiguration" | "takeCandidate" | "stop" | "play",
    streamId: string;
    token?: string;
    type?: "offer" | "answer";
    sdp?: string;
    candidate?: string;
    label?: string;
    id?: string;
}
type ChannelCallbackFn = (data?: AntWebsocketResponse) => void;

interface SignalingCallbacks {
    onopen: () => void;
    start: ChannelCallbackFn;
    takeCandidate: ChannelCallbackFn;
    takeConfiguration: ChannelCallbackFn;
    stop: ChannelCallbackFn;
}

export class SignalingChannel {
    private ws?: WebSocket;
    private callbacks: SignalingCallbacks;
    private isOpen: boolean = false;

    private url: string;

    isChannelOpen = () => {
        return this.isOpen;
    }

    constructor(url: string, callbacks: SignalingCallbacks) {
        this.url = url;
        this.callbacks = callbacks
    }

    open = () => {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onopen
        this.ws.onmessage = this.onmessage
        this.ws.onerror = this.onerror
    }

    onopen = () => {
        this.isOpen = true;
        this.callbacks.onopen();
    }

    onmessage = (event: WebSocketMessageEvent) => {
        const data = JSON.parse(event.data) as AntWebsocketResponse;
        console.log("command:", data.command, "data: ", event.data);
        if (data.command in this.callbacks) {
            this.callbacks[data.command as keyof SignalingCallbacks](data);
        }
    }

    onerror = (error: WebSocketErrorEvent) => {
        console.warn(error);
    }

    onclose = () => {
        console.info("websocket connection closed");
    }

    // Send json message to websocket signaling channel
    // https://ant-media-docs.readthedocs.io/en/latest/WebRTC-Developers.html#webrtc-websocket-messaging-details
    // signaling channel request (signaling details)
    sendJSON = (data: AntWebsocketResponse) => {
        this.ws?.send(JSON.stringify(data));
    }

    close = () => {
        console.info("closing websocket connection");
        this.ws?.close();
        this.ws = undefined;
    }

}