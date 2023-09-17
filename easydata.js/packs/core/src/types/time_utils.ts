
/**
 * Represents a date/time value that can return either a date itself or a special date name
 */
export class TimeValue {
    private date?: Date;
    private _name?: string;

    constructor(dt : Date | string) {
        if (dt instanceof Date) {   
            this.date = dt;
        }
        else {
            this._name = dt;
        }
    }

    public asTime(settings?: TimeSettings): Date {
        if (this.date) {
            return this.date;
        }
        else {
            specialDatesResolver.getDateByName(this._name);
        }
    }

    get name() : string {
        return this.name;
    }
}

export interface TimeSettings {
    timeZone?: number;
}

export class SpecialDatesResolver {
    public getDateByName(name: string, settings?: TimeSettings) {
        if (this[name]) {
            return this[name](settings);
        }
        else {
            return undefined;
        }
    }

    public Today(settings?: TimeSettings) : Date {
        return new Date();
    }


    public Yesterday(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
    }

    public Tomorrow(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    }

    public FirstDayOfMonth(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setDate(1);
        return d;
    }

    public LastDayOfMonth(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setMonth(d.getMonth() + 1, 0);
        return d;
    }

    public FirstDayOfNextMonth(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setMonth(d.getMonth() + 1, 1);
        return d;
    }

    public FirstDayOfPrevMonth(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setMonth(d.getMonth() - 1, 1);
        return d;
    }

    public FirstDayOfYear(settings?: TimeSettings) : Date {
        const d = new Date();
        d.setMonth(0, 1);
        return d;
    }

    public FirstDayOfPrevYear(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setFullYear(d.getFullYear() - 1, 0, 1);
        return d;
    }

    public FirstDayOfNextYear(settings?: TimeSettings) : Date {
        let d = new Date();
        d.setFullYear(d.getFullYear() + 1, 0, 1);
        return d;
    }

    public FirstDayOfWeek(settings?: TimeSettings) : Date {
        const d = new Date();
        let day = d.getDay();
        day = (day == 0) ? 6 : day - 1; //We start week from Monday, but js - from Sunday
        d.setDate(d.getDate() - day);
        return d;
    }

    public FirstDayOfPrevWeek(settings?: TimeSettings) : Date {
        let d = new Date();
        let day = d.getDay();
        day = (day == 0) ? 1 : 8 - day; //We start week from Monday, but js - from Sunday
        d.setDate(d.getDate() - day);
        return d;
    }

    public FirstDayOfNextWeek(settings?: TimeSettings) : Date {
        let d = new Date();
        var day = d.getDay();
        day = (day == 0) ? 1 : 8 - day; //We start week from Monday, but js - from Sunday
        d.setDate(d.getDate() + day);
        return d;
    }
}

var specialDatesResolver = new SpecialDatesResolver();

export function registerSpecialDatesResolver(resolver : SpecialDatesResolver)
{
    specialDatesResolver = resolver;
}
