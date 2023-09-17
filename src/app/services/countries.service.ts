import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Countries } from '../models/countries';
import { map } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private db: AngularFireDatabase) { }

  getAll(): Observable<Countries[]>{
    return this.db.list<Countries>("/countries")
              .snapshotChanges()
              .pipe(
                map(x => x.map((y:any) => ({ id: y.payload?.key, ...y.payload?.val() as Countries })))
              );
  }
}
