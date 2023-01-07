import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomStringService {

  generate(lenght: number): string {
    let outString: string = '';
    let inOptions: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < lenght; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
  }

}
