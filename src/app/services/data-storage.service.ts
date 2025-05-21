import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

    constructor() { }

    //Save
    public save(key: string, value: string) {

        localStorage.setItem(key, value);

    }

    //Save
    public saveObject(key: string, value: any) {

        const data: string = JSON.stringify(value);

        localStorage.setItem(key, data);

    }

    //Read
    public read(key: string): any {
        const data: any = localStorage.getItem(key);
        return data;
    }

    //Read
    public readDataAsJSON(key: string) {

        const data: any = localStorage.getItem(key);

        const json = JSON.parse(data);

        return json;
    }


}
