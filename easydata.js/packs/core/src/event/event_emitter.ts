import { EasyGuid } from '../utils/easy_guid';

interface EqEventCallback {
    id: string,
    callback: (event: EqEvent) => void
}

interface EqEventTypeRec {
    type: string,
    eventCallbacks: Array<EqEventCallback>
}

/**
 * Represents EasyQuery event type
 */
export interface EqEvent {

    /**
     * The type of the event
     */
    type: string,

    /**
     * The source of the event
     */
    source: any,

    /**
     * The additional data of the event
     */
    data?: any
}

/**
 * The representation of event emitter.
 */
export class EventEmitter {

    /**
     * The array of events.
     */
    protected events: EqEventTypeRec[];

    /**
     * The source.
     */
    protected source: any;

    private silentMode: number = 0;

    /**
     * The default constructor.
     * @param source The source.
     */
    constructor(source: any) {
        this.events  =  new Array<EqEventTypeRec>();
        this.source = source;
    }

    /**
     * Subscries to the event.
     * @param eventType The event type.
     * @param callback The callback.
     * @returns The subscribtion ID.
     */
    public subscribe(eventType: string, callback: (event: EqEvent) => void): string {
        let event = this.getEventRecByType(eventType);
        const eventCallback: EqEventCallback = {
            id: EasyGuid.newGuid(),
            callback: callback
        }

        if (event) {
            event.eventCallbacks.push(eventCallback);
        }
        else {
            event = {
                type: eventType,
                eventCallbacks: new Array(eventCallback)
            };

            this.events.push(event);
        }

        return eventCallback.id;
    }

    /**
     * Unsubsribes from the event.
     * @param eventType The event type.
     * @param callbackId The subscribtion ID.
     */
    public unsubscribe(eventType: string, callbackId: string) {
        let event = this.getEventRecByType(eventType);
        if (event) {
            let index: number = - 1;
            for(index = 0;index < event.eventCallbacks.length; index++) {
                if (event.eventCallbacks[index].id === callbackId) {
                    break;
                }
            }

            if (index >= 0){
                event.eventCallbacks.splice(index, 1);
            }
        }
    }

    /**
     * Fires the event.
     * @param eventType The event type.
     * @param data The event data.
     * @param postpone  The postpone.
     * @param force To fire force. If value is `true`, ignores silent mode.
     */
    public fire(eventType: string, data?: any, postpone = 0, force = false) {

        if (this.silentMode && !force) {
            return;
        }

        let eventRec = this.getEventRecByType(eventType);
        if (eventRec) {
            const eqevent: EqEvent = {
                type: eventType,
                source: this.source,
                data: data
            };
            
            let emitAllFunc = () => {
                for (let callback of eventRec.eventCallbacks) {
                    callback.callback(eqevent);
                }   
            } 

            if (postpone > 0) {
                setTimeout(emitAllFunc, postpone);
            }
            else {
                emitAllFunc();
            }
        }
    }

    /**
     * Enters to silent mode.
     */
    public enterSilentMode() {
        this.silentMode++;
    }

    /**
     * Exits from silent mode.
     */
    public exitSilentMode() {
        if (this.silentMode) {
            this.silentMode--;
        }
    }

    /**
     * Checks if emitter is in silent mode.
     * @return `true`, if silent mode is enable.
     */
    public isSilent() : boolean {
        return this.silentMode > 0;
    }

    private getEventRecByType(eventType: string): EqEventTypeRec | null {
        for (let event of this.events) {
            if (event.type == eventType) {
                return event;
            }
        }

        return null;
    }

}